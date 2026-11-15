import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  Zap,
} from 'lucide-react';
import {
  CAMERA_ROOMS,
  CameraId,
  JumpscareSource,
  NIGHT_CONFIGS,
  NIGHT_DURATION_SECONDS,
  OFFICE_ASSETS,
  OfficeView,
  SECONDS_PER_HOUR,
  TELECHOBIS,
  TelechobiId,
} from '../types/game';
import { PHONE_CALLS } from '../data/phoneCallsAndLore';
import { CctvMonitor } from './CctvMonitor';
import { CobwebCorner, TelechobiMaskOverlay, TelechobiSprite } from './TelechobiArt';
import { soundEngine } from '../audio/soundEngine';

type EnemyLocation =
  | CameraId
  | 'left_door'
  | 'right_door'
  | 'hall_far'
  | 'hall_near'
  | 'office';

interface EnemyRuntime {
  id: TelechobiId;
  location: EnemyLocation;
  moveCooldown: number;
  attackTimer: number;
  bangedDoor: boolean;
}

interface HallEncounterState {
  enemyId: TelechobiId;
  phase: 'inspect' | 'flicker_out';
  timer: number;
}

interface OfficeGameplayProps {
  night: number;
  muted: boolean;
  onToggleMute: () => void;
  onNightWin: (remainingPower: number) => void;
  onJumpscare: (killer: TelechobiId, source: JumpscareSource, hoursSurvived: number) => void;
  onExitToMenu: () => void;
}

const ENEMY_IDS: TelechobiId[] = ['ton', 'toso', 'nita', 'tis'];

const HALL_CONFRONT_ANIM: Record<TelechobiId, string> = {
  ton: 'animate-hall-ton',
  toso: 'animate-hall-toso',
  nita: 'animate-hall-nita',
  tis: 'animate-hall-tis',
};

export function OfficeGameplay({
  night,
  muted,
  onToggleMute,
  onNightWin,
  onJumpscare,
  onExitToMenu,
}: OfficeGameplayProps) {
  const config = NIGHT_CONFIGS[night] || NIGHT_CONFIGS[1];
  const callScript = PHONE_CALLS[night] || null;

  // React HUD states
  const [view, setView] = useState<OfficeView>('center');
  const [leftDoorClosed, setLeftDoorClosed] = useState(false);
  const [rightDoorClosed, setRightDoorClosed] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [maskOn, setMaskOn] = useState(false);
  const [monitorOpen, setMonitorOpen] = useState(false);
  const [activeCam, setActiveCam] = useState<CameraId>('cam1');

  const [power, setPower] = useState(100);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [isBlackout, setIsBlackout] = useState(false);

  const [callActive, setCallActive] = useState<boolean>(Boolean(callScript));
  const [callSegmentIdx, setCallSegmentIdx] = useState<number>(0);
  const [voiceSpeaking, setVoiceSpeaking] = useState<boolean>(false);

  const [aimPos, setAimPos] = useState({ x: 50, y: 46 });
  const [cameraShake, setCameraShake] = useState(false);
  const [thudBanner, setThudBanner] = useState<string | null>(null);
  const [hallEncounter, setHallEncounter] = useState<HallEncounterState | null>(null);

  const [phoneFailed, setPhoneFailed] = useState(false);
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  const [lastRungCam, setLastRungCam] = useState<CameraId | null>(null);
  const [brokenCams, setBrokenCams] = useState<Partial<Record<CameraId, number>>>({});
  const [lensTension, setLensTension] = useState(0);

  const [enemyLocations, setEnemyLocations] = useState<Record<TelechobiId, EnemyLocation>>({
    ton: 'cam1',
    toso: 'cam1',
    nita: 'cam2',
    tis: 'cam3',
  });

  // Mutable simulation refs for 60fps loop
  const simRef = useRef({
    power: 100,
    elapsed: 0,
    callActive: Boolean(callScript),
    callSegmentIdx: 0,
    callSegStarted: false,
    callSegElapsed: 0,
    callSpeechSettled: false,
    callAmbushSfxFired: false,
    callAmbushAt: 0,
    leftDoorClosed: false,
    rightDoorClosed: false,
    flashlightOn: false,
    maskOn: false,
    monitorOpen: false,
    activeCam: 'cam1' as CameraId,
    isBlackout: false,
    blackoutTimer: 0,
    phoneFailed: false,
    phoneCooldown: 0,
    lensTension: 0,
    brokenCams: {} as Partial<Record<CameraId, number>>,
    hallEncounter: null as HallEncounterState | null,
    ended: false,
    enemies: {
      ton: { id: 'ton', location: 'cam1', moveCooldown: config.initialGraceSeconds, attackTimer: 0, bangedDoor: false },
      toso: { id: 'toso', location: 'cam1', moveCooldown: config.initialGraceSeconds * 1.25, attackTimer: 0, bangedDoor: false },
      nita: { id: 'nita', location: 'cam2', moveCooldown: config.initialGraceSeconds * 1.5, attackTimer: 0, bangedDoor: false },
      tis: { id: 'tis', location: 'cam3', moveCooldown: config.initialGraceSeconds * 1.75, attackTimer: 0, bangedDoor: false },
    } as Record<TelechobiId, EnemyRuntime>,
  });

  const viewRef = useRef<OfficeView>('center');
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const mutedRef = useRef(muted);
  useEffect(() => {
    mutedRef.current = muted;
    if (muted) {
      simRef.current.callSpeechSettled = true;
      setVoiceSpeaking(false);
    }
  }, [muted]);

  useEffect(() => {
    simRef.current.leftDoorClosed = leftDoorClosed;
  }, [leftDoorClosed]);

  useEffect(() => {
    simRef.current.rightDoorClosed = rightDoorClosed;
  }, [rightDoorClosed]);

  useEffect(() => {
    simRef.current.flashlightOn = flashlightOn;
  }, [flashlightOn]);

  useEffect(() => {
    simRef.current.maskOn = maskOn;
  }, [maskOn]);

  useEffect(() => {
    simRef.current.monitorOpen = monitorOpen;
  }, [monitorOpen]);

  useEffect(() => {
    simRef.current.activeCam = activeCam;
    simRef.current.lensTension = 0;
    setLensTension(0);
  }, [activeCam]);

  // Ambient audio on mount
  useEffect(() => {
    soundEngine.startAmbience('office');
    return () => {
      soundEngine.stopAmbience();
      soundEngine.stopMaskBreathing();
      soundEngine.stopPhoneVoice();
    };
  }, []);

  const handleSkipCall = useCallback(() => {
    if (!simRef.current.callActive) return;
    simRef.current.callActive = false;
    setCallActive(false);
    setVoiceSpeaking(false);
    soundEngine.playCallEndCue();
  }, []);

  const triggerThudNotice = useCallback((text: string) => {
    setThudBanner(text);
    setCameraShake(true);
    window.setTimeout(() => setCameraShake(false), 320);
    window.setTimeout(() => setThudBanner(null), 2200);
  }, []);

  const toggleLeftDoor = useCallback(() => {
    if (simRef.current.isBlackout || simRef.current.monitorOpen) return;
    setLeftDoorClosed((prev) => {
      const next = !prev;
      soundEngine.playDoorSlam(next);
      return next;
    });
  }, []);

  const toggleRightDoor = useCallback(() => {
    if (simRef.current.isBlackout || simRef.current.monitorOpen) return;
    setRightDoorClosed((prev) => {
      const next = !prev;
      soundEngine.playDoorSlam(next);
      return next;
    });
  }, []);

  const toggleMonitor = useCallback(() => {
    if (simRef.current.isBlackout || simRef.current.maskOn || viewRef.current !== 'center') return;
    setMonitorOpen((prev) => {
      const next = !prev;
      simRef.current.monitorOpen = next;
      soundEngine.playCameraSwitch();
      if (next) {
        simRef.current.flashlightOn = false;
        setFlashlightOn(false);
      }
      return next;
    });
  }, []);

  const toggleMask = useCallback(() => {
    if (simRef.current.isBlackout || simRef.current.monitorOpen || viewRef.current !== 'center') return;
    setMaskOn((prev) => {
      const next = !prev;
      simRef.current.maskOn = next;
      soundEngine.playMaskToggle(next);
      if (next) {
        simRef.current.monitorOpen = false;
        simRef.current.flashlightOn = false;
        setMonitorOpen(false);
        setFlashlightOn(false);
        setView('center');
        soundEngine.startMaskBreathing();
      } else {
        soundEngine.stopMaskBreathing();
      }
      return next;
    });
  }, []);

  const setFlashlightState = useCallback(
    (on: boolean) => {
      if (
        simRef.current.isBlackout ||
        simRef.current.monitorOpen ||
        simRef.current.maskOn ||
        view !== 'center'
      ) {
        if (simRef.current.flashlightOn) {
          setFlashlightOn(false);
        }
        return;
      }
      if (simRef.current.flashlightOn !== on) {
        soundEngine.playFlashlightClick(on);
        setFlashlightOn(on);
      }
    },
    [view]
  );

  // Turn off flashlight automatically if looking away from center hallway
  useEffect(() => {
    if (view !== 'center' && flashlightOn) {
      setFlashlightOn(false);
    }
  }, [view, flashlightOn]);

  // Keyboard controls
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat && (e.code === 'Space' || e.code === 'KeyF')) return;

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          if (!simRef.current.monitorOpen && !simRef.current.maskOn) {
            soundEngine.playLookTurn();
            setView((v) => (v === 'right' ? 'center' : 'left'));
          }
          break;
        case 'ArrowRight':
        case 'KeyD':
          if (!simRef.current.monitorOpen && !simRef.current.maskOn) {
            soundEngine.playLookTurn();
            setView((v) => (v === 'left' ? 'center' : 'right'));
          }
          break;
        case 'KeyW':
        case 'KeyS':
          e.preventDefault();
          if (viewRef.current === 'center') toggleMonitor();
          break;
        case 'KeyM':
          e.preventDefault();
          if (viewRef.current === 'center') toggleMask();
          break;
        case 'Space':
        case 'KeyF':
          e.preventDefault();
          setFlashlightState(true);
          break;
        case 'KeyQ':
          if (view === 'left') toggleLeftDoor();
          break;
        case 'KeyE':
          if (view === 'right') toggleRightDoor();
          break;
        default:
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyF') {
        setFlashlightState(false);
      }
    };

    const onBlur = () => {
      setFlashlightOn(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [toggleLeftDoor, toggleRightDoor, toggleMask, toggleMonitor, setFlashlightState, view]);

  // Telephone lure handler
  const handleRingPhone = useCallback((targetCam: CameraId) => {
    if (simRef.current.phoneFailed || simRef.current.phoneCooldown > 0) return;

    simRef.current.phoneCooldown = 6.5;
    setPhoneCooldown(6.5);
    setLastRungCam(targetCam);

    // Phone audio cannot fail until the night clock begins running after the call
    if (!simRef.current.callActive && Math.random() < 0.22 + night * 0.04) {
      simRef.current.phoneFailed = true;
      setPhoneFailed(true);
      soundEngine.playErrorBeep();
    }

    const targetRoom = CAMERA_ROOMS.find((r) => r.id === targetCam);
    if (!targetRoom) return;

    ENEMY_IDS.forEach((id) => {
      const enemy = simRef.current.enemies[id];
      if (enemy.location === 'hall_near' || enemy.location === 'office') return;

      if (
        enemy.location === 'left_door' ||
        enemy.location === 'right_door' ||
        enemy.location === 'hall_far'
      ) {
        if (Math.random() < 0.7) {
          enemy.location = targetCam;
          enemy.attackTimer = 0;
          enemy.moveCooldown = 4.5 + Math.random() * 3;
        }
        return;
      }

      if (enemy.location === targetCam) return;
      if (targetRoom.adjacent.includes(enemy.location as CameraId) || Math.random() < 0.65) {
        enemy.location = targetCam;
        enemy.moveCooldown = 3.5 + Math.random() * 2.5;
        soundEngine.playFootsteps('far');
      }
    });

    setEnemyLocations({
      ton: simRef.current.enemies.ton.location,
      toso: simRef.current.enemies.toso.location,
      nita: simRef.current.enemies.nita.location,
      tis: simRef.current.enemies.tis.location,
    });
  }, [night]);

  const handlePhoneRepaired = useCallback(() => {
    simRef.current.phoneFailed = false;
    simRef.current.phoneCooldown = 1.5;
    setPhoneFailed(false);
    setPhoneCooldown(1.5);
  }, []);

  // Main 60fps simulation loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let uiSyncAccum = 0;

    const advanceEnemyAI = (enemy: EnemyRuntime) => {
      const loc = enemy.location;

      if (Math.random() > config.aiAggression) {
        enemy.moveCooldown = config.moveIntervalSeconds * (0.65 + Math.random() * 0.55);
        return;
      }

      if (loc === 'hall_far') {
        enemy.location = 'hall_near';
        enemy.attackTimer = 0;
        soundEngine.playFootsteps('heavy');
        enemy.moveCooldown = config.moveIntervalSeconds;
        return;
      }

      if (loc === 'left_door' || loc === 'right_door' || loc === 'hall_near') {
        enemy.moveCooldown = 1.6;
        return;
      }

      const room = CAMERA_ROOMS.find((r) => r.id === loc);
      if (!room) return;

      // Mutual Exclusion Rule:
      // - Cannot enter left/right door while ANY enemy is in the central hallway (hall_far / hall_near / hallEncounter)
      // - Cannot enter central hallway (hall_far) while ANY enemy is at left/right door
      const someoneInHall =
        ENEMY_IDS.some((otherId) => {
          const l = simRef.current.enemies[otherId].location;
          return l === 'hall_far' || l === 'hall_near';
        }) || simRef.current.hallEncounter !== null;

      const someoneAtDoor = ENEMY_IDS.some((otherId) => {
        const l = simRef.current.enemies[otherId].location;
        return l === 'left_door' || l === 'right_door';
      });

      const options: EnemyLocation[] = [...room.adjacent];
      if (room.canReachLeftDoor && !someoneInHall) options.push('left_door');
      if (room.canReachRightDoor && !someoneInHall) options.push('right_door');
      if (room.canReachHallway && !someoneAtDoor && !someoneInHall) options.push('hall_far');

      // Bias toward advancing closer to doors or central hallway; all 4 enemies attack faster each night
      const forwardPool = options.filter((o) => o !== 'cam1');
      const forwardBias = night >= 5 ? 0.92 : night >= 3 ? 0.82 : 0.7;
      const pool = forwardPool.length > 0 && Math.random() < forwardBias ? forwardPool : options;
      const picked = pool[Math.floor(Math.random() * pool.length)];

      const activeSpecialCount = ENEMY_IDS.filter((otherId) => {
        const l = simRef.current.enemies[otherId].location;
        return l === 'left_door' || l === 'right_door' || l === 'hall_far' || l === 'hall_near';
      }).length;

      const isAttackSlot =
        picked === 'left_door' ||
        picked === 'right_door' ||
        picked === 'hall_far' ||
        picked === 'hall_near';

      if (!config.allowMultiThreat && isAttackSlot && activeSpecialCount >= 1) {
        // Pick a non-attack camera patrol option instead of stalling completely
        const cameraPool = options.filter(
          (o) => o !== 'left_door' && o !== 'right_door' && o !== 'hall_far'
        );
        if (cameraPool.length > 0) {
          const patrolPick = cameraPool[Math.floor(Math.random() * cameraPool.length)];
          if (patrolPick !== enemy.location) {
            enemy.location = patrolPick;
            soundEngine.playFootsteps('far');
          }
        }
        enemy.moveCooldown = config.moveIntervalSeconds * 0.75;
        return;
      }

      const occupiedSpecial = ENEMY_IDS.some(
        (otherId) =>
          otherId !== enemy.id &&
          isAttackSlot &&
          simRef.current.enemies[otherId].location === picked
      );

      if (!occupiedSpecial && picked !== enemy.location) {
        enemy.location = picked;
        enemy.attackTimer = 0;
        enemy.bangedDoor = false;

        if (picked === 'left_door' || picked === 'right_door') {
          soundEngine.playFootsteps('heavy');
        } else if (
          picked === 'hall_far' ||
          picked === 'cam4' ||
          picked === 'cam5' ||
          picked === 'cam6' ||
          picked === 'cam9'
        ) {
          soundEngine.playFootsteps('medium');
        } else {
          soundEngine.playFootsteps('far');
        }
      }
      enemy.moveCooldown = config.moveIntervalSeconds * (0.62 + Math.random() * 0.52);
    };

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);
      const s = simRef.current;

      if (s.ended) return;

      // 0. Alejandro Romero Phone Call Freeze:
      // Clock stays at 12:00 AM, power remains 100%, audio cannot fail, and enemies wait until call ends.
      if (s.callActive && callScript) {
        const seg = callScript.segments[s.callSegmentIdx];
        if (!seg) {
          s.callActive = false;
          setCallActive(false);
          setVoiceSpeaking(false);
          soundEngine.playCallEndCue();
          return;
        }

        if (!s.callSegStarted) {
          s.callSegStarted = true;
          s.callSegElapsed = 0;
          s.callSpeechSettled = false;
          s.callAmbushSfxFired = false;
          s.callAmbushAt = 0;
          setCallSegmentIdx(s.callSegmentIdx);

          const cue = seg.cue || 'voice';
          if (cue !== 'ton_ambush') {
            soundEngine.playPhoneCallCue(cue);
          }

          const startedVoice = soundEngine.speakPhoneSegment(seg.spokenText || seg.text, {
            delayMs: (seg.voiceDelaySec ?? 0) * 1000,
            pitch: seg.voicePitch,
            rate: seg.voiceRate,
            onStart: () => setVoiceSpeaking(true),
            onEnd: () => {
              setVoiceSpeaking(false);
              simRef.current.callSpeechSettled = true;
            },
          });

          if (!startedVoice) {
            setVoiceSpeaking(false);
            s.callSpeechSettled = true;
          }
        }

        s.callSegElapsed += dt;

        if (mutedRef.current || soundEngine.isMuted()) {
          s.callSpeechSettled = true;
        }

        const baseSegDur = Math.max(2.5, seg.endSec - seg.startSec);
        if (
          seg.cue === 'ton_ambush' &&
          !s.callAmbushSfxFired &&
          (s.callSpeechSettled || s.callSegElapsed >= 2.6)
        ) {
          s.callAmbushSfxFired = true;
          s.callAmbushAt = s.callSegElapsed;
          soundEngine.playPhoneCallCue('ton_ambush');
        }

        const minDisplaySec =
          seg.cue === 'ton_ambush'
            ? Math.max(baseSegDur, 4.2)
            : Math.max(3.0, baseSegDur * 0.72);
        const maxSafetySec = baseSegDur * 1.9 + 3.5;

        const ambushDone =
          seg.cue !== 'ton_ambush' || (s.callAmbushSfxFired && s.callSegElapsed - s.callAmbushAt >= 1.65);

        const readyToAdvance =
          (s.callSpeechSettled && s.callSegElapsed >= minDisplaySec && ambushDone) ||
          s.callSegElapsed >= maxSafetySec;

        if (readyToAdvance) {
          if (s.callSegmentIdx + 1 < callScript.segments.length) {
            s.callSegmentIdx += 1;
            s.callSegStarted = false;
            s.callSegElapsed = 0;
            s.callSpeechSettled = false;
            s.callAmbushSfxFired = false;
            s.callAmbushAt = 0;
          } else {
            s.callActive = false;
            setCallActive(false);
            setVoiceSpeaking(false);
            soundEngine.playCallEndCue();
          }
        }
        return;
      }

      // 1. Advance 6-minute real-time night clock
      s.elapsed += dt;
      if (s.elapsed >= NIGHT_DURATION_SECONDS) {
        s.ended = true;
        soundEngine.stopMaskBreathing();
        onNightWin(s.power);
        return;
      }

      // 2. Power drain calculation
      if (!s.isBlackout) {
        let drainPerSec = config.baseDrainPerSecond;
        if (s.leftDoorClosed) drainPerSec += 0.24;
        if (s.rightDoorClosed) drainPerSec += 0.24;
        if (s.monitorOpen) drainPerSec += 0.14;
        if (s.flashlightOn) drainPerSec += 0.62;

        s.power = Math.max(0, s.power - drainPerSec * dt);

        if (s.power <= 0) {
          s.isBlackout = true;
          s.leftDoorClosed = false;
          s.rightDoorClosed = false;
          s.flashlightOn = false;
          s.monitorOpen = false;
          s.maskOn = false;
          s.hallEncounter = null;
          setIsBlackout(true);
          setLeftDoorClosed(false);
          setRightDoorClosed(false);
          setFlashlightOn(false);
          setMonitorOpen(false);
          setMaskOn(false);
          setHallEncounter(null);
          soundEngine.stopAmbience();
          soundEngine.stopMaskBreathing();
          soundEngine.playBlackoutJingle();
        }
      } else {
        s.blackoutTimer += dt;
        if (s.blackoutTimer >= 6.5) {
          s.ended = true;
          const killer = ENEMY_IDS[Math.floor(Math.random() * ENEMY_IDS.length)];
          const source: JumpscareSource = Math.random() < 0.5 ? 'door' : 'hallway';
          const hours = Math.floor(s.elapsed / SECONDS_PER_HOUR);
          onJumpscare(killer, source, hours);
          return;
        }
      }

      // 3. Phone cooldown & random overload failures (only active after call ends)
      if (s.phoneCooldown > 0) {
        s.phoneCooldown = Math.max(0, s.phoneCooldown - dt);
      }
      if (!s.phoneFailed && Math.random() < config.phoneFailureRate * dt) {
        s.phoneFailed = true;
        setPhoneFailed(true);
        if (s.monitorOpen) soundEngine.playErrorBeep();
      }

      // 4. Camera lens staring mechanic (when monitor is open)
      let enemyChanged = false;
      if (s.monitorOpen && !s.isBlackout) {
        const camBroken = Boolean(s.brokenCams[s.activeCam] && s.brokenCams[s.activeCam]! > Date.now());
        const watchers = ENEMY_IDS.filter((id) => s.enemies[id].location === s.activeCam);
        if (watchers.length > 0 && !camBroken) {
          s.lensTension = Math.min(100, s.lensTension + (14 + night * 2.5) * dt);
          if (s.lensTension >= 100) {
            s.brokenCams = {
              ...s.brokenCams,
              [s.activeCam]: Date.now() + 18000,
            };
            s.lensTension = 0;
            soundEngine.playStaticBurst(0.55, 0.35);
            setBrokenCams({ ...s.brokenCams });
          }
        } else {
          s.lensTension = Math.max(0, s.lensTension - 25 * dt);
        }
      } else {
        s.lensTension = Math.max(0, s.lensTension - 30 * dt);
      }

      // 5. Dynamic Telechobi AI & Door/Hallway Attack Resolution
      for (const id of ENEMY_IDS) {
        const enemy = s.enemies[id];

        if (enemy.location === 'left_door') {
          enemy.attackTimer += dt;
          if (s.leftDoorClosed) {
            if (enemy.attackTimer >= 2.0 && !enemy.bangedDoor) {
              enemy.bangedDoor = true;
              soundEngine.playDoorThuds();
              triggerThudNotice(`${TELECHOBIS[id].name} golpeó la puerta izquierda y se retiró`);
              enemy.location = Math.random() < 0.5 ? 'cam2' : 'cam6';
              enemy.attackTimer = 0;
              enemy.moveCooldown = config.moveIntervalSeconds;
              enemyChanged = true;
            }
          } else if (enemy.attackTimer >= config.attackPatienceSeconds) {
            s.ended = true;
            soundEngine.stopMaskBreathing();
            onJumpscare(id, 'door', Math.floor(s.elapsed / SECONDS_PER_HOUR));
            return;
          }
        } else if (enemy.location === 'right_door') {
          enemy.attackTimer += dt;
          if (s.rightDoorClosed) {
            if (enemy.attackTimer >= 2.0 && !enemy.bangedDoor) {
              enemy.bangedDoor = true;
              soundEngine.playDoorThuds();
              triggerThudNotice(`${TELECHOBIS[id].name} golpeó la puerta derecha y se retiró`);
              enemy.location = Math.random() < 0.5 ? 'cam3' : 'cam4';
              enemy.attackTimer = 0;
              enemy.moveCooldown = config.moveIntervalSeconds;
              enemyChanged = true;
            }
          } else if (enemy.attackTimer >= config.attackPatienceSeconds) {
            s.ended = true;
            soundEngine.stopMaskBreathing();
            onJumpscare(id, 'door', Math.floor(s.elapsed / SECONDS_PER_HOUR));
            return;
          }
        } else if (enemy.location === 'hall_near') {
          if (s.maskOn) {
            if (!s.hallEncounter || s.hallEncounter.enemyId !== id) {
              s.hallEncounter = { enemyId: id, phase: 'inspect', timer: 0 };
              setHallEncounter({ ...s.hallEncounter });
              soundEngine.playHallFlicker();
            } else {
              s.hallEncounter.timer += dt;
              if (s.hallEncounter.phase === 'inspect' && s.hallEncounter.timer >= 1.85) {
                s.hallEncounter.phase = 'flicker_out';
                setHallEncounter({ ...s.hallEncounter });
              } else if (s.hallEncounter.timer >= 2.55) {
                s.hallEncounter = null;
                setHallEncounter(null);
                soundEngine.playFootsteps('medium');
                const retreatPool: CameraId[] = ['cam1', 'cam2', 'cam3', 'cam5'];
                enemy.location = retreatPool[Math.floor(Math.random() * retreatPool.length)];
                enemy.attackTimer = 0;
                enemy.moveCooldown = config.moveIntervalSeconds * 1.05;
                enemyChanged = true;
              }
            }
          } else {
            if (s.hallEncounter && s.hallEncounter.enemyId === id) {
              if (s.hallEncounter.phase === 'inspect') {
                s.ended = true;
                s.hallEncounter = null;
                setHallEncounter(null);
                soundEngine.stopMaskBreathing();
                onJumpscare(id, 'hallway', Math.floor(s.elapsed / SECONDS_PER_HOUR));
                return;
              } else {
                s.hallEncounter = null;
                setHallEncounter(null);
                enemy.location = 'cam5';
                enemy.attackTimer = 0;
                enemy.moveCooldown = config.moveIntervalSeconds;
                enemyChanged = true;
                continue;
              }
            }

            enemy.attackTimer += dt;
            if (enemy.attackTimer >= config.hallPatienceSeconds) {
              s.ended = true;
              soundEngine.stopMaskBreathing();
              onJumpscare(id, 'hallway', Math.floor(s.elapsed / SECONDS_PER_HOUR));
              return;
            }
          }
        } else {
          enemy.moveCooldown -= dt;
          if (enemy.moveCooldown <= 0) {
            advanceEnemyAI(enemy);
            enemyChanged = true;
          }
        }
      }

      // 6. Sync React HUD ~12 times/sec
      uiSyncAccum += dt;
      if (uiSyncAccum >= 0.08 || enemyChanged) {
        uiSyncAccum = 0;
        setPower(s.power);
        setElapsedSec(s.elapsed);
        setPhoneCooldown(s.phoneCooldown);
        setLensTension(s.lensTension);

        if (enemyChanged) {
          setEnemyLocations({
            ton: s.enemies.ton.location,
            toso: s.enemies.toso.location,
            nita: s.enemies.nita.location,
            tis: s.enemies.tis.location,
          });
        }
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [callScript, config, night, onJumpscare, onNightWin, triggerThudNotice]);

  // Derived Clock String (12:00 AM .. 5:59 AM)
  const currentHourIndex = Math.min(5, Math.floor(elapsedSec / SECONDS_PER_HOUR));
  const hourDisplay = currentHourIndex === 0 ? '12:00 AM' : `${currentHourIndex}:00 AM`;
  const minutesIntoHour = Math.floor(elapsedSec % SECONDS_PER_HOUR);
  const formattedClock =
    currentHourIndex === 0
      ? `12:${String(minutesIntoHour).padStart(2, '0')} AM`
      : `${currentHourIndex}:${String(minutesIntoHour).padStart(2, '0')} AM`;

  const usageBars =
    1 +
    (leftDoorClosed ? 1 : 0) +
    (rightDoorClosed ? 1 : 0) +
    (monitorOpen ? 1 : 0) +
    (flashlightOn ? 2 : 0);

  const leftDoorEnemy = ENEMY_IDS.find((id) => enemyLocations[id] === 'left_door') || null;
  const rightDoorEnemy = ENEMY_IDS.find((id) => enemyLocations[id] === 'right_door') || null;
  const hallwayNearEnemy = ENEMY_IDS.find((id) => enemyLocations[id] === 'hall_near') || null;
  const hallwayFarEnemy = ENEMY_IDS.find((id) => enemyLocations[id] === 'hall_far') || null;

  // Keep studio room acoustics, CRT buzz & threat sub-drone organically synced to visual state
  useEffect(() => {
    soundEngine.setOfficeState({
      monitorOpen,
      maskOn,
      nearbyThreat: Boolean(leftDoorEnemy || rightDoorEnemy || hallwayNearEnemy || hallwayFarEnemy),
      power,
    });
  }, [monitorOpen, maskOn, leftDoorEnemy, rightDoorEnemy, hallwayNearEnemy, hallwayFarEnemy, power]);

  return (
    <div
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setAimPos({ x, y });
      }}
      className={`relative w-screen h-screen bg-black overflow-hidden select-none ${
        cameraShake ? 'translate-x-1 -translate-y-1' : ''
      }`}
    >
      {/* ===================== 3-PANEL PANORAMIC OFFICE VIEWPORT ===================== */}
      <div
        className="relative w-[300vw] h-full flex transition-transform duration-200 ease-out"
        style={{
          transform:
            view === 'left'
              ? 'translateX(0vw)'
              : view === 'center'
                ? 'translateX(-100vw)'
                : 'translateX(-200vw)',
        }}
      >
        {/* ---------- PANEL 1: LEFT DOOR (Puerta Izquierda) ---------- */}
        <section className="relative w-screen h-full bg-[#040405] overflow-hidden flex items-center justify-center">
          {/* Unified dark office wall & ceiling darkness */}
          <img
            src={OFFICE_ASSETS.officeBg}
            alt="Lado izquierdo de la oficina abandonada"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover sepia-[.24] contrast-125 brightness-[0.14]"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 75% 75% at 58% 48%, transparent 25%, rgba(4,4,5,0.86) 75%, rgba(4,4,5,0.98) 100%)',
            }}
          />

          {/* Seamless Industrial Left Doorway organically framed into 1990s studio concrete */}
          <div className="relative w-[94vw] sm:w-[78vw] max-w-[700px] h-[94vh] overflow-hidden flex items-center justify-center">
            <img
              src={OFFICE_ASSETS.leftDoor}
              alt="Puerta izquierda de los estudios"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-all duration-150 ${
                isBlackout ? 'brightness-[0.06]' : 'brightness-[0.42] contrast-125 sepia-[.16]'
              }`}
              style={{
                maskImage:
                  'radial-gradient(ellipse 90% 94% at 52% 52%, black 58%, transparent 99%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 90% 94% at 52% 52%, black 58%, transparent 99%)',
              }}
            />

            {/* Integrated weathered side steel shutter rails */}
            <div className="pointer-events-none absolute inset-y-4 left-3 sm:left-7 w-2.5 bg-gradient-to-r from-[#2e261e] via-[#1c1712] to-[#0a0807] border-r border-black/80 opacity-85" />
            <div className="pointer-events-none absolute inset-y-4 right-3 sm:right-7 w-2.5 bg-gradient-to-l from-[#2e261e] via-[#1c1712] to-[#0a0807] border-l border-black/80 opacity-85" />

            {/* Overhead shutter housing & depth shadow */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(3,3,4,0.88) 0%, transparent 20%, transparent 80%, rgba(3,3,4,0.95) 100%)',
              }}
            />

            {!leftDoorClosed && leftDoorEnemy && !isBlackout && (
              <div className="pointer-events-none absolute inset-0 flex items-end justify-center">
                <div className="w-[74%] h-[82%] animate-pulse">
                  <TelechobiSprite id={leftDoorEnemy} variant="door" className="w-full h-full" />
                </div>
              </div>
            )}

            {/* Heavy weathered Rolling Steel Security Shutter (integrated into rails, no floating box) */}
            <div
              className={`absolute inset-x-4 sm:inset-x-8 top-0 bg-gradient-to-b from-[#23201c] via-[#181512] to-[#0e0c0a] border-x-[3px] border-b-[6px] border-[#382e23] shadow-[0_24px_65px_rgba(0,0,0,0.98)] transition-all duration-150 ease-in overflow-hidden ${
                leftDoorClosed ? 'h-full' : 'h-0'
              }`}
            >
              <CobwebCorner position="top-left" className="w-20 h-20 opacity-40" />
              <div
                className="w-full h-full flex flex-col justify-between pt-20 pb-8 px-5"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(180deg, rgba(255,244,220,0.04) 0px, rgba(255,244,220,0.04) 2px, rgba(0,0,0,0.45) 3px, transparent 4px, transparent 34px), radial-gradient(circle at 22% 35%, rgba(110,44,16,0.28), transparent 45%)',
                }}
              >
                <div className="h-1.5 bg-black/60" />
                <div className="text-center select-none">
                  <div className="font-display text-2xl sm:text-3xl tracking-[0.22em] text-amber-500/45 drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)]">
                    COMPUERTA 01 · FORO 4
                  </div>
                  <div className="font-mono-tech text-[10px] tracking-[0.35em] text-zinc-500/70 mt-1">
                    ACCESO PONIENTE CLAUSURADO
                  </div>
                </div>
                <div
                  className="h-4 w-full opacity-75 border-y border-black/90"
                  style={{
                    background:
                      'repeating-linear-gradient(-45deg, #b58618, #b58618 12px, #12100d 12px, #12100d 24px)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Wall-Mounted 1990s Left Electrical Box — integrated into concrete wall without HUD collisions */}
          <div className="absolute left-3 sm:left-7 top-[62px] sm:top-1/2 sm:-translate-y-1/2 z-30 flex flex-col items-center gap-1.5 bg-[#15120e]/95 border border-[#493b2d] p-2 shadow-[0_12px_30px_rgba(0,0,0,0.94),inset_0_1px_0_rgba(255,244,214,0.08)] overflow-hidden w-[118px] sm:w-[138px]">
            <CobwebCorner position="top-right" className="w-9 h-9 opacity-45" />
            <span className="font-mono-tech text-[9px] text-[#d6ccb4] tracking-wider font-bold text-center">
              CAJA ELÉCTRICA IZQ
            </span>
            <button
              type="button"
              disabled={isBlackout}
              onClick={toggleLeftDoor}
              className={`group relative w-full h-22 sm:h-26 border overflow-hidden flex flex-col items-center justify-end transition-all cursor-pointer bg-[#100e0b] ${
                leftDoorClosed
                  ? 'border-red-500/90 shadow-[0_0_20px_rgba(220,38,38,0.55)]'
                  : 'border-emerald-500/75 hover:border-amber-300'
              } ${isBlackout ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <img
                src={OFFICE_ASSETS.doorSwitchIcon}
                alt="Interruptor industrial de puerta izquierda"
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full object-cover transition-all ${
                  leftDoorClosed ? 'brightness-75 contrast-125' : 'brightness-90'
                }`}
                style={{
                  maskImage: 'radial-gradient(circle at 50% 42%, black 42%, transparent 95%)',
                  WebkitMaskImage: 'radial-gradient(circle at 50% 42%, black 42%, transparent 95%)',
                }}
              />
              <div
                className={`relative z-10 w-full py-1 font-display text-xs sm:text-sm tracking-wider text-center ${
                  leftDoorClosed
                    ? 'bg-red-950/90 text-red-100 border-t border-red-500/50'
                    : 'bg-emerald-950/90 text-emerald-100 border-t border-emerald-500/40'
                }`}
              >
                {leftDoorClosed ? 'ABRIR [Q]' : 'CERRAR [Q]'}
              </div>
            </button>
            <span className="font-mono-tech text-[9px] text-[#c5b999]">
              {leftDoorClosed ? 'SELLADA' : 'ABIERTA'}
            </span>
          </div>
        </section>

        {/* ---------- PANEL 2: CENTER OFFICE & CENTRAL HALLWAY ---------- */}
        <section className="relative w-screen h-full bg-[#040405] overflow-hidden flex items-center justify-center">
          <img
            src={OFFICE_ASSETS.officeBg}
            alt="Oficina de producción abandonada TV Azteca"
            referrerPolicy="no-referrer"
            className={`absolute inset-0 w-full h-full object-cover sepia-[.22] transition-all duration-300 ${
              isBlackout
                ? 'brightness-[0.03]'
                : flashlightOn
                  ? 'brightness-[0.3] contrast-125'
                  : 'brightness-[0.17] contrast-125'
            }`}
          />

          {/* Unified overhead tungsten ambient studio glow & darkness wrap */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 68% 60% at 50% 42%, transparent 15%, rgba(4,4,5,0.72) 66%, rgba(4,4,5,0.96) 100%)',
            }}
          />

          {/* Torn 1998 Telechobis Poster organically adhered to decaying office wall */}
          <div className="pointer-events-none hidden md:block absolute top-16 left-[6%] w-32 rotate-[-4deg] opacity-65">
            <img
              src={OFFICE_ASSETS.poster}
              alt="Póster rasgado de TeLeChOBiS"
              referrerPolicy="no-referrer"
              className="w-full h-40 object-cover grayscale-[40%] sepia-[.25] brightness-70 contrast-125"
              style={{
                maskImage: 'radial-gradient(ellipse 84% 88% at 50% 50%, black 58%, transparent 100%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 84% 88% at 50% 50%, black 58%, transparent 100%)',
              }}
            />
          </div>

          {/* Central Dark Hallway seamlessly integrated into office architecture */}
          <div
            onMouseDown={() => setFlashlightState(true)}
            onMouseUp={() => setFlashlightState(false)}
            onMouseLeave={() => setFlashlightState(false)}
            onTouchStart={() => setFlashlightState(true)}
            onTouchEnd={() => setFlashlightState(false)}
            className="relative w-[96vw] sm:w-[86vw] max-w-[800px] h-[86vh] -mt-8 overflow-hidden cursor-crosshair"
            style={{
              maskImage:
                'radial-gradient(ellipse 92% 94% at 50% 50%, black 56%, transparent 98%)',
              WebkitMaskImage:
                'radial-gradient(ellipse 92% 94% at 50% 50%, black 56%, transparent 98%)',
            }}
          >
            <img
              src={OFFICE_ASSETS.hallway}
              alt="Pasillo central oscuro hacia el escritorio"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover brightness-[0.88] contrast-125 sepia-[.12]"
            />

            {/* Telechobi standing in hallway (hidden during full-desk confrontation overlay) */}
            {!hallEncounter && (hallwayNearEnemy || hallwayFarEnemy) && (
              <div
                className={`pointer-events-none absolute inset-0 flex items-end justify-center transition-all duration-150 ${
                  hallwayNearEnemy
                    ? 'scale-105 translate-y-4'
                    : 'scale-[0.44] -translate-y-12 opacity-90'
                }`}
              >
                <TelechobiSprite
                  id={(hallwayNearEnemy || hallwayFarEnemy)!}
                  variant="hallway"
                  twitchState={hallwayNearEnemy ? 2 : 0}
                  className="h-[90%] w-auto"
                />
              </div>
            )}

            {/* Dynamic Darkness & Long-Range Flashlight Beam */}
            <div
              className="pointer-events-none absolute inset-0 transition-opacity duration-75"
              style={{
                background: isBlackout
                  ? 'rgba(0, 0, 0, 0.97)'
                  : flashlightOn
                    ? `radial-gradient(circle 250px at ${aimPos.x}% ${aimPos.y}%, rgba(255,244,214,0.06) 0%, rgba(255,240,200,0.18) 28%, rgba(0,0,0,0.88) 66%, rgba(0,0,0,0.98) 100%)`
                    : 'radial-gradient(circle at 50% 45%, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.97) 72%, rgba(0,0,0,1) 100%)',
              }}
            />

            {!flashlightOn && !isBlackout && !hallEncounter && (
              <div className="pointer-events-none absolute inset-x-0 bottom-14 text-center font-mono-tech text-[11px] text-zinc-400/75 px-4">
                Mantén [ESPACIO] o haz clic en el pasillo para encender la linterna
              </div>
            )}
          </div>

          {/* Foreground Cluttered Production Desk (Betacam tapes + organically feathered Mask Prop) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#030303] via-[#0e0c0a]/95 to-transparent border-t border-[#2b231b]/70 flex items-end justify-between px-8 pb-4">
            <div className="hidden sm:flex items-end gap-2 opacity-75">
              <div className="w-20 h-7 bg-[#17130f] border border-[#3d3126] px-2 flex items-center text-[9px] font-mono-tech text-[#c9bfa4]">
                BETACAM-98
              </div>
              <div className="w-20 h-6 bg-[#17130f] border border-[#3d3126] rotate-[-6deg] px-2 flex items-center text-[9px] font-mono-tech text-amber-400/75">
                PILOTO #04
              </div>
            </div>

            {/* Clickable 1990s Cobwebbed Hollow Mask Prop sitting naturally in desk shadow */}
            <button
              type="button"
              onClick={toggleMask}
              title="Colocarse máscara de Telechobi (M)"
              className="pointer-events-auto group relative flex flex-col items-center cursor-pointer focus-visible:outline-none"
            >
              <div className="w-32 h-24 overflow-hidden flex items-center justify-center transition-transform group-hover:-translate-y-1">
                <img
                  src={OFFICE_ASSETS.maskPropIcon}
                  alt="Máscara abandonada de Telechobi sobre el escritorio"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover brightness-90 contrast-115 group-hover:brightness-110 transition-all"
                  style={{
                    maskImage: 'radial-gradient(ellipse 68% 66% at 50% 54%, black 42%, transparent 96%)',
                    WebkitMaskImage:
                      'radial-gradient(ellipse 68% 66% at 50% 54%, black 42%, transparent 96%)',
                  }}
                />
              </div>
              <span className="-mt-1 font-mono-tech text-[10px] text-[#c9bfa4] group-hover:text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                MÁSCARA [M]
              </span>
            </button>
          </div>
        </section>

        {/* ---------- PANEL 3: RIGHT DOOR (Puerta Derecha) ---------- */}
        <section className="relative w-screen h-full bg-[#040405] overflow-hidden flex items-center justify-center">
          <img
            src={OFFICE_ASSETS.officeBg}
            alt="Lado derecho de la oficina abandonada"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover sepia-[.24] contrast-125 brightness-[0.14] scale-x-[-1]"
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 75% 75% at 42% 48%, transparent 25%, rgba(4,4,5,0.86) 75%, rgba(4,4,5,0.98) 100%)',
            }}
          />

          {/* Seamless Industrial Right Doorway organically framed into 1990s studio concrete */}
          <div className="relative w-[94vw] sm:w-[78vw] max-w-[700px] h-[94vh] overflow-hidden flex items-center justify-center">
            <img
              src={OFFICE_ASSETS.rightDoor}
              alt="Puerta derecha de los estudios"
              referrerPolicy="no-referrer"
              className={`w-full h-full object-cover transition-all duration-150 ${
                isBlackout ? 'brightness-[0.06]' : 'brightness-[0.42] contrast-125 sepia-[.16]'
              }`}
              style={{
                maskImage:
                  'radial-gradient(ellipse 90% 94% at 48% 52%, black 58%, transparent 99%)',
                WebkitMaskImage:
                  'radial-gradient(ellipse 90% 94% at 48% 52%, black 58%, transparent 99%)',
              }}
            />

            <div className="pointer-events-none absolute inset-y-4 left-3 sm:left-7 w-2.5 bg-gradient-to-r from-[#2e261e] via-[#1c1712] to-[#0a0807] border-r border-black/80 opacity-85" />
            <div className="pointer-events-none absolute inset-y-4 right-3 sm:right-7 w-2.5 bg-gradient-to-l from-[#2e261e] via-[#1c1712] to-[#0a0807] border-l border-black/80 opacity-85" />

            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'linear-gradient(to bottom, rgba(3,3,4,0.88) 0%, transparent 20%, transparent 80%, rgba(3,3,4,0.95) 100%)',
              }}
            />

            {!rightDoorClosed && rightDoorEnemy && !isBlackout && (
              <div className="pointer-events-none absolute inset-0 flex items-end justify-center">
                <div className="w-[74%] h-[82%] animate-pulse">
                  <TelechobiSprite id={rightDoorEnemy} variant="door" className="w-full h-full" />
                </div>
              </div>
            )}

            {/* Heavy weathered Rolling Steel Security Shutter */}
            <div
              className={`absolute inset-x-4 sm:inset-x-8 top-0 bg-gradient-to-b from-[#23201c] via-[#181512] to-[#0e0c0a] border-x-[3px] border-b-[6px] border-[#382e23] shadow-[0_24px_65px_rgba(0,0,0,0.98)] transition-all duration-150 ease-in overflow-hidden ${
                rightDoorClosed ? 'h-full' : 'h-0'
              }`}
            >
              <CobwebCorner position="top-right" className="w-20 h-20 opacity-40" />
              <div
                className="w-full h-full flex flex-col justify-between pt-20 pb-8 px-5"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(180deg, rgba(255,244,220,0.04) 0px, rgba(255,244,220,0.04) 2px, rgba(0,0,0,0.45) 3px, transparent 4px, transparent 34px), radial-gradient(circle at 78% 35%, rgba(110,44,16,0.28), transparent 45%)',
                }}
              >
                <div className="h-1.5 bg-black/60" />
                <div className="text-center select-none">
                  <div className="font-display text-2xl sm:text-3xl tracking-[0.22em] text-amber-500/45 drop-shadow-[0_1px_1px_rgba(0,0,0,0.95)]">
                    COMPUERTA 02 · EDICIÓN
                  </div>
                  <div className="font-mono-tech text-[10px] tracking-[0.35em] text-zinc-500/70 mt-1">
                    ACCESO ORIENTE CLAUSURADO
                  </div>
                </div>
                <div
                  className="h-4 w-full opacity-75 border-y border-black/90"
                  style={{
                    background:
                      'repeating-linear-gradient(-45deg, #b58618, #b58618 12px, #12100d 12px, #12100d 24px)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Wall-Mounted 1990s Right Electrical Box — integrated below clock with zero collision */}
          <div className="absolute right-3 sm:right-7 top-[92px] sm:top-1/2 sm:-translate-y-1/2 z-30 flex flex-col items-center gap-1.5 bg-[#15120e]/95 border border-[#493b2d] p-2 shadow-[0_12px_30px_rgba(0,0,0,0.94),inset_0_1px_0_rgba(255,244,214,0.08)] overflow-hidden w-[118px] sm:w-[138px]">
            <CobwebCorner position="top-left" className="w-9 h-9 opacity-45" />
            <span className="font-mono-tech text-[9px] text-[#d6ccb4] tracking-wider font-bold text-center">
              CAJA ELÉCTRICA DER
            </span>
            <button
              type="button"
              disabled={isBlackout}
              onClick={toggleRightDoor}
              className={`group relative w-full h-22 sm:h-26 border overflow-hidden flex flex-col items-center justify-end transition-all cursor-pointer bg-[#100e0b] ${
                rightDoorClosed
                  ? 'border-red-500/90 shadow-[0_0_20px_rgba(220,38,38,0.55)]'
                  : 'border-emerald-500/75 hover:border-amber-300'
              } ${isBlackout ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <img
                src={OFFICE_ASSETS.doorSwitchIcon}
                alt="Interruptor industrial de puerta derecha"
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full object-cover transition-all ${
                  rightDoorClosed ? 'brightness-75 contrast-125' : 'brightness-90'
                }`}
                style={{
                  maskImage: 'radial-gradient(circle at 50% 42%, black 42%, transparent 95%)',
                  WebkitMaskImage: 'radial-gradient(circle at 50% 42%, black 42%, transparent 95%)',
                }}
              />
              <div
                className={`relative z-10 w-full py-1 font-display text-xs sm:text-sm tracking-wider text-center ${
                  rightDoorClosed
                    ? 'bg-red-950/90 text-red-100 border-t border-red-500/50'
                    : 'bg-emerald-950/90 text-emerald-100 border-t border-emerald-500/40'
                }`}
              >
                {rightDoorClosed ? 'ABRIR [E]' : 'CERRAR [E]'}
              </div>
            </button>
            <span className="font-mono-tech text-[9px] text-[#c5b999]">
              {rightDoorClosed ? 'SELLADA' : 'ABIERTA'}
            </span>
          </div>
        </section>
      </div>

      {/* ===================== IN-FRONT-OF-DESK HALLWAY CONFRONTATION + FLICKER ===================== */}
      {hallEncounter && (
        <div className="pointer-events-none fixed inset-0 z-[35] flex items-end justify-center overflow-hidden">
          {/* Office Light Flicker Darkness Pulse */}
          <div className="absolute inset-0 bg-black animate-room-flicker" />

          {/* Unique Per-Enemy Animation right in front of the desk, then Flicker-Out disappearance */}
          <div
            className={`relative h-[88vh] w-auto flex items-end justify-center ${
              hallEncounter.phase === 'flicker_out'
                ? 'animate-hall-flicker-out'
                : HALL_CONFRONT_ANIM[hallEncounter.enemyId]
            }`}
          >
            <TelechobiSprite
              id={hallEncounter.enemyId}
              variant="hall_confront"
              className="h-[88vh] w-auto"
            />
          </div>
        </div>
      )}

      {/* ===================== FIRST-PERSON TELECHOBI MASK OVERLAY ===================== */}
      <TelechobiMaskOverlay active={maskOn} />

      {/* ===================== CCTV MONITOR OVERLAY (1990s Mexico CRT) ===================== */}
      {monitorOpen && !isBlackout && (
        <CctvMonitor
          activeCam={activeCam}
          onSelectCam={setActiveCam}
          enemyRooms={enemyLocations}
          brokenCams={brokenCams}
          lensTension={lensTension}
          phoneFailed={phoneFailed}
          phoneCooldown={phoneCooldown}
          lastRungCam={lastRungCam}
          formattedClock={formattedClock}
          onRingPhone={handleRingPhone}
          onPhoneSystemRepaired={handlePhoneRepaired}
        />
      )}

      {/* ===================== BLACKOUT SCREEN OVERLAY ===================== */}
      {isBlackout && (
        <div className="pointer-events-none fixed inset-0 z-20 bg-black/75 flex items-center justify-center">
          <div className="text-center space-y-2">
            <p className="font-mono-tech text-sm text-red-500 tracking-widest">
              APAGÓN ELÉCTRICO · 0% ENERGÍA
            </p>
            <p className="font-mono-tech text-xs text-zinc-500">
              Se escucha música infantil distorsionada en la oscuridad...
            </p>
          </div>
        </div>
      )}

      {/* ===================== COHESIVE 1990s WEATHERED HUD ===================== */}
      <div className="pointer-events-none fixed top-0 inset-x-0 z-50 flex items-start justify-between px-4 sm:px-5 pt-3.5">
        <div className="pointer-events-auto flex flex-col items-start gap-2">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Activar audio' : 'Silenciar audio'}
            className="p-2 rust-panel-90s border text-[#d6ccb4] hover:text-white cursor-pointer"
          >
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Compact 1990s Rusted & Cobwebbed Close Cameras Switch in Top-Left HUD */}
          {monitorOpen && !isBlackout && (
            <button
              type="button"
              onClick={toggleMonitor}
              title="Cerrar cámaras (W / S)"
              className="tactile-keycap-90s relative overflow-hidden pr-3.5 pl-12 py-2 rust-panel-90s border-2 text-[#e6dec8] hover:border-red-400 font-mono-tech text-[11px] font-bold tracking-wider flex items-center cursor-pointer transition-colors"
            >
              <img
                src={OFFICE_ASSETS.closeCamerasIcon}
                alt="Interruptor oxidado para cerrar cámaras"
                referrerPolicy="no-referrer"
                className="pointer-events-none absolute left-0 inset-y-0 w-12 h-full object-cover opacity-80"
                style={{
                  maskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                }}
              />
              <span className="relative z-10">CERRAR CÁMARAS [W]</span>
            </button>
          )}
        </div>

        {/* Clock & Night Readout (1990s Rusted Bezel) */}
        <div className="relative text-right rust-panel-90s px-4 py-2 border overflow-hidden">
          <CobwebCorner position="top-right" className="w-10 h-10 opacity-45" />
          <div className="font-display text-3xl leading-none text-[#efe7d2] tabular-nums">
            {hourDisplay}
          </div>
          <div className="font-mono-tech text-[11px] text-[#b8ae95] mt-1">
            NOCHE {night} · {formattedClock}
            {callActive && <span className="text-amber-300"> · EN PAUSA</span>}
          </div>
        </div>
      </div>

      {/* Alejandro Romero Answering Machine / Live Call Subtitle Bar (Nights 1-5) */}
      {callActive && callScript && !isBlackout && (
        <div
          className={`pointer-events-none fixed left-1/2 -translate-x-1/2 z-[45] w-[94vw] md:max-w-[calc(100vw-440px)] lg:max-w-[560px] ${
            monitorOpen
              ? 'bottom-[88px] md:bottom-3'
              : view !== 'center'
                ? 'bottom-[136px] md:bottom-auto md:top-3.5'
                : 'top-[84px] md:top-3.5'
          }`}
        >
          <div
            className={`pointer-events-auto border px-3 py-2 shadow-[0_12px_32px_rgba(0,0,0,0.95)] ${
              night === 5 && callScript.segments[callSegmentIdx]?.cue === 'ton_ambush'
                ? 'bg-[#2a0c0a]/95 border-red-500'
                : 'bg-[#12100c]/95 border-amber-500/65'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <PhoneCall className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                <span className="font-mono-tech text-[9px] sm:text-[10px] font-bold text-amber-300 truncate">
                  {callScript.callerLabel}
                </span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 border font-mono-tech text-[9px] ${
                    muted
                      ? 'bg-[#1a1510] border-[#4b3e30] text-[#8d826b]'
                      : voiceSpeaking
                        ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-300'
                        : 'bg-[#1d1710] border-[#5b4b38] text-amber-200/80'
                  }`}
                >
                  {muted ? <VolumeX className="w-2.5 h-2.5" /> : <Volume2 className="w-2.5 h-2.5" />}
                  <span className="sm:hidden">
                    {muted ? 'MUDO' : voiceSpeaking ? 'VOZ' : 'AUDIO'}
                  </span>
                  <span className="hidden sm:inline">
                    {muted ? 'VOZ SILENCIADA' : voiceSpeaking ? 'VOZ ACTIVA' : 'CONECTANDO'}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={handleSkipCall}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#29221a] border border-[#6b5842] hover:border-amber-300 text-[10px] font-mono-tech font-bold text-[#efe7d2] cursor-pointer shrink-0"
                >
                  <PhoneOff className="w-3 h-3" />
                  <span>SALTAR LLAMADA</span>
                </button>
              </div>
            </div>

            <p className="text-[11px] sm:text-xs text-[#f0e9d6] leading-snug">
              <strong className="text-amber-300 font-mono-tech text-[10px] mr-1.5">
                {callScript.segments[callSegmentIdx]?.speaker}:
              </strong>
              {callScript.segments[callSegmentIdx]?.text}
            </p>

            <p className="mt-1 font-mono-tech text-[9px] text-[#9e947d]">
              El reloj, la batería y el sistema de audio iniciarán al terminar la llamada.
            </p>
          </div>
        </div>
      )}

      {/* Door Thud / Alert Feedback Banner — anchored safely above bottom HUD dock */}
      {thudBanner && (
        <div className="pointer-events-none fixed bottom-[96px] sm:bottom-[104px] left-1/2 -translate-x-1/2 z-50 rust-panel-90s border-2 border-amber-500/75 px-4 py-2 font-mono-tech text-xs text-amber-200 tracking-wide whitespace-nowrap max-w-[92vw] truncate shadow-[0_10px_28px_rgba(0,0,0,0.95)]">
          {thudBanner}
        </div>
      )}

      {/* Left / Right Turn Arrows (Disabled while Mask or Monitor is active) */}
      {!monitorOpen && !maskOn && view !== 'left' && (
        <button
          type="button"
          onClick={() => {
            soundEngine.playLookTurn();
            setView(view === 'right' ? 'center' : 'left');
          }}
          aria-label="Mirar a la izquierda"
          className="fixed left-3 top-1/2 -translate-y-1/2 z-40 w-11 sm:w-12 h-24 sm:h-28 rust-panel-90s border-2 text-[#dfd5bd] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {!monitorOpen && !maskOn && view !== 'right' && (
        <button
          type="button"
          onClick={() => {
            soundEngine.playLookTurn();
            setView(view === 'left' ? 'center' : 'right');
          }}
          aria-label="Mirar a la derecha"
          className="fixed right-3 top-1/2 -translate-y-1/2 z-40 w-11 sm:w-12 h-24 sm:h-28 rust-panel-90s border-2 text-[#dfd5bd] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}

      {/* Bottom HUD: Battery Meter & 1990s Organically Blended Control Dock */}
      <div className="pointer-events-none fixed bottom-3 inset-x-0 z-50 px-3 sm:px-5 flex flex-wrap items-end justify-between gap-2.5 sm:gap-3">
        {/* Electrical Battery & Consumption */}
        <div className="relative rust-panel-90s border-2 px-3.5 sm:px-4 py-2 min-w-[185px] sm:min-w-[200px] overflow-hidden">
          <CobwebCorner position="bottom-left" className="w-10 h-10 opacity-45" />
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono-tech text-xs text-[#c9bfa4] inline-flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              ENERGÍA
            </span>
            <span
              className={`font-mono-tech text-lg font-bold tabular-nums ${
                power < 20 ? 'text-red-400' : 'text-[#efe7d2]'
              }`}
            >
              {Math.ceil(power)}%
            </span>
          </div>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="font-mono-tech text-[10px] text-[#a39982] mr-1">USO:</span>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className={`h-2.5 w-4 border border-[#4d3d30] ${
                  lvl <= usageBars
                    ? lvl >= 4
                      ? 'bg-red-500'
                      : lvl === 3
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                    : 'bg-[#12100d]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Cohesive 1990s Controls (Mask, Flashlight, Cameras - ONLY in Central Office) */}
        {!monitorOpen && !isBlackout && (
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5 mx-auto sm:mx-0">
            {view === 'center' ? (
              <>
                <button
                  type="button"
                  onClick={toggleMask}
                  className={`relative overflow-hidden pr-3.5 pl-11 sm:pl-12 py-2.5 font-mono-tech text-[11px] sm:text-xs font-bold border-2 transition-all cursor-pointer flex items-center ${
                    maskOn
                      ? 'bg-[#3d2d12] text-amber-200 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.45)]'
                      : 'rust-panel-90s text-[#e6dec8] hover:border-amber-400'
                  }`}
                >
                  <img
                    src={OFFICE_ASSETS.maskPropIcon}
                    alt="Máscara de Telechobi"
                    referrerPolicy="no-referrer"
                    className="pointer-events-none absolute left-0 inset-y-0 w-12 h-full object-cover opacity-85"
                    style={{
                      maskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                    }}
                  />
                  <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {maskOn ? 'QUITAR MÁSCARA [M]' : 'MÁSCARA [M]'}
                  </span>
                </button>

                {!maskOn && (
                  <>
                    <button
                      type="button"
                      onMouseDown={() => setFlashlightState(true)}
                      onMouseUp={() => setFlashlightState(false)}
                      onMouseLeave={() => setFlashlightState(false)}
                      onTouchStart={() => setFlashlightState(true)}
                      onTouchEnd={() => setFlashlightState(false)}
                      className={`relative overflow-hidden pr-3.5 pl-11 sm:pl-12 py-2.5 font-mono-tech text-[11px] sm:text-xs font-bold border-2 transition-all cursor-pointer flex items-center ${
                        flashlightOn
                          ? 'bg-[#3d3115] text-amber-100 border-amber-300 shadow-[0_0_22px_rgba(251,191,36,0.45)]'
                          : 'rust-panel-90s text-[#e6dec8] hover:border-amber-300'
                      }`}
                    >
                      <img
                        src={OFFICE_ASSETS.flashlightIcon}
                        alt="Linterna oxidada de 1990"
                        referrerPolicy="no-referrer"
                        className="pointer-events-none absolute left-0 inset-y-0 w-12 h-full object-cover opacity-85"
                        style={{
                          maskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                          WebkitMaskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                        }}
                      />
                      <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        LINTERNA [ESPACIO]
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleMonitor}
                      className="relative overflow-hidden pr-3.5 pl-11 sm:pl-12 py-2.5 font-mono-tech text-[11px] sm:text-xs font-bold rust-panel-90s border-2 text-[#dfd5bd] hover:border-amber-400 transition-colors cursor-pointer flex items-center"
                    >
                      <img
                        src={OFFICE_ASSETS.camerasIcon}
                        alt="Cámaras de seguridad 1990"
                        referrerPolicy="no-referrer"
                        className="pointer-events-none absolute left-0 inset-y-0 w-12 h-full object-cover opacity-85"
                        style={{
                          maskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                          WebkitMaskImage: 'linear-gradient(to right, black 35%, transparent 100%)',
                        }}
                      />
                      <span className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        CÁMARAS [W]
                      </span>
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="px-4 py-2 rust-panel-90s border font-mono-tech text-[11px] sm:text-xs text-[#c9bfa4]">
                Vuelve a la oficina central para usar Cámaras o Máscara
              </div>
            )}
          </div>
        )}
      </div>

      {/* Subtle analog CRT Vignette */}
      <div className="pointer-events-none fixed inset-0 z-30 crt-vignette opacity-55" />
    </div>
  );
}
