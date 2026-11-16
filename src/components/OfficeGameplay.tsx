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
  ALL_ENEMY_IDS,
  CAMERA_ROOMS,
  CLASSIC_ENEMY_IDS,
  CameraId,
  CustomNightLaunchConfig,
  DEFAULT_AI_LEVELS,
  DEFAULT_CHEATS,
  JumpscareSource,
  NIGHT7_ENEMY_IDS,
  NIGHT_CONFIGS,
  OFFICE_ASSETS,
  OfficeView,
  TELECHOBIS,
  TelechobiId,
} from '../types/game';
import { PHONE_CALLS } from '../data/phoneCallsAndLore';
import { CctvMonitor } from './CctvMonitor';
import {
  CobwebCorner,
  FirstPersonHandOverlay,
  TelechobiMaskOverlay,
  TelechobiSprite,
} from './TelechobiArt';
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
  launchConfig?: CustomNightLaunchConfig;
  muted: boolean;
  onToggleMute: () => void;
  onNightWin: (remainingPower: number) => void;
  onJumpscare: (killer: TelechobiId, source: JumpscareSource, hoursSurvived: number) => void;
  onExitToMenu: () => void;
}

const ENEMY_IDS: TelechobiId[] = ALL_ENEMY_IDS;

function buildShuffledVentQueue(allowedIds: TelechobiId[] = CLASSIC_ENEMY_IDS): TelechobiId[] {
  const arr = allowedIds.filter((id) => id !== 'charro' && id !== 'champi');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function buildShuffledNight7Queue(avoidFirst?: TelechobiId | null): TelechobiId[] {
  const arr: TelechobiId[] = [...NIGHT7_ENEMY_IDS];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (avoidFirst && arr[0] === avoidFirst && arr.length > 1) {
    const swapIdx = 1 + Math.floor(Math.random() * (arr.length - 1));
    [arr[0], arr[swapIdx]] = [arr[swapIdx], arr[0]];
  }
  return arr;
}

const HALL_CONFRONT_ANIM: Record<TelechobiId, string> = {
  ton: 'animate-hall-ton',
  toso: 'animate-hall-toso',
  nita: 'animate-hall-nita',
  tis: 'animate-hall-tis',
  arbol: 'animate-hall-arbol',
  champi: 'animate-hall-champi',
  non: 'animate-hall-non',
  charro: 'animate-hall-charro',
};

function buildInitialEnemyLocations(isNight7Normal: boolean): Record<TelechobiId, EnemyLocation> {
  return {
    ton: isNight7Normal ? 'cam5' : 'cam1',
    toso: isNight7Normal ? 'cam6' : 'cam1',
    nita: isNight7Normal ? 'cam7' : 'cam2',
    tis: 'cam3',
    arbol: 'cam9',
    champi: 'cam9',
    non: 'cam9',
    charro: 'cam9',
  };
}

const OUTER_PATROL_CAMS: CameraId[] = [
  'cam10',
  'cam4',
  'cam3',
  'cam8',
  'cam7',
  'cam6',
  'cam5',
  'cam9',
];

function pickChampiNextCam(
  currentCam: CameraId,
  visited: CameraId[],
  brokenCams: Partial<Record<CameraId, number>>
): CameraId | null {
  const nowMs = Date.now();
  const isBroken = (id: CameraId) => Boolean(brokenCams[id] && brokenCams[id]! > nowMs);
  const getAdj = (id: CameraId, allowFinal: boolean): CameraId[] => {
    const room = CAMERA_ROOMS.find((r) => r.id === id);
    if (!room) return [];
    const filtered = allowFinal
      ? room.adjacent
      : room.adjacent.filter((c) => c !== 'cam1' && c !== 'cam2');
    const unbroken = filtered.filter((c) => !isBroken(c));
    return unbroken.length > 0 ? unbroken : filtered;
  };

  const unvisitedOuter = OUTER_PATROL_CAMS.filter((c) => !visited.includes(c));
  const targets: CameraId[] = unvisitedOuter.length > 0 ? unvisitedOuter : ['cam1', 'cam2'];
  const allowFinal = unvisitedOuter.length === 0;

  const queue: Array<{ cam: CameraId; firstStep: CameraId | null }> = [
    { cam: currentCam, firstStep: null },
  ];
  const seen = new Set<CameraId>([currentCam]);
  const candidateFirstSteps: CameraId[] = [];
  let foundDepth = false;

  while (queue.length > 0) {
    const levelSize = queue.length;
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift()!;
      const neighbors = [...getAdj(node.cam, allowFinal)].sort(() => Math.random() - 0.5);
      for (const next of neighbors) {
        const step = node.firstStep ?? next;
        if (targets.includes(next)) {
          candidateFirstSteps.push(step);
          foundDepth = true;
        }
        if (!seen.has(next)) {
          seen.add(next);
          queue.push({ cam: next, firstStep: step });
        }
      }
    }
    if (foundDepth) break;
  }

  if (candidateFirstSteps.length > 0) {
    return candidateFirstSteps[Math.floor(Math.random() * candidateFirstSteps.length)];
  }

  const fallback = getAdj(currentCam, true);
  return fallback.length > 0 ? fallback[Math.floor(Math.random() * fallback.length)] : null;
}

export function OfficeGameplay({
  night,
  launchConfig,
  muted,
  onToggleMute,
  onNightWin,
  onJumpscare,
  onExitToMenu,
}: OfficeGameplayProps) {
  const config = NIGHT_CONFIGS[night] || NIGHT_CONFIGS[1];
  const isCustomAI = Boolean(launchConfig?.isCustomAI);
  const isDefinitiveNight = Boolean(launchConfig?.isDefinitiveNight);
  const aiLevels = launchConfig?.aiLevels ?? DEFAULT_AI_LEVELS;
  const cheats = launchConfig?.cheats ?? DEFAULT_CHEATS;
  const generatorEnabled = launchConfig ? launchConfig.enableGeneratorRecharge : night >= 6;
  const durationMinutes = Math.max(1, Math.min(360, launchConfig?.durationMinutes ?? 6));
  const durationSeconds = durationMinutes * 60;
  const secondsPerHour = durationSeconds / 6;

  const isNight7Normal = !isCustomAI && night === 7;
  // Scripted phone calls for Nights 1-5 and 7 (unless Custom AI Night)
  const callScript = !isCustomAI ? PHONE_CALLS[night] || null : null;

  const activeEnemyIds: TelechobiId[] = isCustomAI
    ? ALL_ENEMY_IDS.filter((id) => aiLevels[id] > 0)
    : isNight7Normal
      ? NIGHT7_ENEMY_IDS
      : CLASSIC_ENEMY_IDS;

  const deactivatedEnemies: TelechobiId[] = isNight7Normal ? CLASSIC_ENEMY_IDS : [];

  // React HUD states
  const [view, setView] = useState<OfficeView>('center');
  const [leftDoorClosed, setLeftDoorClosed] = useState(Boolean(cheats.doorsClosedStart));
  const [rightDoorClosed, setRightDoorClosed] = useState(Boolean(cheats.doorsClosedStart));
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
  const [hallEncounter, setHallEncounter] = useState<HallEncounterState | null>(null);

  const [phoneFailed, setPhoneFailed] = useState(false);
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  const [lastRungCam, setLastRungCam] = useState<CameraId | null>(null);
  const [brokenCams, setBrokenCams] = useState<Partial<Record<CameraId, number>>>({});
  const [lensTension, setLensTension] = useState(0);

  const [oxygen, setOxygen] = useState(100);
  const [maskToxicLocked, setMaskToxicLocked] = useState(false);
  const [oxygenRestoredBanner, setOxygenRestoredBanner] = useState(false);
  const [generatorRecharging, setGeneratorRecharging] = useState(false);
  const [champiInterferenceCam, setChampiInterferenceCam] = useState<CameraId | null>(null);
  const [charroOfficeActive, setCharroOfficeActive] = useState(false);
  const [turnAnim, setTurnAnim] = useState<'left' | 'right' | 'back' | null>(null);
  const [handAction, setHandAction] = useState<'mask_on' | 'mask_off' | 'cam_up' | 'cam_down' | null>(
    null
  );
  const oxygenRestoredTimerRef = useRef<number | null>(null);
  const turnAnimTimerRef = useRef<number | null>(null);
  const handAnimTimerRef = useRef<number | null>(null);
  const hallwaySpotRef = useRef<string | null>(null);
  const doorSpotRef = useRef<{ left: TelechobiId | null; right: TelechobiId | null }>({
    left: null,
    right: null,
  });

  const [enemyLocations, setEnemyLocations] = useState<Record<TelechobiId, EnemyLocation>>(() =>
    buildInitialEnemyLocations(isNight7Normal)
  );

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
    leftDoorClosed: Boolean(cheats.doorsClosedStart),
    rightDoorClosed: Boolean(cheats.doorsClosedStart),
    flashlightOn: false,
    maskOn: false,
    monitorOpen: false,
    activeCam: 'cam1' as CameraId,
    isBlackout: false,
    blackoutTimer: 0,
    phoneFailed: false,
    phoneCooldown: 0,
    ventThreatEnemy: null as TelechobiId | null,
    ventFailTimer: 0,
    ventCreakPlayed: false,
    ventNextTimer: Math.max(8, 19 - night * 2.1),
    ventQueue: buildShuffledVentQueue(activeEnemyIds),
    globalAttackRecovery: 0,
    inBackRoom: false,
    backRoomRechargeDone: false,
    backRoomReturnGrace: 0,
    generatorRecharging: false,
    oxygen: 100,
    maskToxicLocked: false,
    wasOxygenDepleted: false,
    breathingSyncAccum: 0,
    lensTension: 0,
    brokenCams: {} as Partial<Record<CameraId, number>>,
    hallEncounter: null as HallEncounterState | null,
    ended: false,
    arbolTeleportTimer: isDefinitiveNight ? 2.4 : isNight7Normal ? 3.4 : 4.2,
    champiWatchTimer: 0,
    champiVisitedCams: ['cam9'] as CameraId[],
    champiBanishCam: null as CameraId | null,
    champiBanishTimer: 0,
    champiRushActive: false,
    champiRushTimer: 0,
    champiRushSource: 'left_door' as JumpscareSource,
    charroCamBreakTimer: isDefinitiveNight ? 4.8 : isNight7Normal ? 6.5 : 8.5,
    charroOfficeCooldown: isDefinitiveNight ? 7.0 : isNight7Normal ? 11.5 : 14.0,
    charroOfficeTimer: 0,
    charroPendingOffice: false,
    charroPendingTimer: 0,
    night7Queue: buildShuffledNight7Queue(),
    night7ActiveAttacker: null as TelechobiId | null,
    night7LastAttacker: null as TelechobiId | null,
    night7TurnGap: 1.5,
    night7TurnStall: 0,
    fnafAi: {
      tonTimer: 3.02,
      tonPendingMove: false,
      tonWaitTimer: 0,
      tosoTimer: 4.97,
      nitaTimer: 5.01,
      nitaStage: 0,
      tisTimer: 4.97,
    },
    enemies: {
      ton: {
        id: 'ton',
        location: isNight7Normal ? 'cam5' : 'cam1',
        moveCooldown: config.initialGraceSeconds,
        attackTimer: 0,
        bangedDoor: false,
      },
      toso: {
        id: 'toso',
        location: isNight7Normal ? 'cam6' : 'cam1',
        moveCooldown: config.initialGraceSeconds * 1.25,
        attackTimer: 0,
        bangedDoor: false,
      },
      nita: {
        id: 'nita',
        location: isNight7Normal ? 'cam7' : 'cam2',
        moveCooldown: config.initialGraceSeconds * 1.5,
        attackTimer: 0,
        bangedDoor: false,
      },
      tis: {
        id: 'tis',
        location: 'cam3',
        moveCooldown: config.initialGraceSeconds * 1.75,
        attackTimer: 0,
        bangedDoor: false,
      },
      arbol: {
        id: 'arbol',
        location: 'cam9',
        moveCooldown: Math.max(1.8, config.initialGraceSeconds * 1.1),
        attackTimer: 0,
        bangedDoor: false,
      },
      champi: {
        id: 'champi',
        location: 'cam9',
        moveCooldown: Math.max(1.5, config.initialGraceSeconds),
        attackTimer: 0,
        bangedDoor: false,
      },
      non: {
        id: 'non',
        location: 'cam9',
        moveCooldown: Math.max(1.6, config.initialGraceSeconds * 1.05),
        attackTimer: 0,
        bangedDoor: false,
      },
      charro: {
        id: 'charro',
        location: 'cam9',
        moveCooldown: 5.0,
        attackTimer: 0,
        bangedDoor: false,
      },
    } as Record<TelechobiId, EnemyRuntime>,
  });

  const viewRef = useRef<OfficeView>('center');
  useEffect(() => {
    viewRef.current = view;
    simRef.current.inBackRoom = view === 'back';
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

  // Ambient & night-only Boss Fight music on mount + pre-decode all SFX buffers
  useEffect(() => {
    soundEngine.unlock();
    soundEngine.startAmbience('office');
    soundEngine.startNightMusic(Boolean(callScript));
    if (cheats.infiniteHomerMoans) {
      soundEngine.startInfiniteHomerLoop();
    }
    return () => {
      if (oxygenRestoredTimerRef.current) {
        window.clearTimeout(oxygenRestoredTimerRef.current);
      }
      if (turnAnimTimerRef.current) {
        window.clearTimeout(turnAnimTimerRef.current);
      }
      if (handAnimTimerRef.current) {
        window.clearTimeout(handAnimTimerRef.current);
      }
      soundEngine.stopNightMusic();
      soundEngine.setRechargingSilence(false);
      soundEngine.stopInfiniteHomerLoop();
      soundEngine.stopVentSound();
      soundEngine.stopCameraLureAudio();
      soundEngine.stopDoorSlam();
      soundEngine.stopDoorScare();
      soundEngine.stopHallwayNoise();
      soundEngine.stopGeneratorSound();
      soundEngine.stopTurnBreath();
      soundEngine.stopCharroVoice();
      soundEngine.stopCamInterference();
      soundEngine.stopNonCrawl();
      soundEngine.stopChampiFoxyRun();
      soundEngine.stopAmbience();
      soundEngine.stopMaskBreathing();
      soundEngine.stopPhoneVoice();
    };
  }, [callScript, cheats.infiniteHomerMoans]);

  const handleSkipCall = useCallback(() => {
    if (!simRef.current.callActive) return;
    simRef.current.callActive = false;
    setCallActive(false);
    setVoiceSpeaking(false);
    soundEngine.playCallEndCue();
    soundEngine.setNightMusicDucked(false);
  }, []);

  const triggerDoorShake = useCallback(() => {
    setCameraShake(true);
    window.setTimeout(() => setCameraShake(false), 320);
  }, []);

  const triggerOxygenRestored = useCallback(() => {
    setOxygenRestoredBanner(true);
    if (oxygenRestoredTimerRef.current) {
      window.clearTimeout(oxygenRestoredTimerRef.current);
    }
    oxygenRestoredTimerRef.current = window.setTimeout(() => {
      setOxygenRestoredBanner(false);
      oxygenRestoredTimerRef.current = null;
    }, 1150);
  }, []);

  const triggerTurnAnim = useCallback((dir: 'left' | 'right' | 'back') => {
    setTurnAnim(dir);
    if (turnAnimTimerRef.current) {
      window.clearTimeout(turnAnimTimerRef.current);
    }
    turnAnimTimerRef.current = window.setTimeout(() => {
      setTurnAnim(null);
      turnAnimTimerRef.current = null;
    }, 270);
  }, []);

  const triggerHandAction = useCallback(
    (action: 'mask_on' | 'mask_off' | 'cam_up' | 'cam_down') => {
      setHandAction(action);
      if (handAnimTimerRef.current) {
        window.clearTimeout(handAnimTimerRef.current);
      }
      handAnimTimerRef.current = window.setTimeout(() => {
        setHandAction(null);
        handAnimTimerRef.current = null;
      }, 460);
    },
    []
  );

  const finishNight7Turn = useCallback(
    (finishedId: TelechobiId) => {
      if (!isNight7Normal) return;
      const s = simRef.current;
      if (s.night7ActiveAttacker === finishedId || s.night7ActiveAttacker === null) {
        s.night7ActiveAttacker = null;
        s.night7LastAttacker = finishedId;
        s.night7TurnStall = 0;
        s.charroPendingOffice = false;
        s.charroPendingTimer = 0;
        // Rest strictly 5 seconds after each enemy finishes attacking before the next one can attack
        s.night7TurnGap = 5.0;
        s.globalAttackRecovery = Math.max(s.globalAttackRecovery, 5.0);
      }
    },
    [isNight7Normal]
  );

  const dismissCharroOfficeThreat = useCallback(() => {
    const s = simRef.current;
    if (s.charroOfficeTimer <= 0) return;
    s.charroOfficeTimer = 0;
    s.charroPendingOffice = false;
    s.charroPendingTimer = 0;
    s.enemies.charro.location = 'cam9';
    s.charroOfficeCooldown = isCustomAI ? Math.max(8, 22 - aiLevels.charro * 0.65) : 12.5;
    s.globalAttackRecovery = Math.max(s.globalAttackRecovery, 5.0);
    setCharroOfficeActive(false);
    soundEngine.stopCharroVoice();
    finishNight7Turn('charro');
  }, [isCustomAI, aiLevels.charro, finishNight7Turn]);

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
    if (
      simRef.current.isBlackout ||
      (!cheats.infiniteOxygen && simRef.current.maskOn) ||
      (!cheats.infiniteOxygen && viewRef.current !== 'center')
    ) {
      return;
    }
    setMonitorOpen((prev) => {
      const next = !prev;
      simRef.current.monitorOpen = next;
      soundEngine.playCameraSwitch();
      triggerHandAction(next ? 'cam_up' : 'cam_down');
      if (next) {
        simRef.current.flashlightOn = false;
        setFlashlightOn(false);
        dismissCharroOfficeThreat();
      } else {
        simRef.current.champiWatchTimer = 0;
      }
      return next;
    });
  }, [cheats.infiniteOxygen, triggerHandAction, dismissCharroOfficeThreat]);

  const toggleMask = useCallback(() => {
    if (
      simRef.current.isBlackout ||
      (!cheats.infiniteOxygen && simRef.current.monitorOpen) ||
      (!cheats.infiniteOxygen && viewRef.current !== 'center')
    ) {
      return;
    }
    if (!cheats.infiniteOxygen && !simRef.current.maskOn && simRef.current.maskToxicLocked) {
      soundEngine.playErrorBeep();
      return;
    }
    setMaskOn((prev) => {
      if (!cheats.infiniteOxygen && !prev && simRef.current.maskToxicLocked) return false;
      const next = !prev;
      simRef.current.maskOn = next;
      soundEngine.playMaskToggle(next);
      triggerHandAction(next ? 'mask_on' : 'mask_off');
      if (next) {
        if (!cheats.infiniteOxygen) {
          simRef.current.monitorOpen = false;
          simRef.current.flashlightOn = false;
          setMonitorOpen(false);
          setFlashlightOn(false);
          setView('center');
        }
        dismissCharroOfficeThreat();
        soundEngine.setBreathingState(true, cheats.infiniteOxygen ? 100 : simRef.current.oxygen);
      } else {
        soundEngine.setBreathingState(
          simRef.current.ventThreatEnemy !== null || (!cheats.infiniteOxygen && simRef.current.oxygen < 94),
          simRef.current.oxygen
        );
      }
      return next;
    });
  }, [cheats.infiniteOxygen, triggerHandAction, dismissCharroOfficeThreat]);

  const setFlashlightState = useCallback(
    (on: boolean) => {
      if (
        simRef.current.isBlackout ||
        simRef.current.monitorOpen ||
        (!cheats.infiniteOxygen && simRef.current.maskOn) ||
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
    [view, cheats.infiniteOxygen]
  );

  const applyTurnOxygenDip = useCallback(() => {
    if (cheats.infiniteOxygen || simRef.current.isBlackout) return;
    if (simRef.current.oxygen > 15) {
      simRef.current.oxygen = Math.max(12, simRef.current.oxygen - 7);
      setOxygen(simRef.current.oxygen);
    }
  }, [cheats.infiniteOxygen]);

  const turnLeft = useCallback(() => {
    if (
      viewRef.current === 'back' ||
      viewRef.current === 'left' ||
      simRef.current.monitorOpen ||
      (!cheats.infiniteOxygen && simRef.current.maskOn) ||
      simRef.current.isBlackout
    ) {
      return;
    }
    soundEngine.playLookTurn();
    soundEngine.playTurnBreath();
    triggerTurnAnim('left');
    applyTurnOxygenDip();
    setView((v) => (v === 'right' ? 'center' : 'left'));
  }, [cheats.infiniteOxygen, triggerTurnAnim, applyTurnOxygenDip]);

  const turnRight = useCallback(() => {
    if (
      viewRef.current === 'back' ||
      viewRef.current === 'right' ||
      simRef.current.monitorOpen ||
      (!cheats.infiniteOxygen && simRef.current.maskOn) ||
      simRef.current.isBlackout
    ) {
      return;
    }
    soundEngine.playLookTurn();
    soundEngine.playTurnBreath();
    triggerTurnAnim('right');
    applyTurnOxygenDip();
    setView((v) => (v === 'left' ? 'center' : 'right'));
  }, [cheats.infiniteOxygen, triggerTurnAnim, applyTurnOxygenDip]);

  // Back Room <-> Central Office (fatigued breathing both ways + 4s grace on return)
  const turnToBackRoom = useCallback(() => {
    if (
      !generatorEnabled ||
      simRef.current.isBlackout ||
      simRef.current.monitorOpen ||
      (!cheats.infiniteOxygen && simRef.current.maskOn) ||
      simRef.current.ended ||
      viewRef.current !== 'center'
    ) {
      return;
    }
    simRef.current.inBackRoom = true;
    simRef.current.backRoomRechargeDone = false;
    simRef.current.flashlightOn = false;
    setFlashlightOn(false);
    soundEngine.playLookTurn();
    soundEngine.playTurnBreath();
    triggerTurnAnim('back');
    setView('back');
  }, [generatorEnabled, cheats.infiniteOxygen, triggerTurnAnim]);

  const turnBackToOffice = useCallback(() => {
    if (
      !generatorEnabled ||
      simRef.current.isBlackout ||
      simRef.current.ended ||
      viewRef.current !== 'back'
    ) {
      return;
    }
    simRef.current.inBackRoom = false;
    if (!simRef.current.generatorRecharging) {
      simRef.current.backRoomReturnGrace = 4.0;
    }
    soundEngine.playLookTurn();
    soundEngine.playTurnBreath();
    triggerTurnAnim('back');
    setView('center');
  }, [generatorEnabled, triggerTurnAnim]);

  const handleToggleGenerator = useCallback(() => {
    if (
      !generatorEnabled ||
      simRef.current.isBlackout ||
      simRef.current.ended ||
      !simRef.current.inBackRoom
    ) {
      return;
    }

    if (simRef.current.generatorRecharging) {
      simRef.current.generatorRecharging = false;
      setGeneratorRecharging(false);
      soundEngine.stopGeneratorSound();
      soundEngine.setRechargingSilence(false);
      return;
    }

    if (simRef.current.leftDoorClosed || simRef.current.rightDoorClosed) {
      soundEngine.playErrorBeep();
      soundEngine.stopGeneratorSound();
      soundEngine.setRechargingSilence(false);
      return;
    }

    if (simRef.current.power >= 99.9 || cheats.infinitePower) {
      simRef.current.power = 100;
      setPower(100);
      soundEngine.stopGeneratorSound();
      soundEngine.setRechargingSilence(false);
      return;
    }

    simRef.current.generatorRecharging = true;
    setGeneratorRecharging(true);
    soundEngine.setRechargingSilence(true);
    soundEngine.startGeneratorSound();
  }, [generatorEnabled, cheats.infinitePower]);

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
          turnLeft();
          break;
        case 'ArrowRight':
        case 'KeyD':
          turnRight();
          break;
        case 'ArrowDown':
        case 'KeyB':
          if (
            generatorEnabled &&
            !simRef.current.monitorOpen &&
            (!simRef.current.maskOn || cheats.infiniteOxygen)
          ) {
            e.preventDefault();
            if (viewRef.current === 'center') {
              turnToBackRoom();
            } else if (viewRef.current === 'back') {
              turnBackToOffice();
            }
          }
          break;
        case 'ArrowUp':
          if (generatorEnabled && viewRef.current === 'back') {
            e.preventDefault();
            turnBackToOffice();
          }
          break;
        case 'KeyW':
        case 'KeyS':
          e.preventDefault();
          if (viewRef.current === 'center' || cheats.infiniteOxygen) toggleMonitor();
          break;
        case 'KeyM':
          e.preventDefault();
          if (viewRef.current === 'center' || cheats.infiniteOxygen) toggleMask();
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
  }, [
    generatorEnabled,
    cheats.infiniteOxygen,
    toggleLeftDoor,
    toggleRightDoor,
    toggleMask,
    toggleMonitor,
    setFlashlightState,
    turnLeft,
    turnRight,
    turnToBackRoom,
    turnBackToOffice,
    view,
  ]);

  // Telephone lure handler (ONLY available on cameras with hasAudio; repels active vent intrusion)
  const handleRingPhone = useCallback((targetCam: CameraId) => {
    if (!cheats.noAudioErrorsInstant && (simRef.current.phoneFailed || simRef.current.phoneCooldown > 0)) {
      return;
    }

    const targetRoom = CAMERA_ROOMS.find((r) => r.id === targetCam);
    if (!targetRoom || !targetRoom.hasAudio) return;

    const hadVentThreat = simRef.current.ventThreatEnemy;

    const nextCooldown = cheats.noAudioErrorsInstant ? 0 : 6.5;
    simRef.current.phoneCooldown = nextCooldown;
    setPhoneCooldown(nextCooldown);
    setLastRungCam(targetCam);

    if (hadVentThreat) {
      simRef.current.ventThreatEnemy = null;
      simRef.current.ventFailTimer = 0;
      simRef.current.ventCreakPlayed = false;
      soundEngine.stopVentCreak();
      simRef.current.ventNextTimer = Math.max(10, 23 - night * 2.2) + Math.random() * 6;
      const isBossAttacker =
        isNight7Normal ||
        hadVentThreat === 'arbol' ||
        hadVentThreat === 'non' ||
        hadVentThreat === 'champi' ||
        hadVentThreat === 'charro';
      simRef.current.globalAttackRecovery = isBossAttacker ? 5.0 : 2.0;

      // Replay vent SFX quieter as the animatronic retreats away from the office via the ducts (without alert banner)
      soundEngine.playVentSound('retreat', 120);

      const ventEnemy = simRef.current.enemies[hadVentThreat];
      if (ventEnemy && ventEnemy.location !== 'office') {
        ventEnemy.location = targetCam;
        ventEnemy.attackTimer = 0;
        ventEnemy.bangedDoor = false;
        ventEnemy.moveCooldown = Math.max(2.0, config.moveIntervalSeconds * 1.1);
      }

      finishNight7Turn(hadVentThreat);

      activeEnemyIds.forEach((eid) => {
        const other = simRef.current.enemies[eid];
        if (
          other.location === 'left_door' ||
          other.location === 'right_door' ||
          other.location === 'hall_near'
        ) {
          other.attackTimer = Math.min(other.attackTimer, 1.0);
        }
      });
    }

    // Phone audio cannot fail when noAudioErrorsInstant cheat is active or during initial call
    const lineWillFail =
      !cheats.noAudioErrorsInstant &&
      !hadVentThreat &&
      !simRef.current.callActive &&
      Math.random() < 0.22 + night * 0.04;
    if (lineWillFail) {
      simRef.current.phoneFailed = true;
      setPhoneFailed(true);
      soundEngine.stopCameraLureAudio();
      soundEngine.playErrorBeep();
    } else {
      soundEngine.playPhoneRing();
    }

    activeEnemyIds.forEach((id) => {
      if (id === 'charro' || id === 'arbol' || id === 'champi') return;
      if (isCustomAI && aiLevels[id] <= 0) return;
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
          if (isNight7Normal && simRef.current.night7ActiveAttacker === id) {
            finishNight7Turn(id);
          }
        }
        return;
      }

      if (enemy.location === targetCam) return;
      if (targetRoom.adjacent.includes(enemy.location as CameraId) || Math.random() < 0.65) {
        enemy.location = targetCam;
        enemy.moveCooldown = 3.5 + Math.random() * 2.5;
        if (id === 'non') {
          soundEngine.playNonCrawl(0.5);
        } else {
          soundEngine.playFootsteps('far');
        }
      }
    });

    setEnemyLocations({
      ton: simRef.current.enemies.ton.location,
      toso: simRef.current.enemies.toso.location,
      nita: simRef.current.enemies.nita.location,
      tis: simRef.current.enemies.tis.location,
      arbol: simRef.current.enemies.arbol.location,
      champi: simRef.current.enemies.champi.location,
      non: simRef.current.enemies.non.location,
      charro: simRef.current.enemies.charro.location,
    });
  }, [
    night,
    config.moveIntervalSeconds,
    cheats.noAudioErrorsInstant,
    isCustomAI,
    aiLevels,
    activeEnemyIds,
    isNight7Normal,
    finishNight7Turn,
  ]);

  const handlePhoneRepaired = useCallback(() => {
    simRef.current.phoneFailed = false;
    simRef.current.phoneCooldown = cheats.noAudioErrorsInstant ? 0 : 1.5;
    setPhoneFailed(false);
    setPhoneCooldown(cheats.noAudioErrorsInstant ? 0 : 1.5);
  }, [cheats.noAudioErrorsInstant]);

  // Main 60fps simulation loop
  useEffect(() => {
    let rafId = 0;
    let lastTime = performance.now();
    let uiSyncAccum = 0;

    const avgAiNorm = isCustomAI
      ? ALL_ENEMY_IDS.reduce((acc, id) => acc + Math.min(20, aiLevels[id]), 0) /
        Math.max(20, activeEnemyIds.length * 20)
      : 0;
    const effectiveDoorPatience = isDefinitiveNight
      ? 1.75
      : isCustomAI
        ? Math.max(2.5, 8.8 - avgAiNorm * 6.0)
        : config.attackPatienceSeconds;
    const effectiveHallPatience = isDefinitiveNight
      ? 1.38
      : isCustomAI
        ? Math.max(2.0, 7.0 - avgAiNorm * 4.9)
        : config.hallPatienceSeconds;
    // Ventilation grants slightly more reaction time in Noche Definitiva (even at 40)
    const effectiveVentPatience = isDefinitiveNight
      ? 13.5
      : isCustomAI
        ? Math.max(10.5, 22.0 - avgAiNorm * 10.5)
        : config.ventPatienceSeconds;
    const effectiveAllowMultiThreat = isCustomAI
      ? isDefinitiveNight || avgAiNorm >= 0.35 || activeEnemyIds.length >= 3
      : config.allowMultiThreat;

    const isChampiAtFinalCam = (): boolean => {
      if (!activeEnemyIds.includes('champi')) return false;
      if (isCustomAI && aiLevels.champi <= 0) return false;
      const cl = simRef.current.enemies.champi.location;
      return cl === 'cam1' || cl === 'cam2';
    };

    const isAnyBossAttacking = (excludeId?: TelechobiId): boolean => {
      const st = simRef.current;
      if (excludeId !== 'champi' && isChampiAtFinalCam()) {
        return true;
      }
      if (
        (st.ventThreatEnemy === 'arbol' || st.ventThreatEnemy === 'non') &&
        st.ventThreatEnemy !== excludeId
      ) {
        return true;
      }
      if (st.charroOfficeTimer > 0 && excludeId !== 'charro') {
        return true;
      }
      return (['arbol', 'non'] as const).some((bid) => {
        if (bid === excludeId || !activeEnemyIds.includes(bid)) return false;
        const l = st.enemies[bid].location;
        return (
          l === 'left_door' ||
          l === 'right_door' ||
          l === 'hall_far' ||
          l === 'hall_near' ||
          l === 'office'
        );
      });
    };

    const isAnyThreatInPlay = (excludeId?: TelechobiId): boolean => {
      const st = simRef.current;
      if (excludeId !== 'champi' && isChampiAtFinalCam()) {
        return true;
      }
      if (st.ventThreatEnemy !== null && st.ventThreatEnemy !== excludeId) {
        return true;
      }
      if (st.charroOfficeTimer > 0 && excludeId !== 'charro') {
        return true;
      }
      if (st.hallEncounter !== null && st.hallEncounter.enemyId !== excludeId) {
        return true;
      }
      return activeEnemyIds.some((eid) => {
        if (eid === excludeId) return false;
        const l = st.enemies[eid].location;
        return (
          l === 'left_door' ||
          l === 'right_door' ||
          l === 'hall_far' ||
          l === 'hall_near' ||
          l === 'office'
        );
      });
    };

    const advanceEnemyAI = (enemy: EnemyRuntime, skipAggressionRoll = false): boolean => {
      if (!activeEnemyIds.includes(enemy.id)) return false;
      if (isCustomAI && aiLevels[enemy.id] <= 0) return false;
      if (enemy.id === 'charro') return false;

      const loc = enemy.location;
      const isNight7Boss = enemy.id === 'arbol' || enemy.id === 'champi' || enemy.id === 'non';

      if (!skipAggressionRoll && Math.random() > config.aiAggression) {
        enemy.moveCooldown = config.moveIntervalSeconds * (0.65 + Math.random() * 0.55);
        return false;
      }

      const backRoomFreeze =
        simRef.current.generatorRecharging ||
        (simRef.current.inBackRoom && !simRef.current.backRoomRechargeDone) ||
        simRef.current.backRoomReturnGrace > 0;

      // Special Champi Camera-Search Rule:
      // Champi can ONLY be stopped by spotting him in the CCTV cameras.
      // When Champi reaches CAM 01 or CAM 02, all other enemies are deactivated so the player can avoid him.
      // If he is not spotted and leaves the final camera (CAM 01 or CAM 02) into a Door or Hallway, he kills INSTANTLY.
      if (enemy.id === 'champi') {
        if (backRoomFreeze || simRef.current.champiBanishTimer > 0) {
          enemy.moveCooldown = Math.max(0.75, simRef.current.backRoomReturnGrace);
          return false;
        }
        const room = CAMERA_ROOMS.find((r) => r.id === loc);
        if (!room) return false;

        const night7TurnBlocked =
          isNight7Normal &&
          (simRef.current.night7ActiveAttacker !== 'champi' || isAnyThreatInPlay('champi'));
        const attackBlocked =
          simRef.current.ventThreatEnemy !== null ||
          simRef.current.charroOfficeTimer > 0 ||
          simRef.current.globalAttackRecovery > 0 ||
          isAnyBossAttacking('champi') ||
          night7TurnBlocked;

        if (loc === 'cam1' || loc === 'cam2') {
          if (attackBlocked) {
            enemy.moveCooldown = 0.75;
            return false;
          }
          const killSource: JumpscareSource =
            loc === 'cam1'
              ? !simRef.current.leftDoorClosed
                ? 'left_door'
                : 'hallway'
              : !simRef.current.rightDoorClosed && Math.random() < 0.5
                ? 'right_door'
                : 'hallway';

          if (!simRef.current.champiRushActive) {
            simRef.current.champiRushActive = true;
            simRef.current.champiRushTimer = 0.96;
            simRef.current.champiRushSource = killSource;
            soundEngine.stopCamInterference();
            soundEngine.playChampiFoxyRun(0.95);
            triggerDoorShake();
          }
          return true;
        }

        // Otherwise patrol through ALL outer cameras (cam3..cam10) before entering CAM 01 / CAM 02
        const curCam = loc as CameraId;
        if (!simRef.current.champiVisitedCams.includes(curCam)) {
          simRef.current.champiVisitedCams.push(curCam);
        }
        const nextCam = pickChampiNextCam(
          curCam,
          simRef.current.champiVisitedCams,
          simRef.current.brokenCams
        );

        if (nextCam && nextCam !== enemy.location) {
          enemy.location = nextCam;
          simRef.current.night7TurnStall = 0;
          if (!simRef.current.champiVisitedCams.includes(nextCam)) {
            simRef.current.champiVisitedCams.push(nextCam);
          }
          if (nextCam === 'cam1' || nextCam === 'cam2') {
            if (simRef.current.brokenCams[nextCam]) {
              const updatedBroken = { ...simRef.current.brokenCams };
              delete updatedBroken[nextCam];
              simRef.current.brokenCams = updatedBroken;
              setBrokenCams(updatedBroken);
            }
          }
          soundEngine.playChampiTires(
            nextCam === 'cam1' || nextCam === 'cam2' ? 0.72 : 0.52,
            false
          );
        }
        const champiProgress = isNight7Normal
          ? Math.min(1, simRef.current.elapsed / Math.max(1, durationSeconds))
          : 0;
        const atFinalCam = enemy.location === 'cam1' || enemy.location === 'cam2';
        enemy.moveCooldown = isDefinitiveNight
          ? atFinalCam
            ? 4.75
            : 1.08
          : atFinalCam
            ? 4.0 - champiProgress * 0.5
            : 1.35 - champiProgress * 0.25;
        return false;
      }

      if (loc === 'hall_far') {
        if (
          backRoomFreeze ||
          simRef.current.ventThreatEnemy !== null ||
          simRef.current.charroOfficeTimer > 0 ||
          simRef.current.globalAttackRecovery > 0
        ) {
          enemy.moveCooldown = Math.max(
            0.75,
            simRef.current.globalAttackRecovery,
            simRef.current.backRoomReturnGrace
          );
          return false;
        }
        enemy.location = 'hall_near';
        enemy.attackTimer = 0;
        if (enemy.id === 'arbol') {
          soundEngine.playArbolLaugh(0.82, true);
        } else if (enemy.id === 'non') {
          soundEngine.playNonLaugh(0.82, true);
        } else {
          soundEngine.playFootsteps('heavy');
          if (!soundEngine.isBossWarningActive()) {
            soundEngine.playHallwayNoise();
          }
        }
        enemy.moveCooldown = config.moveIntervalSeconds;
        return false;
      }

      if (loc === 'left_door' || loc === 'right_door' || loc === 'hall_near') {
        enemy.moveCooldown = 1.6;
        return false;
      }

      const room = CAMERA_ROOMS.find((r) => r.id === loc);
      if (!room) return false;

      // Mutual Exclusion Rule + Night 7 Strict Turn-Taking Gate:
      // In Night 7, ONLY the active turn-holder (night7ActiveAttacker) may enter any attack slot,
      // and never if any other enemy is currently attacking or in recovery.
      const night7TurnBlocked =
        isNight7Normal &&
        (simRef.current.night7ActiveAttacker !== enemy.id || isAnyThreatInPlay(enemy.id));

      const attackBlocked =
        backRoomFreeze ||
        simRef.current.ventThreatEnemy !== null ||
        simRef.current.charroOfficeTimer > 0 ||
        simRef.current.globalAttackRecovery > 0 ||
        isAnyBossAttacking(enemy.id) ||
        night7TurnBlocked;

      const someoneInHall =
        activeEnemyIds.some((otherId) => {
          const l = simRef.current.enemies[otherId].location;
          return l === 'hall_far' || l === 'hall_near';
        }) || simRef.current.hallEncounter !== null;

      const someoneAtDoor = activeEnemyIds.some((otherId) => {
        const l = simRef.current.enemies[otherId].location;
        return l === 'left_door' || l === 'right_door';
      });

      const options: EnemyLocation[] = [...room.adjacent];
      if (!attackBlocked) {
        if (room.canReachLeftDoor && !someoneInHall && (!isNight7Normal || !someoneAtDoor)) {
          options.push('left_door');
        }
        if (room.canReachRightDoor && !someoneInHall && (!isNight7Normal || !someoneAtDoor)) {
          options.push('right_door');
        }
        if (room.canReachHallway && !someoneAtDoor && !someoneInHall) {
          options.push('hall_far');
        }
      }

      // Bias toward advancing closer to CAM 01 / CAM 02 (doors & central hallway)
      const isNight7TurnHolder = isNight7Normal && simRef.current.night7ActiveAttacker === enemy.id;
      const forwardPool = options.filter((o) => o !== 'cam9' && o !== 'cam10');
      const forwardBias = isNight7TurnHolder
        ? 0.96
        : isCustomAI
          ? 0.72 + (aiLevels[enemy.id] / 20) * 0.24
          : night >= 5
            ? 0.92
            : night >= 3
              ? 0.82
              : 0.7;

      let pool = forwardPool.length > 0 && Math.random() < forwardBias ? forwardPool : options;
      if (isNight7TurnHolder) {
        const attackReadyPool = options.filter(
          (o) => o === 'left_door' || o === 'right_door' || o === 'hall_far'
        );
        if (attackReadyPool.length > 0) {
          pool = attackReadyPool;
        } else {
          const approachPool = options.filter(
            (o) => o === 'cam1' || o === 'cam2' || o === 'cam4' || o === 'cam5' || o === 'cam6'
          );
          if (approachPool.length > 0) {
            pool = approachPool;
          }
        }
      }

      const picked = pool[Math.floor(Math.random() * pool.length)];

      const activeSpecialCount = activeEnemyIds.filter((otherId) => {
        const l = simRef.current.enemies[otherId].location;
        return (
          l === 'left_door' ||
          l === 'right_door' ||
          l === 'hall_far' ||
          l === 'hall_near' ||
          l === 'office'
        );
      }).length;

      const isAttackSlot =
        picked === 'left_door' ||
        picked === 'right_door' ||
        picked === 'hall_far' ||
        picked === 'hall_near';

      if ((!effectiveAllowMultiThreat || isNight7Normal) && isAttackSlot && activeSpecialCount >= 1) {
        const cameraPool = options.filter(
          (o) => o !== 'left_door' && o !== 'right_door' && o !== 'hall_far'
        );
        if (cameraPool.length > 0) {
          const patrolPick = cameraPool[Math.floor(Math.random() * cameraPool.length)];
          if (patrolPick !== enemy.location) {
            enemy.location = patrolPick;
            if (enemy.id === 'non') soundEngine.playNonCrawl(0.5);
            else soundEngine.playFootsteps('far');
          }
        }
        enemy.moveCooldown = config.moveIntervalSeconds * 0.75;
        return false;
      }

      const occupiedSpecial = activeEnemyIds.some(
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
          if (enemy.id === 'arbol') soundEngine.playArbolLaugh(0.76, false);
          else if (enemy.id === 'non') soundEngine.playNonLaugh(0.78, false);
          else soundEngine.playFootsteps('heavy');
        } else if (picked === 'hall_far') {
          if (enemy.id === 'arbol') {
            soundEngine.playArbolLaugh(0.78, true);
          } else if (enemy.id === 'non') {
            soundEngine.playNonLaugh(0.78, true);
          } else {
            soundEngine.playFootsteps('medium');
            if (!soundEngine.isBossWarningActive()) {
              soundEngine.playHallwayNoise();
            }
          }
        } else {
          if (enemy.id === 'non') {
            soundEngine.playNonCrawl(0.58);
          } else if (enemy.id === 'arbol') {
            soundEngine.playArbolLaugh(0.55, false);
          } else if (
            picked === 'cam1' ||
            picked === 'cam2' ||
            picked === 'cam4' ||
            picked === 'cam5'
          ) {
            soundEngine.playFootsteps('medium');
          } else {
            soundEngine.playFootsteps('far');
          }
        }
      }
      const speedMult = isNight7TurnHolder ? 0.45 : isNight7Boss ? 0.72 : 1.0;
      enemy.moveCooldown = config.moveIntervalSeconds * speedMult * (0.62 + Math.random() * 0.52);
      return false;
    };

    const tick = (now: number) => {
      rafId = requestAnimationFrame(tick);
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05);
      const s = simRef.current;

      if (s.ended) return;

      // Champi Foxy-Run sprint right before Jumpscare when not avoided at all costs
      if (s.champiRushActive) {
        s.champiRushTimer -= dt;
        if (s.champiRushTimer <= 0) {
          s.champiRushActive = false;
          s.ended = true;
          soundEngine.stopNightMusic();
          soundEngine.stopInfiniteHomerLoop();
          soundEngine.stopVentSound();
          soundEngine.stopMaskBreathing();
          soundEngine.stopCamInterference();
          soundEngine.stopChampiFoxyRun();
          onJumpscare('champi', s.champiRushSource, Math.floor(s.elapsed / secondsPerHour));
        }
        return;
      }

      // 0. Alejandro Romero Phone Call Freeze:
      // Clock stays at 12:00 AM, power remains 100%, audio cannot fail, and enemies wait until call ends.
      if (s.callActive && callScript) {
        const seg = callScript.segments[s.callSegmentIdx];
        if (!seg) {
          s.callActive = false;
          setCallActive(false);
          setVoiceSpeaking(false);
          soundEngine.playCallEndCue();
          soundEngine.setNightMusicDucked(false);
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
            soundEngine.setNightMusicDucked(false);
          }
        }
        return;
      }

      // 1. Advance dynamic night clock (1 min to 6 real hours)
      s.elapsed += dt;
      if (s.elapsed >= durationSeconds) {
        s.ended = true;
        s.generatorRecharging = false;
        soundEngine.setRechargingSilence(false);
        soundEngine.stopNightMusic();
        soundEngine.stopVentSound();
        soundEngine.stopDoorScare();
        soundEngine.stopGeneratorSound();
        soundEngine.stopTurnBreath();
        soundEngine.stopMaskBreathing();
        onNightWin(s.power);
        return;
      }

      // 1b. Back Room return grace countdown (4s after turning back to office when not charging)
      if (!s.inBackRoom && !s.generatorRecharging && s.backRoomReturnGrace > 0) {
        s.backRoomReturnGrace = Math.max(0, s.backRoomReturnGrace - dt);
      }
      const enemiesDeactivated = s.generatorRecharging;
      const champiDeactivatingOthers = isChampiAtFinalCam();
      const definitiveHoldInCameras =
        isDefinitiveNight && (champiDeactivatingOthers || s.ventThreatEnemy !== null);
      const otherEnemiesPaused =
        enemiesDeactivated || champiDeactivatingOthers || definitiveHoldInCameras;
      const backRoomFreeze =
        enemiesDeactivated ||
        (s.inBackRoom && !s.backRoomRechargeDone) ||
        s.backRoomReturnGrace > 0;

      // 2. Fast Automatic Generator Recharge OR normal power drain (unless infinitePower cheat)
      if (!s.isBlackout) {
        if (cheats.infinitePower) {
          s.power = 100;
          if (s.generatorRecharging) {
            s.generatorRecharging = false;
            setGeneratorRecharging(false);
            soundEngine.stopGeneratorSound();
            soundEngine.setRechargingSilence(false);
          }
        } else {
          if (s.generatorRecharging) {
            if (s.leftDoorClosed || s.rightDoorClosed) {
              s.generatorRecharging = false;
              setGeneratorRecharging(false);
              soundEngine.stopGeneratorSound();
              soundEngine.setRechargingSilence(false);
            } else {
              // Recharges quickly in ~3-3.5 seconds while all animatronics & sounds stay halted until 100%
              s.power = Math.min(100, s.power + 26.5 * dt);
              if (s.power >= 100) {
                s.power = 100;
                s.generatorRecharging = false;
                s.backRoomRechargeDone = true;
                s.backRoomReturnGrace = 0;
                setGeneratorRecharging(false);
                soundEngine.stopGeneratorSound();
                soundEngine.setRechargingSilence(false);
                soundEngine.playRebootSuccess();
                triggerDoorShake();
              }
            }
          }

          if (!s.generatorRecharging) {
            let drainPerSec = config.baseDrainPerSecond;
            if (s.leftDoorClosed) drainPerSec += 0.24;
            if (s.rightDoorClosed) drainPerSec += 0.24;
            if (s.monitorOpen) drainPerSec += 0.14;
            if (s.flashlightOn) drainPerSec += 0.62;

            s.power = Math.max(0, s.power - drainPerSec * dt);
          }

          if (s.power <= 0) {
            s.isBlackout = true;
            s.leftDoorClosed = false;
            s.rightDoorClosed = false;
            s.flashlightOn = false;
            s.monitorOpen = false;
            s.maskOn = false;
            s.inBackRoom = false;
            s.generatorRecharging = false;
            s.hallEncounter = null;
            setIsBlackout(true);
            setLeftDoorClosed(false);
            setRightDoorClosed(false);
            setFlashlightOn(false);
            setMonitorOpen(false);
            setMaskOn(false);
            setGeneratorRecharging(false);
            setHallEncounter(null);
            if (viewRef.current === 'back') {
              setView('center');
            }
            soundEngine.setRechargingSilence(false);
            soundEngine.stopNightMusic();
            soundEngine.stopVentSound();
            soundEngine.stopCameraLureAudio();
            soundEngine.stopDoorSlam();
            soundEngine.stopDoorScare();
            soundEngine.stopHallwayNoise();
            soundEngine.stopGeneratorSound();
            soundEngine.stopTurnBreath();
            soundEngine.stopAmbience();
            soundEngine.stopMaskBreathing();
            soundEngine.playBlackoutJingle();
          }
        }
      } else {
        s.blackoutTimer += dt;
        if (s.blackoutTimer >= 6.5) {
          s.ended = true;
          const killerPool = activeEnemyIds.length > 0 ? activeEnemyIds : ENEMY_IDS;
          const killer = killerPool[Math.floor(Math.random() * killerPool.length)];
          const source: JumpscareSource =
            killer === 'charro'
              ? 'office'
              : Math.random() < 0.34
                ? 'left_door'
                : Math.random() < 0.5
                  ? 'right_door'
                  : 'hallway';
          const hours = Math.floor(s.elapsed / secondsPerHour);
          onJumpscare(killer, source, hours);
          return;
        }
      }

      // 3. Global 2s Post-Attack Recovery, Phone Cooldown & Random Overload Failures
      if (s.globalAttackRecovery > 0) {
        s.globalAttackRecovery = Math.max(0, s.globalAttackRecovery - dt);
      }
      if (s.phoneCooldown > 0) {
        s.phoneCooldown = Math.max(0, s.phoneCooldown - dt);
        if (s.phoneCooldown === 0) {
          soundEngine.stopCameraLureAudio();
        }
      }
      if (!cheats.noAudioErrorsInstant && !s.phoneFailed && Math.random() < config.phoneFailureRate * dt) {
        s.phoneFailed = true;
        setPhoneFailed(true);
        soundEngine.stopCameraLureAudio();
        if (s.monitorOpen) soundEngine.playErrorBeep();
      } else if (cheats.noAudioErrorsInstant && s.phoneFailed) {
        s.phoneFailed = false;
        setPhoneFailed(false);
      }

      // Progressive Night 7 Escalation (12 AM -> 6 AM: harder than Nights 1-6 while respecting 1-by-1 turns)
      const night7HourProgress = isNight7Normal
        ? Math.min(1, s.elapsed / Math.max(1, durationSeconds))
        : 0;
      const currentDoorPatience = isNight7Normal
        ? 2.85 - night7HourProgress * 0.6
        : effectiveDoorPatience;
      const currentHallPatience = isNight7Normal
        ? 2.15 - night7HourProgress * 0.4
        : effectiveHallPatience;
      const currentVentPatience = isNight7Normal
        ? 11.2 - night7HourProgress * 2.4
        : effectiveVentPatience;

      // 3b. Active-Enemy Vent Intrusion Cycle (In Night 7 Normal, vent intrusions ONLY launch via the 4-boss turn queue;
      // Champi and El Charro Negro NEVER attack via ventilation)
      const ventEligibleIds = activeEnemyIds.filter((id) => id !== 'charro' && id !== 'champi');
      if (
        !isNight7Normal &&
        !s.isBlackout &&
        !backRoomFreeze &&
        !champiDeactivatingOthers &&
        ventEligibleIds.length > 0
      ) {
        if (s.ventThreatEnemy === null) {
          if (
            s.globalAttackRecovery <= 0 &&
            !s.maskToxicLocked &&
            s.oxygen >= 55 &&
            s.charroOfficeTimer <= 0 &&
            !isAnyBossAttacking()
          ) {
            s.ventNextTimer -= dt;
            if (s.ventNextTimer <= 0) {
              if (s.ventQueue.length === 0) {
                s.ventQueue = buildShuffledVentQueue(ventEligibleIds);
              }
              const nextId =
                s.ventQueue.shift() ||
                ventEligibleIds[Math.floor(Math.random() * ventEligibleIds.length)];
              if (nextId && (!isCustomAI || aiLevels[nextId] > 0)) {
                s.ventThreatEnemy = nextId;
                s.ventFailTimer = 0;
                s.ventCreakPlayed = false;
                s.phoneCooldown = 0;
                setPhoneCooldown(0);
                soundEngine.playVentSound('alert');
                if (nextId === 'arbol') soundEngine.playArbolLaugh(0.42, false);
                else if (nextId === 'non') soundEngine.playNonLaugh(0.42, false);
                else if (nextId === 'champi') soundEngine.playChampiTires(0.42, false);
              } else {
                s.ventNextTimer = 10;
              }
            }
          }
        } else if (!s.phoneFailed) {
          s.ventFailTimer += dt;
        }
      } else if (
        isNight7Normal &&
        !s.isBlackout &&
        !backRoomFreeze &&
        !champiDeactivatingOthers &&
        s.ventThreatEnemy !== null &&
        !s.phoneFailed
      ) {
        s.ventFailTimer += dt;
      }

      // Pre-jumpscare creepy creak warning if player hasn't used Audio (ONLY for vent-capable enemies)
      if (
        s.ventThreatEnemy !== null &&
        s.ventThreatEnemy !== 'champi' &&
        s.ventThreatEnemy !== 'charro' &&
        !s.ventCreakPlayed &&
        !s.isBlackout &&
        !backRoomFreeze &&
        !champiDeactivatingOthers &&
        !s.phoneFailed
      ) {
        const creakByTime = s.ventFailTimer >= Math.max(1.5, currentVentPatience - 3.0);
        const creakByOxygen = !cheats.infiniteOxygen && s.oxygen <= 28;
        if (creakByTime || creakByOxygen) {
          s.ventCreakPlayed = true;
          soundEngine.playVentCreak(0.88);
        }
      }

      // 3c. Oxygen & Mask Toxicity System (Reaching 0% ALWAYS kills player with custom Oxygen Game Over)
      if (!s.isBlackout) {
        if (cheats.infiniteOxygen) {
          s.oxygen = 100;
          s.maskToxicLocked = false;
          s.wasOxygenDepleted = false;
          if (s.ventThreatEnemy !== null && s.ventFailTimer >= currentVentPatience) {
            const ventKiller = s.ventThreatEnemy;
            s.ended = true;
            s.ventThreatEnemy = null;
            soundEngine.stopNightMusic();
            soundEngine.stopVentSound();
            soundEngine.stopCameraLureAudio();
            soundEngine.stopMaskBreathing();
            onJumpscare(ventKiller, 'vent', Math.floor(s.elapsed / secondsPerHour));
            return;
          }
          s.breathingSyncAccum += dt;
          if (s.breathingSyncAccum >= 0.12) {
            s.breathingSyncAccum = 0;
            soundEngine.setBreathingState(s.maskOn || s.ventThreatEnemy !== null, 100);
          }
        } else {
          const maskDrain = s.maskOn ? 11.2 : 0;
          const ventDrain =
            !backRoomFreeze && !champiDeactivatingOthers && s.ventThreatEnemy !== null && !s.phoneFailed
              ? 100 / currentVentPatience
              : 0;
          const totalOxygenDrain = maskDrain + ventDrain;

          if (totalOxygenDrain > 0) {
            s.oxygen = Math.max(0, s.oxygen - totalOxygenDrain * dt);
            if (s.oxygen < 90) {
              s.wasOxygenDepleted = true;
            }

            if (s.oxygen <= 0 || (s.ventThreatEnemy !== null && s.ventFailTimer >= currentVentPatience)) {
              if (s.ventThreatEnemy !== null) {
                const ventKiller = s.ventThreatEnemy;
                s.ended = true;
                s.ventThreatEnemy = null;
                soundEngine.stopNightMusic();
                soundEngine.stopVentSound();
                soundEngine.stopCameraLureAudio();
                soundEngine.stopMaskBreathing();
                onJumpscare(ventKiller, 'vent', Math.floor(s.elapsed / secondsPerHour));
                return;
              }
              // Pure Oxygen 0% Suffocation Death (even without a vent enemy)
              s.ended = true;
              s.maskOn = false;
              setMaskOn(false);
              soundEngine.stopNightMusic();
              soundEngine.stopVentSound();
              soundEngine.stopCameraLureAudio();
              soundEngine.stopMaskBreathing();
              soundEngine.stopAmbience();
              onJumpscare(
                activeEnemyIds[0] || 'ton',
                'oxygen',
                Math.floor(s.elapsed / secondsPerHour)
              );
              return;
            }
          } else {
            s.oxygen = Math.min(100, s.oxygen + 22 * dt);
            if (s.oxygen >= 100) {
              s.oxygen = 100;
              if (s.maskToxicLocked) {
                s.maskToxicLocked = false;
                setMaskToxicLocked(false);
              }
              if (s.wasOxygenDepleted) {
                s.wasOxygenDepleted = false;
                triggerOxygenRestored();
              }
            }
          }

          s.breathingSyncAccum += dt;
          if (s.breathingSyncAccum >= 0.12) {
            s.breathingSyncAccum = 0;
            soundEngine.setBreathingState(
              s.maskOn || s.ventThreatEnemy !== null || s.oxygen < 94,
              s.oxygen
            );
          }
        }
      }

      // 4. Camera lens staring + Champi CCTV Interference Counter
      let enemyChanged = false;
      if (definitiveHoldInCameras) {
        // In Noche Definitiva, whenever Champi (CAM 01/02) or any Vent enemy is active,
        // keep all other enemies inside the Cameras until Champi & Ventilation are avoided.
        for (const holdId of activeEnemyIds) {
          if (holdId === 'champi' || holdId === s.ventThreatEnemy) continue;
          const he = s.enemies[holdId];
          if (
            he.location === 'left_door' ||
            he.location === 'right_door' ||
            he.location === 'hall_far' ||
            he.location === 'hall_near' ||
            he.location === 'office'
          ) {
            he.location =
              holdId === 'arbol' || holdId === 'non' || holdId === 'charro'
                ? 'cam9'
                : holdId === 'nita'
                  ? 'cam5'
                  : he.location === 'left_door'
                    ? 'cam1'
                    : 'cam2';
            he.attackTimer = 0;
            he.bangedDoor = false;
            if (holdId === 'charro' && s.charroOfficeTimer > 0) {
              s.charroOfficeTimer = 0;
              setCharroOfficeActive(false);
              soundEngine.stopCharroVoice();
            }
            if (s.hallEncounter?.enemyId === holdId) {
              s.hallEncounter = null;
              setHallEncounter(null);
            }
            enemyChanged = true;
          }
        }
      }
      if (s.champiBanishTimer > 0) {
        s.champiBanishTimer -= dt;
        if (s.champiBanishTimer <= 0) {
          s.champiBanishTimer = 0;
          s.champiBanishCam = null;
          setChampiInterferenceCam(null);
          s.enemies.champi.location = 'cam9';
          s.champiVisitedCams = ['cam9'];
          s.enemies.champi.attackTimer = 0;
          s.enemies.champi.moveCooldown = isDefinitiveNight ? 2.4 : 3.2;
          s.globalAttackRecovery = Math.max(s.globalAttackRecovery, 5.0);
          if (isNight7Normal && s.night7ActiveAttacker === 'champi') {
            finishNight7Turn('champi');
          }
          enemyChanged = true;
        }
      }

      if (s.monitorOpen && !s.isBlackout) {
        const camBroken = Boolean(s.brokenCams[s.activeCam] && s.brokenCams[s.activeCam]! > Date.now());
        const watchers = activeEnemyIds.filter((id) => s.enemies[id].location === s.activeCam);

        // Champi special counter: observing Champi in cameras triggers interference & banishes him to CAM 09
        const champiActive = activeEnemyIds.includes('champi');
        if (
          champiActive &&
          !camBroken &&
          s.enemies.champi.location === s.activeCam &&
          s.champiBanishTimer <= 0
        ) {
          s.enemies.champi.moveCooldown = Math.max(s.enemies.champi.moveCooldown, 0.35);
          s.champiWatchTimer += dt;
          if (s.champiWatchTimer >= 0.55) {
            s.champiWatchTimer = 0;
            s.champiBanishCam = s.activeCam;
            s.champiBanishTimer = 0.95;
            setChampiInterferenceCam(s.activeCam);
            soundEngine.playCamInterference(0.84);
          }
        } else {
          s.champiWatchTimer = 0;
        }

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
        s.champiWatchTimer = 0;
        s.lensTension = Math.max(0, s.lensTension - 30 * dt);
      }

      // 4b. FNaF 1 Adapted Custom AI Timers (Ton 3.02s, Toso/Tis 4.97s, Nita 5.01s; accelerated at Difficulty 40)
      if (isCustomAI && !otherEnemiesPaused && !s.isBlackout) {
        const ai = s.fnafAi;

        // Ton (3.02s interval, 2.25s in Difficulty 40 + CCTV stare cancellation/delay)
        if (aiLevels.ton > 0) {
          const tonEnemy = s.enemies.ton;
          const tonWatched = s.monitorOpen && tonEnemy.location === s.activeCam;
          if (
            tonEnemy.location !== 'left_door' &&
            tonEnemy.location !== 'right_door' &&
            tonEnemy.location !== 'hall_near'
          ) {
            if (ai.tonPendingMove) {
              if (tonWatched) {
                ai.tonWaitTimer = Math.max(ai.tonWaitTimer, 0.35);
              } else {
                ai.tonWaitTimer -= dt;
                if (ai.tonWaitTimer <= 0) {
                  ai.tonPendingMove = false;
                  advanceEnemyAI(tonEnemy, true);
                  enemyChanged = true;
                }
              }
            }
            ai.tonTimer -= dt;
            if (ai.tonTimer <= 0) {
              ai.tonTimer += isDefinitiveNight ? 2.25 : 3.02;
              const roll = Math.floor(Math.random() * 20) + 1;
              if (roll <= aiLevels.ton && !tonWatched && !ai.tonPendingMove) {
                ai.tonPendingMove = true;
                ai.tonWaitTimer = isDefinitiveNight
                  ? 0.25
                  : Math.max(0.35, (1000 - aiLevels.ton * 45) / 1000);
              }
            }
          }
        }

        // Toso (4.97s interval, 3.6s in Difficulty 40)
        if (aiLevels.toso > 0) {
          const tosoEnemy = s.enemies.toso;
          if (
            tosoEnemy.location !== 'left_door' &&
            tosoEnemy.location !== 'right_door' &&
            tosoEnemy.location !== 'hall_near'
          ) {
            ai.tosoTimer -= dt;
            if (ai.tosoTimer <= 0) {
              ai.tosoTimer += isDefinitiveNight ? 3.6 : 4.97;
              const roll = Math.floor(Math.random() * 20) + 1;
              if (roll <= aiLevels.toso) {
                advanceEnemyAI(tosoEnemy, true);
                enemyChanged = true;
              }
            }
          }
        }

        // Tis (4.97s interval, 3.6s in Difficulty 40)
        if (aiLevels.tis > 0) {
          const tisEnemy = s.enemies.tis;
          if (
            tisEnemy.location !== 'left_door' &&
            tisEnemy.location !== 'right_door' &&
            tisEnemy.location !== 'hall_near'
          ) {
            ai.tisTimer -= dt;
            if (ai.tisTimer <= 0) {
              ai.tisTimer += isDefinitiveNight ? 3.6 : 4.97;
              const roll = Math.floor(Math.random() * 20) + 1;
              if (roll <= aiLevels.tis) {
                advanceEnemyAI(tisEnemy, true);
                enemyChanged = true;
              }
            }
          }
        }

        // Nita (5.01s interval, 3.6s in Difficulty 40; camera observation suppresses check)
        if (aiLevels.nita > 0) {
          const nitaEnemy = s.enemies.nita;
          const nitaWatched = s.monitorOpen && nitaEnemy.location === s.activeCam;
          if (
            nitaEnemy.location !== 'left_door' &&
            nitaEnemy.location !== 'right_door' &&
            nitaEnemy.location !== 'hall_near'
          ) {
            ai.nitaTimer -= dt;
            if (ai.nitaTimer <= 0) {
              ai.nitaTimer += isDefinitiveNight ? 3.6 : 5.01;
              if (!nitaWatched) {
                const roll = Math.floor(Math.random() * 20) + 1;
                if (roll <= aiLevels.nita) {
                  if (nitaEnemy.location === 'hall_far') {
                    advanceEnemyAI(nitaEnemy, true);
                    enemyChanged = true;
                  } else {
                    ai.nitaStage += 1;
                    if (ai.nitaStage >= 2 || aiLevels.nita >= 14) {
                      ai.nitaStage = 0;
                      advanceEnemyAI(nitaEnemy, true);
                      enemyChanged = true;
                    }
                  }
                }
              }
            }
          }
        }
      }

      // 4c. Night 7 Turn-Taking Boss Scheduler (Strict 1-by-1 cyclic attack order: 1st -> 2nd -> 3rd -> 4th with 5s rest)
      // + Custom Night Boss Behaviors
      if (!otherEnemiesPaused && !s.isBlackout) {
        if (isNight7Normal) {
          const threatActiveNow = isAnyThreatInPlay();

          // Watchdog if current turn attacker stalls unexpectedly (longer allowance for Champi full-map cam patrol)
          if (s.night7ActiveAttacker !== null && !threatActiveNow && !s.charroPendingOffice) {
            s.night7TurnStall += dt;
            const stallLimit =
              s.night7ActiveAttacker === 'champi'
                ? 42.0
                : s.night7ActiveAttacker === 'non'
                  ? 24.0
                  : 7.5;
            if (s.night7TurnStall >= stallLimit) {
              finishNight7Turn(s.night7ActiveAttacker);
            }
          } else {
            s.night7TurnStall = 0;
          }

          // Dispatch next enemy turn ONLY when no other enemy is attacking and the 5s rest gap finished
          if (
            s.night7ActiveAttacker === null &&
            !threatActiveNow &&
            !backRoomFreeze
          ) {
            s.night7TurnGap -= dt;
            if (s.night7TurnGap <= 0 && s.globalAttackRecovery <= 0) {
              if (s.night7Queue.length === 0) {
                s.night7Queue = buildShuffledNight7Queue(s.night7LastAttacker);
              }
              const nextBoss = s.night7Queue.shift() || 'arbol';
              s.night7ActiveAttacker = nextBoss;
              s.night7TurnStall = 0;

              if (nextBoss === 'arbol') {
                const arbolEnemy = s.enemies.arbol;
                const roll = Math.random();
                if (roll < 0.18 && !s.maskToxicLocked && s.oxygen >= 55) {
                  s.ventThreatEnemy = 'arbol';
                  s.ventFailTimer = 0;
                  s.ventCreakPlayed = false;
                  s.phoneCooldown = 0;
                  setPhoneCooldown(0);
                  soundEngine.playVentSound('alert');
                  soundEngine.playArbolLaugh(0.42, false);
                } else if (roll < 0.5) {
                  arbolEnemy.location = 'left_door';
                  arbolEnemy.attackTimer = 0;
                  arbolEnemy.bangedDoor = false;
                  soundEngine.playArbolLaugh(0.78, false);
                  enemyChanged = true;
                } else if (roll < 0.82) {
                  arbolEnemy.location = 'right_door';
                  arbolEnemy.attackTimer = 0;
                  arbolEnemy.bangedDoor = false;
                  soundEngine.playArbolLaugh(0.78, false);
                  enemyChanged = true;
                } else {
                  arbolEnemy.location = 'hall_near';
                  arbolEnemy.attackTimer = 0;
                  soundEngine.playArbolLaugh(0.84, true);
                  enemyChanged = true;
                }
              } else if (nextBoss === 'charro') {
                // Charro breaks 1 random camera lens and ONLY manifests in Center Office (never doors or vents)
                const unbroken = CAMERA_ROOMS.filter(
                  (r) => !(s.brokenCams[r.id] && s.brokenCams[r.id]! > Date.now())
                );
                if (unbroken.length > 0) {
                  const target = unbroken[Math.floor(Math.random() * unbroken.length)];
                  s.enemies.charro.location = target.id;
                  s.brokenCams = {
                    ...s.brokenCams,
                    [target.id]: Date.now() + 14000,
                  };
                  setBrokenCams({ ...s.brokenCams });
                  soundEngine.playGlassBreak(0.84);
                  enemyChanged = true;
                }
                if (!s.maskOn && !s.monitorOpen) {
                  s.charroOfficeTimer = Math.max(2.1, 3.05 - night7HourProgress * 0.65);
                  s.enemies.charro.location = 'office';
                  setCharroOfficeActive(true);
                  soundEngine.playCharroVoice(0.88);
                  enemyChanged = true;
                } else {
                  s.charroPendingOffice = true;
                  s.charroPendingTimer = 0;
                }
              } else if (nextBoss === 'champi') {
                // Champi NEVER uses ventilation: starts at CAM 09 and patrols all cameras before reaching CAM 01/02
                const champiMover = s.enemies.champi;
                champiMover.location = 'cam9';
                s.champiVisitedCams = ['cam9'];
                s.night7TurnStall = 0;
                soundEngine.playChampiTires(0.68, false);
                champiMover.moveCooldown = 1.25;
                enemyChanged = true;
              } else if (nextBoss === 'non') {
                const mover = s.enemies.non;
                const ventRoll = Math.random();
                if (ventRoll < 0.18 && !s.maskToxicLocked && s.oxygen >= 55) {
                  s.ventThreatEnemy = 'non';
                  s.ventFailTimer = 0;
                  s.ventCreakPlayed = false;
                  s.phoneCooldown = 0;
                  setPhoneCooldown(0);
                  soundEngine.playVentSound('alert');
                  soundEngine.playNonLaugh(0.42, false);
                } else {
                  if (mover.location !== 'cam1' && mover.location !== 'cam2') {
                    mover.location = Math.random() < 0.5 ? 'cam1' : 'cam2';
                    soundEngine.playNonCrawl(0.64);
                    mover.moveCooldown = 0.62;
                    enemyChanged = true;
                  } else {
                    mover.moveCooldown = 0.25;
                  }
                }
              }
            }
          }

          // Background camera patrol for Árbol when it is NOT his turn (purely visual on CCTV, never attacks)
          if (s.night7ActiveAttacker !== 'arbol') {
            const arbolEnemy = s.enemies.arbol;
            if (
              arbolEnemy.location !== 'left_door' &&
              arbolEnemy.location !== 'right_door' &&
              arbolEnemy.location !== 'hall_near'
            ) {
              s.arbolTeleportTimer -= dt;
              if (s.arbolTeleportTimer <= 0) {
                s.arbolTeleportTimer = 4.5 + Math.random() * 2.5;
                const patrolCams: CameraId[] = ['cam3', 'cam4', 'cam5', 'cam6', 'cam7', 'cam8', 'cam9', 'cam10'];
                const nextCam = patrolCams[Math.floor(Math.random() * patrolCams.length)];
                if (nextCam !== arbolEnemy.location) {
                  arbolEnemy.location = nextCam;
                  enemyChanged = true;
                }
              }
            }
          }

          // Handle El Charro Negro active office threat OR pending office entry
          // El Charro Negro can ONLY kill if player does NOT use Mask or Cameras!
          if (s.night7ActiveAttacker === 'charro') {
            if (s.charroOfficeTimer > 0) {
              if (s.maskOn || s.monitorOpen) {
                s.charroOfficeTimer = 0;
                s.enemies.charro.location = 'cam9';
                setCharroOfficeActive(false);
                soundEngine.stopCharroVoice();
                finishNight7Turn('charro');
                enemyChanged = true;
              } else if (!backRoomFreeze) {
                s.charroOfficeTimer -= dt;
                if (s.charroOfficeTimer <= 0) {
                  s.ended = true;
                  setCharroOfficeActive(false);
                  soundEngine.stopNightMusic();
                  soundEngine.stopVentSound();
                  soundEngine.stopMaskBreathing();
                  onJumpscare('charro', 'office', Math.floor(s.elapsed / secondsPerHour));
                  return;
                }
              }
            } else if (s.charroPendingOffice && !backRoomFreeze) {
              if (!s.maskOn && !s.monitorOpen) {
                s.charroPendingOffice = false;
                s.charroPendingTimer = 0;
                s.charroOfficeTimer = Math.max(2.1, 3.05 - night7HourProgress * 0.65);
                s.enemies.charro.location = 'office';
                setCharroOfficeActive(true);
                soundEngine.playCharroVoice(0.88);
                enemyChanged = true;
              } else {
                // Player already has Mask or Cameras open: Charro cannot kill through them, so after 1.8s his turn resolves cleanly
                s.charroPendingTimer += dt;
                if (s.charroPendingTimer >= 1.8) {
                  s.charroPendingOffice = false;
                  s.charroPendingTimer = 0;
                  s.enemies.charro.location = 'cam9';
                  finishNight7Turn('charro');
                  enemyChanged = true;
                }
              }
            }
          }
        } else {
          // Custom Night Boss Behaviors (with mutual-exclusion protection)
          if (activeEnemyIds.includes('arbol')) {
            const arbolEnemy = s.enemies.arbol;
            const arbolAiLvl = aiLevels.arbol;
              if (arbolAiLvl > 0 && arbolEnemy.location !== 'left_door' && arbolEnemy.location !== 'right_door' && arbolEnemy.location !== 'hall_near') {
                s.arbolTeleportTimer -= dt;
                if (s.arbolTeleportTimer <= 0) {
                  s.arbolTeleportTimer = isDefinitiveNight
                    ? 2.1 + Math.random() * 0.9
                    : Math.max(2.6, 7.6 - arbolAiLvl * 0.22) + Math.random() * 1.4;
                  const attackBlockedNow =
                    backRoomFreeze ||
                    s.ventThreatEnemy !== null ||
                    s.charroOfficeTimer > 0 ||
                    s.globalAttackRecovery > 0 ||
                    isAnyThreatInPlay('arbol');
                  const inHallNow =
                    activeEnemyIds.some((oid) => {
                      const ol = s.enemies[oid].location;
                      return ol === 'hall_far' || ol === 'hall_near';
                    }) || s.hallEncounter !== null;
                  const atDoorNow = activeEnemyIds.some((oid) => {
                    const ol = s.enemies[oid].location;
                    return ol === 'left_door' || ol === 'right_door';
                  });

                  const roll = Math.random();
                  if (!attackBlockedNow && roll < 0.16 && s.ventThreatEnemy === null) {
                    s.ventThreatEnemy = 'arbol';
                    s.ventFailTimer = 0;
                    s.ventCreakPlayed = false;
                    soundEngine.playVentSound('alert');
                    soundEngine.playArbolLaugh(0.42, false);
                  } else if (!attackBlockedNow && roll < 0.42 && !inHallNow && !atDoorNow) {
                    const doorPick: EnemyLocation = Math.random() < 0.5 ? 'left_door' : 'right_door';
                    arbolEnemy.location = doorPick;
                    arbolEnemy.attackTimer = 0;
                    arbolEnemy.bangedDoor = false;
                    soundEngine.playArbolLaugh(0.78, false);
                    enemyChanged = true;
                  } else if (!attackBlockedNow && roll < 0.62 && !atDoorNow && !inHallNow) {
                    arbolEnemy.location = 'hall_near';
                    arbolEnemy.attackTimer = 0;
                    soundEngine.playArbolLaugh(0.84, true);
                    enemyChanged = true;
                  } else {
                    const camIds = CAMERA_ROOMS.map((r) => r.id);
                    const nextCam = camIds[Math.floor(Math.random() * camIds.length)];
                    if (nextCam !== arbolEnemy.location) {
                      arbolEnemy.location = nextCam;
                      soundEngine.playArbolLaugh(0.56, false);
                      enemyChanged = true;
                    }
                  }
                }
              }
            }

            if (activeEnemyIds.includes('charro')) {
              const charroAiLvl = aiLevels.charro;
              if (charroAiLvl > 0) {
                if (s.charroOfficeTimer > 0) {
                  if (s.maskOn || s.monitorOpen) {
                    s.charroOfficeTimer = 0;
                    s.enemies.charro.location = 'cam9';
                    s.charroOfficeCooldown = isDefinitiveNight
                      ? 6.5
                      : Math.max(8.5, 22 - charroAiLvl * 0.65);
                    s.globalAttackRecovery = Math.max(s.globalAttackRecovery, 5.0);
                    setCharroOfficeActive(false);
                    soundEngine.stopCharroVoice();
                    enemyChanged = true;
                  } else if (!backRoomFreeze) {
                    s.charroOfficeTimer -= dt;
                    if (s.charroOfficeTimer <= 0) {
                      s.ended = true;
                      setCharroOfficeActive(false);
                      soundEngine.stopNightMusic();
                      soundEngine.stopVentSound();
                      soundEngine.stopMaskBreathing();
                      onJumpscare('charro', 'office', Math.floor(s.elapsed / secondsPerHour));
                      return;
                    }
                  }
                } else {
                  s.charroCamBreakTimer -= dt;
                  if (s.charroCamBreakTimer <= 0) {
                    s.charroCamBreakTimer = isDefinitiveNight
                      ? 4.6 + Math.random() * 1.6
                      : Math.max(5.5, 13.5 - charroAiLvl * 0.36) + Math.random() * 2.5;
                    const unbroken = CAMERA_ROOMS.filter(
                      (r) => !(s.brokenCams[r.id] && s.brokenCams[r.id]! > Date.now())
                    );
                    if (unbroken.length > 0) {
                      const target = unbroken[Math.floor(Math.random() * unbroken.length)];
                      s.enemies.charro.location = target.id;
                      s.brokenCams = {
                        ...s.brokenCams,
                        [target.id]: Date.now() + 14000,
                      };
                      setBrokenCams({ ...s.brokenCams });
                      soundEngine.playGlassBreak(0.84);
                      soundEngine.playCharroVoice(0.42, 1900);
                      enemyChanged = true;
                    }
                  }

                  if (
                    !backRoomFreeze &&
                    !s.maskOn &&
                    !s.monitorOpen &&
                    !isAnyThreatInPlay() &&
                    s.globalAttackRecovery <= 0
                  ) {
                    s.charroOfficeCooldown -= dt;
                    if (s.charroOfficeCooldown <= 0) {
                      s.charroOfficeTimer = isDefinitiveNight
                        ? 1.85
                        : Math.max(2.4, 4.1 - charroAiLvl * 0.06);
                      s.enemies.charro.location = 'office';
                      setCharroOfficeActive(true);
                      soundEngine.playCharroVoice(0.88);
                      enemyChanged = true;
                    }
                  }
                }
              }
            }
          }
        }

        // 5. Dynamic Telechobi & Boss AI + Door/Hallway Attack Resolution
        const attackFreezeActive =
          backRoomFreeze ||
          s.ventThreatEnemy !== null ||
          s.charroOfficeTimer > 0 ||
          s.globalAttackRecovery > 0;

        for (const id of activeEnemyIds) {
          if (isCustomAI && aiLevels[id] <= 0) continue;
          // When Champi reaches CAM 01/02 OR (in Noche Definitiva) someone is in Ventilation, all other enemies stay in Cameras
          if (otherEnemiesPaused && id !== 'champi') continue;
          // El Charro Negro ONLY attacks directly in Center Office (never doors, hallways or vents)
          const enemy = s.enemies[id];
          if (id === 'charro') {
            continue;
          }

        if (enemy.location === 'left_door') {
          if (s.leftDoorClosed) {
            enemy.attackTimer += dt;
            if (enemy.attackTimer >= 2.0 && !enemy.bangedDoor) {
              enemy.bangedDoor = true;
              soundEngine.playDoorThuds();
              triggerDoorShake();
              enemy.location =
                id === 'arbol' || id === 'non' || id === 'champi'
                  ? 'cam9'
                  : 'cam6';
              enemy.attackTimer = 0;
              enemy.moveCooldown = Math.max(2.0, config.moveIntervalSeconds);
              const isBossRetreat = isNight7Normal || id === 'arbol' || id === 'non' || id === 'champi';
              s.globalAttackRecovery = isBossRetreat ? 5.0 : 2.0;
              finishNight7Turn(id);
              enemyChanged = true;
            }
          } else if (!attackFreezeActive) {
            enemy.attackTimer += dt;
            if (enemy.attackTimer >= currentDoorPatience) {
              s.ended = true;
              soundEngine.stopNightMusic();
              soundEngine.stopVentSound();
              soundEngine.stopMaskBreathing();
              onJumpscare(id, 'left_door', Math.floor(s.elapsed / secondsPerHour));
              return;
            }
          }
        } else if (enemy.location === 'right_door') {
          if (s.rightDoorClosed) {
            enemy.attackTimer += dt;
            if (enemy.attackTimer >= 2.0 && !enemy.bangedDoor) {
              enemy.bangedDoor = true;
              soundEngine.playDoorThuds();
              triggerDoorShake();
              enemy.location =
                id === 'arbol' || id === 'non' || id === 'champi'
                  ? 'cam9'
                  : 'cam4';
              enemy.attackTimer = 0;
              enemy.moveCooldown = Math.max(2.0, config.moveIntervalSeconds);
              const isBossRetreat = isNight7Normal || id === 'arbol' || id === 'non' || id === 'champi';
              s.globalAttackRecovery = isBossRetreat ? 5.0 : 2.0;
              finishNight7Turn(id);
              enemyChanged = true;
            }
          } else if (!attackFreezeActive) {
            enemy.attackTimer += dt;
            if (enemy.attackTimer >= currentDoorPatience) {
              s.ended = true;
              soundEngine.stopNightMusic();
              soundEngine.stopVentSound();
              soundEngine.stopMaskBreathing();
              onJumpscare(id, 'right_door', Math.floor(s.elapsed / secondsPerHour));
              return;
            }
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
                const retreatPool: CameraId[] =
                  id === 'arbol' || id === 'non' || id === 'champi'
                    ? ['cam8', 'cam9', 'cam10']
                    : ['cam1', 'cam2', 'cam3', 'cam5'];
                enemy.location = retreatPool[Math.floor(Math.random() * retreatPool.length)];
                enemy.attackTimer = 0;
                enemy.moveCooldown = Math.max(2.0, config.moveIntervalSeconds * 1.05);
                const isBossRetreat = isNight7Normal || id === 'arbol' || id === 'non' || id === 'champi';
                s.globalAttackRecovery = isBossRetreat ? 5.0 : 2.0;
                finishNight7Turn(id);
                enemyChanged = true;
              }
            }
          } else if (!attackFreezeActive) {
            if (s.hallEncounter && s.hallEncounter.enemyId === id) {
              if (s.hallEncounter.phase === 'inspect') {
                s.ended = true;
                s.hallEncounter = null;
                setHallEncounter(null);
                soundEngine.stopNightMusic();
                soundEngine.stopVentSound();
                soundEngine.stopMaskBreathing();
                onJumpscare(id, 'hallway', Math.floor(s.elapsed / secondsPerHour));
                return;
              } else {
                s.hallEncounter = null;
                setHallEncounter(null);
                enemy.location = id === 'arbol' || id === 'non' || id === 'champi' ? 'cam9' : 'cam5';
                enemy.attackTimer = 0;
                enemy.moveCooldown = Math.max(2.0, config.moveIntervalSeconds);
                const isBossRetreat = isNight7Normal || id === 'arbol' || id === 'non' || id === 'champi';
                s.globalAttackRecovery = isBossRetreat ? 5.0 : 2.0;
                finishNight7Turn(id);
                enemyChanged = true;
                continue;
              }
            }

            enemy.attackTimer += dt;
            if (enemy.attackTimer >= currentHallPatience) {
              s.ended = true;
              soundEngine.stopNightMusic();
              soundEngine.stopVentSound();
              soundEngine.stopMaskBreathing();
              onJumpscare(id, 'hallway', Math.floor(s.elapsed / secondsPerHour));
              return;
            }
          }
        } else if (!enemiesDeactivated && id !== 'arbol') {
          // Classic mode OR Night 7 cam-by-cam movers (Ñon & Champi) + Custom Night 7 cam movers
          const isBossCamMover = id === 'non' || id === 'champi';
          if (!isCustomAI || isBossCamMover) {
            const tickScale = isNight7Normal && s.night7ActiveAttacker === id ? 1.45 : 1.0;
            enemy.moveCooldown -= dt * tickScale;
            if (enemy.moveCooldown <= 0) {
              let killedNow = false;
              if (isCustomAI && isBossCamMover) {
                const champiReadyAtFinalCam =
                  id === 'champi' && (enemy.location === 'cam1' || enemy.location === 'cam2');
                const bossRoll = Math.floor(Math.random() * 20) + 1;
                if (champiReadyAtFinalCam || bossRoll <= aiLevels[id]) {
                  killedNow = advanceEnemyAI(enemy, true);
                } else {
                  enemy.moveCooldown = 1.6;
                }
              } else {
                killedNow = advanceEnemyAI(enemy);
              }
              if (killedNow) return;
              enemyChanged = true;
            }
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
        setOxygen(s.oxygen);

        if (enemyChanged) {
          setEnemyLocations({
            ton: s.enemies.ton.location,
            toso: s.enemies.toso.location,
            nita: s.enemies.nita.location,
            tis: s.enemies.tis.location,
            arbol: s.enemies.arbol.location,
            champi: s.enemies.champi.location,
            non: s.enemies.non.location,
            charro: s.enemies.charro.location,
          });
        }
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [
    callScript,
    config,
    night,
    isCustomAI,
    isDefinitiveNight,
    isNight7Normal,
    aiLevels,
    activeEnemyIds,
    cheats.infinitePower,
    cheats.infiniteOxygen,
    cheats.noAudioErrorsInstant,
    durationSeconds,
    secondsPerHour,
    onJumpscare,
    onNightWin,
    triggerOxygenRestored,
    triggerDoorShake,
    finishNight7Turn,
  ]);

  // Derived Clock String scaled cleanly to durationSeconds (12:00 AM .. 5:59 AM)
  const currentHourIndex = Math.min(5, Math.floor(elapsedSec / secondsPerHour));
  const hourDisplay = currentHourIndex === 0 ? '12:00 AM' : `${currentHourIndex}:00 AM`;
  const minutesIntoHour = Math.min(
    59,
    Math.floor(((elapsedSec % secondsPerHour) / secondsPerHour) * 60)
  );
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

  const visibleEnemyLocations = (Object.keys(enemyLocations) as TelechobiId[]).reduce(
    (acc, id) => {
      const visible = activeEnemyIds.includes(id) || deactivatedEnemies.includes(id);
      acc[id] = visible ? enemyLocations[id] : 'office';
      return acc;
    },
    {} as Record<TelechobiId, EnemyLocation>
  );

  const leftDoorEnemy = activeEnemyIds.find((id) => enemyLocations[id] === 'left_door') || null;
  const rightDoorEnemy = activeEnemyIds.find((id) => enemyLocations[id] === 'right_door') || null;
  const hallwayNearEnemy = activeEnemyIds.find((id) => enemyLocations[id] === 'hall_near') || null;
  const hallwayFarEnemy = activeEnemyIds.find((id) => enemyLocations[id] === 'hall_far') || null;

  // Keep studio room acoustics, CRT buzz & threat sub-drone organically synced to visual state
  useEffect(() => {
    soundEngine.setOfficeState({
      monitorOpen,
      maskOn,
      nearbyThreat: Boolean(
        leftDoorEnemy || rightDoorEnemy || hallwayNearEnemy || hallwayFarEnemy || charroOfficeActive
      ),
      power,
    });
  }, [
    monitorOpen,
    maskOn,
    leftDoorEnemy,
    rightDoorEnemy,
    hallwayNearEnemy,
    hallwayFarEnemy,
    charroOfficeActive,
    power,
  ]);

  // Play FNAF 2 hallway horror sound ONLY for classic Telechobis & NEVER simultaneously with Night-7 boss audio
  useEffect(() => {
    if (isBlackout || (!hallwayNearEnemy && !hallwayFarEnemy && !hallEncounter)) {
      hallwaySpotRef.current = null;
      soundEngine.stopHallwayNoise();
      return;
    }

    const hallId = hallwayNearEnemy || hallwayFarEnemy || hallEncounter?.enemyId;
    const isBossInHall = hallId === 'arbol' || hallId === 'non' || hallId === 'champi';

    if (
      !isBossInHall &&
      view === 'center' &&
      flashlightOn &&
      !monitorOpen &&
      (!maskOn || cheats.infiniteOxygen)
    ) {
      const spotKey = `${hallwayNearEnemy || ''}|${hallwayFarEnemy || ''}`;
      if (hallwaySpotRef.current !== spotKey) {
        hallwaySpotRef.current = spotKey;
        if (!soundEngine.isHallwayNoisePlaying() && !soundEngine.isBossWarningActive()) {
          soundEngine.playHallwayNoise();
        }
      }
    } else if (!flashlightOn) {
      hallwaySpotRef.current = null;
    }
  }, [
    isBlackout,
    view,
    flashlightOn,
    monitorOpen,
    maskOn,
    cheats.infiniteOxygen,
    hallwayNearEnemy,
    hallwayFarEnemy,
    hallEncounter,
  ]);

  // Play FNAF 1 Animatronic At Door SFX immediately whenever an enemy appears at an open Left/Right door
  useEffect(() => {
    if (isBlackout || monitorOpen) {
      doorSpotRef.current.left = null;
      doorSpotRef.current.right = null;
      return;
    }

    if (view === 'left' && !leftDoorClosed && leftDoorEnemy) {
      if (doorSpotRef.current.left !== leftDoorEnemy) {
        doorSpotRef.current.left = leftDoorEnemy;
        soundEngine.playDoorScare();
      }
    } else {
      doorSpotRef.current.left = null;
    }

    if (view === 'right' && !rightDoorClosed && rightDoorEnemy) {
      if (doorSpotRef.current.right !== rightDoorEnemy) {
        doorSpotRef.current.right = rightDoorEnemy;
        soundEngine.playDoorScare();
      }
    } else {
      doorSpotRef.current.right = null;
    }
  }, [isBlackout, monitorOpen, view, leftDoorClosed, rightDoorClosed, leftDoorEnemy, rightDoorEnemy]);

  const turnAnimClass =
    turnAnim === 'left'
      ? 'animate-turn-left'
      : turnAnim === 'right'
        ? 'animate-turn-right'
        : turnAnim === 'back'
          ? 'animate-turn-back'
          : '';

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
      } ${turnAnimClass}`}
    >
      {/* ===================== 3-PANEL PANORAMIC OFFICE VIEWPORT ===================== */}
      <div
        className="relative w-[300vw] h-full flex transition-transform duration-200 ease-out"
        style={{
          transform:
            view === 'left'
              ? 'translateX(0vw)'
              : view === 'right'
                ? 'translateX(-200vw)'
                : 'translateX(-100vw)',
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
              disabled={maskToxicLocked && !maskOn}
              onClick={toggleMask}
              title={
                maskToxicLocked
                  ? 'Máscara bloqueada por toxicidad hasta recuperar 100% de oxígeno'
                  : 'Colocarse máscara de Telechobi (M)'
              }
              className={`pointer-events-auto group relative flex flex-col items-center focus-visible:outline-none ${
                maskToxicLocked && !maskOn ? 'opacity-45 cursor-not-allowed' : 'cursor-pointer'
              }`}
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
                {maskToxicLocked ? 'BLOQUEO TÓXICO' : 'MÁSCARA [M]'}
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

      {/* ===================== BACK ROOM & GENERATOR RECHARGE VIEW ===================== */}
      {generatorEnabled && view === 'back' && !isBlackout && (
        <div className="fixed inset-0 z-[26] bg-[#040405] overflow-hidden flex items-center justify-center">
          {/* Abandoned Back Server/Storage Room Environment */}
          <img
            src={OFFICE_ASSETS.backRoom}
            alt="Habitación trasera de generador eléctrico"
            referrerPolicy="no-referrer"
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
              generatorRecharging
                ? 'brightness-[0.68] contrast-115 sepia-[.12]'
                : 'brightness-[0.52] contrast-120 sepia-[.18]'
            }`}
          />

          {/* Cohesive studio darkness perimeter vignette */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 76% 74% at 54% 52%, transparent 28%, rgba(4,4,5,0.72) 72%, rgba(4,4,5,0.96) 100%)',
            }}
          />

          {/* Subtle warm tungsten work-lamp pool over the workbench generator */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
            style={{
              background: generatorRecharging
                ? 'radial-gradient(circle 340px at 66% 60%, rgba(251,191,36,0.22) 0%, rgba(16,185,129,0.08) 45%, transparent 78%)'
                : 'radial-gradient(circle 280px at 66% 60%, rgba(255,214,140,0.12) 0%, transparent 75%)',
            }}
          />

          {/* Interactive Antique Copper-Coil Generator placed organically on the workbench */}
          <button
            type="button"
            onClick={handleToggleGenerator}
            aria-label="Presionar generador eléctrico para recargar energía"
            className="group relative z-30 mt-20 sm:mt-16 sm:ml-44 flex flex-col items-center cursor-pointer focus-visible:outline-none"
          >
            <div
              className={`relative transition-transform duration-150 ${
                generatorRecharging
                  ? 'scale-[1.03] animate-[pulse_1.1s_ease-in-out_infinite]'
                  : 'group-hover:scale-[1.03] group-active:scale-95'
              }`}
            >
              <img
                src={OFFICE_ASSETS.generator}
                alt="Generador eléctrico antiguo con bobina de cobre"
                referrerPolicy="no-referrer"
                className={`w-[58vw] max-w-[300px] sm:w-[290px] md:w-[340px] h-auto object-contain transition-all ${
                  generatorRecharging
                    ? 'brightness-105 contrast-115 drop-shadow-[0_18px_28px_rgba(0,0,0,0.98)]'
                    : leftDoorClosed || rightDoorClosed
                      ? 'brightness-[0.65] contrast-115 sepia-[.2] drop-shadow-[0_18px_24px_rgba(0,0,0,0.96)]'
                      : 'brightness-[0.84] contrast-115 sepia-[.12] group-hover:brightness-105 drop-shadow-[0_18px_24px_rgba(0,0,0,0.96)]'
                }`}
              />
            </div>

            <span
              className={`-mt-2 px-3 py-1 border font-mono-tech text-[10px] sm:text-xs font-bold tracking-wider shadow-[0_8px_20px_rgba(0,0,0,0.95)] ${
                generatorRecharging
                  ? 'bg-emerald-950/95 border-emerald-400 text-emerald-200'
                  : leftDoorClosed || rightDoorClosed
                    ? 'bg-[#2a0c0a]/95 border-red-500/80 text-red-200'
                    : 'bg-[#15110d]/95 border-amber-500/70 text-amber-200 group-hover:border-amber-300'
              }`}
            >
              {generatorRecharging
                ? `GENERADOR · ${Math.ceil(power)}%`
                : leftDoorClosed || rightDoorClosed
                  ? 'PUERTA CERRADA'
                  : 'GENERADOR'}
            </span>
          </button>
        </div>
      )}

      {/* ===================== EL CHARRO NEGRO DIRECT CENTER OFFICE APPARITION ===================== */}
      {charroOfficeActive && !isBlackout && view === 'center' && !monitorOpen && !maskOn && (
        <div className="pointer-events-none fixed inset-0 z-[34] flex items-end justify-center overflow-hidden">
          <div
            className="absolute inset-0 animate-room-flicker"
            style={{
              background:
                'radial-gradient(circle at 50% 48%, rgba(127,29,29,0.28) 0%, rgba(0,0,0,0.86) 76%)',
            }}
          />
          <div className="relative h-[86vh] w-auto flex items-end justify-center animate-hall-charro">
            <TelechobiSprite id="charro" variant="hall_confront" className="h-[86vh] w-auto" />
          </div>
          <div className="absolute bottom-24 px-3.5 py-1 bg-[#1e0a0a]/90 border border-red-500/80 font-mono-tech text-[11px] font-bold text-red-200 tracking-wider animate-pulse">
            EL CHARRO NEGRO · ¡PONTE LA MÁSCARA [M] O ABRE CÁMARAS [W] AHORA!
          </div>
        </div>
      )}

      {/* ===================== IN-FRONT-OF-DESK HALLWAY CONFRONTATION + FLICKER ===================== */}
      {hallEncounter && (
        <div className="pointer-events-none fixed inset-0 z-[35] flex items-end justify-center overflow-hidden">
          <div className="absolute inset-0 bg-black animate-room-flicker" />
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

      {/* ===================== FIRST-PERSON HANDS LIFTING/LOWERING MASK OR MONITOR ===================== */}
      <FirstPersonHandOverlay action={handAction} />

      {/* ===================== FIRST-PERSON TELECHOBI MASK OVERLAY ===================== */}
      <TelechobiMaskOverlay active={maskOn} oxygenPct={cheats.infiniteOxygen ? 100 : oxygen} />

      {/* ===================== OXYGEN DEPRIVATION TUNNEL VISION & RECOVERY FLASH ===================== */}
      {!isBlackout && !cheats.infiniteOxygen && oxygen < 78 && (
        <div
          className={`pointer-events-none fixed inset-0 z-[41] transition-opacity duration-150 ${
            oxygen <= 50 ? 'animate-oxygen-low' : ''
          }`}
          style={{
            background: `radial-gradient(circle at 50% 50%, transparent ${Math.max(
              6,
              Math.round((oxygen / 78) * 48)
            )}%, rgba(0,0,0,${Math.min(0.98, 0.42 + ((78 - oxygen) / 78) * 0.56).toFixed(
              2
            )}) ${Math.max(30, Math.round(32 + (oxygen / 78) * 58))}%, rgba(0,0,0,0.99) 100%)`,
          }}
        />
      )}

      {!isBlackout && !cheats.infiniteOxygen && oxygenRestoredBanner && (
        <div className="pointer-events-none fixed inset-0 z-[42] animate-oxygen-restored">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(52, 211, 153, 0.08) 0%, rgba(16, 185, 129, 0.24) 48%, rgba(6, 78, 59, 0.45) 85%, transparent 100%)',
            }}
          />
        </div>
      )}

      {/* ===================== CCTV MONITOR OVERLAY (1990s Mexico CRT) ===================== */}
      {monitorOpen && !isBlackout && (
        <CctvMonitor
          activeCam={activeCam}
          onSelectCam={setActiveCam}
          enemyRooms={visibleEnemyLocations}
          brokenCams={brokenCams}
          deactivatedEnemies={deactivatedEnemies}
          champiInterferenceCam={champiInterferenceCam}
          radarActive={Boolean(cheats.radar)}
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
      {isBlackout && <div className="pointer-events-none fixed inset-0 z-20 bg-black/85" />}

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
        <div className="flex flex-col items-end gap-1.5">
          <div className="relative text-right rust-panel-90s px-4 py-2 border overflow-hidden">
            <CobwebCorner position="top-right" className="w-10 h-10 opacity-45" />
            <div className="font-display text-3xl leading-none text-[#efe7d2] tabular-nums">
              {hourDisplay}
            </div>
            <div className="font-mono-tech text-[11px] text-[#b8ae95] mt-1">
              {isDefinitiveNight
                ? 'NOCHE DEFINITIVA 8/40'
                : isCustomAI
                  ? 'PERSONALIZADA'
                  : `NOCHE ${night}`}{' '}
              · {formattedClock}
            </div>
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

      {/* Left / Right Turn Arrows (Allowed while Mask is ON if infiniteOxygen cheat is enabled) */}
      {!monitorOpen && (!maskOn || cheats.infiniteOxygen) && view !== 'left' && view !== 'back' && (
        <button
          type="button"
          onClick={turnLeft}
          aria-label="Mirar a la izquierda"
          className="fixed left-3 top-1/2 -translate-y-1/2 z-40 w-11 sm:w-12 h-24 sm:h-28 rust-panel-90s border-2 text-[#dfd5bd] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}

      {!monitorOpen && (!maskOn || cheats.infiniteOxygen) && view !== 'right' && view !== 'back' && (
        <button
          type="button"
          onClick={turnRight}
          aria-label="Mirar a la derecha"
          className="fixed right-3 top-1/2 -translate-y-1/2 z-40 w-11 sm:w-12 h-24 sm:h-28 rust-panel-90s border-2 text-[#dfd5bd] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}

      {/* Generator Back Room Turn Around Button */}
      {generatorEnabled &&
        !monitorOpen &&
        (!maskOn || cheats.infiniteOxygen) &&
        !isBlackout &&
        (view === 'center' || view === 'back') && (
          <button
            type="button"
            onClick={view === 'back' ? turnBackToOffice : turnToBackRoom}
            className="fixed bottom-[144px] sm:bottom-[88px] left-1/2 -translate-x-1/2 z-40 px-3.5 py-1.5 rust-panel-90s border-2 border-amber-500/70 hover:border-amber-300 font-mono-tech text-[10px] sm:text-xs font-bold text-amber-200 tracking-wider whitespace-nowrap shadow-[0_10px_28px_rgba(0,0,0,0.95)] cursor-pointer transition-colors"
          >
            {view === 'back' ? 'VOLVER A OFICINA [↑ / B]' : 'GIRAR ATRÁS · GENERADOR [↓ / B]'}
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
                power < 20 && !cheats.infinitePower ? 'text-red-400' : 'text-[#efe7d2]'
              }`}
            >
              {cheats.infinitePower ? '100%' : `${Math.ceil(power)}%`}
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
          <div className="mt-1.5 pt-1.5 border-t border-[#3b2f24] flex items-center justify-between gap-2">
            <span
              className={`font-mono-tech text-[10px] tracking-wider ${
                !cheats.infiniteOxygen && oxygen <= 50
                  ? 'text-red-400 font-bold animate-pulse'
                  : 'text-[#b8ae95]'
              }`}
            >
              OXÍGENO
            </span>
            <span
              className={`font-mono-tech text-[11px] font-bold tabular-nums ${
                !cheats.infiniteOxygen && oxygen <= 50
                  ? 'text-red-400'
                  : !cheats.infiniteOxygen && oxygen < 80
                    ? 'text-amber-300'
                    : 'text-emerald-300'
              }`}
            >
              {cheats.infiniteOxygen ? '100%' : `${Math.ceil(oxygen)}%`}
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full bg-[#12100d] border border-[#4d3d30] overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${
                !cheats.infiniteOxygen && oxygen <= 50
                  ? 'bg-red-500'
                  : !cheats.infiniteOxygen && oxygen < 80
                    ? 'bg-amber-400'
                    : 'bg-emerald-400'
              }`}
              style={{
                width: `${cheats.infiniteOxygen ? 100 : Math.max(0, Math.min(100, oxygen))}%`,
              }}
            />
          </div>
        </div>

        {/* Bottom Cohesive 1990s Controls (Mask, Flashlight, Cameras) */}
        {!monitorOpen && !isBlackout && (view === 'center' || cheats.infiniteOxygen) && (
          <div className="pointer-events-auto flex items-center gap-2 sm:gap-2.5 mx-auto sm:mx-0">
            <button
              type="button"
              disabled={!cheats.infiniteOxygen && maskToxicLocked && !maskOn}
              onClick={toggleMask}
              className={`relative overflow-hidden pr-3.5 pl-11 sm:pl-12 py-2.5 font-mono-tech text-[11px] sm:text-xs font-bold border-2 transition-all flex items-center ${
                !cheats.infiniteOxygen && maskToxicLocked && !maskOn
                  ? 'bg-[#2a0c0a] text-red-300/75 border-red-800/70 cursor-not-allowed'
                  : maskOn
                    ? 'bg-[#3d2d12] text-amber-200 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.45)] cursor-pointer'
                    : 'rust-panel-90s text-[#e6dec8] hover:border-amber-400 cursor-pointer'
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
                {!cheats.infiniteOxygen && maskToxicLocked && !maskOn
                  ? 'BLOQUEO'
                  : maskOn
                    ? 'QUITAR MÁSCARA [M]'
                    : 'MÁSCARA [M]'}
              </span>
            </button>

            {(!maskOn || cheats.infiniteOxygen) && (
              <>
                {view === 'center' && (
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
                )}

                {(view === 'center' || cheats.infiniteOxygen) && (
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
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Subtle analog CRT Vignette */}
      <div className="pointer-events-none fixed inset-0 z-30 crt-vignette opacity-55" />
    </div>
  );
}
