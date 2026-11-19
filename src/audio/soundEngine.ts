// Procedural Web Audio API synthesizer + custom audio assets for TELECHOBIS LAND
// Unified abandoned 1999 TV studio acoustic bus (compressor + concrete hall slapback reverb)
// + adaptive tension drone + detuned 1990s analog VHS nocturne

import { JumpscareSource, TelechobiId } from '../types/game';

const AUDIO_ASSETS = {
  menuMusic: '/assets/aistudio/Five_Nights_at_Candy_s_OST_-_Menu_Theme_c4af9ca9.mp3',
  nightMusic: '/assets/aistudio/Ennard_BOSS_FIGHT_Music__EXTENDED__2274153f.mp3',
  ventSfx: '/assets/aistudio/FNAF_Vents__FNAF_3__-_Gaming_Sound_Effect__HD__a4bf03b2.mp3',
  ventCreak:
    '/assets/aistudio/Creepy_creaking_door_sounds_effects__shorts__sound__soundseffect_3a46200a.mp3',
  cameraLure: '/assets/aistudio/Homero_Simpson_Gmi2__IA_Cover___No_apto_para_sensibles__ee12762f.mp3',
  heavyBreathing: '/assets/aistudio/Breathing_Male_heavy__-_Sound_Effect_HD__1ec04104.mp3',
  doorSlam: '/assets/aistudio/FNAF_1_Door_Slamming_-_Sound_Effect___d22fd280.mp3',
  hallwayNoise: '/assets/aistudio/Fnaf_2_hallway_noise__horror_sound__0dfcc938.mp3',
  doorScare: '/assets/aistudio/FNAF_1_Animatronic_at_door_-_Sound_Effect___7917911b.mp3',
  generatorLoop: '/assets/aistudio/Generator_Sound_Effect_cfe483ef.mp3',
  arbolLaugh: '/assets/aistudio/Fnaf_4_Nigthmare_Fredbear_Laugh__Sound_Effect_559f442f.mp3',
  nonCrawl: '/assets/aistudio/Crawl_and_Rattle_-_Sound_Effect_for_editing_30237bd4.mp3',
  nonLaugh: '/assets/aistudio/Creepy_Laugh_Sound_Effect__SOUNDFX_12d99a84.mp3',
  champiTires: '/assets/aistudio/Car_Tires_screech_Sound_Effect_c3038a59.mp3',
  champiGears: '/assets/aistudio/Gears_1_sound_effects_05258121.mp3',
  foxyRun: '/assets/aistudio/FNAF_PLUS_FOXY_RUNN_NG__cut_1sec__a8e8f399.mp3',
  camInterference: '/assets/aistudio/efecto_de_sonido_interferencia_5f3b709a.mp3',
  charroVoice:
    '/assets/aistudio/devolver_el_alma_de_beatriz_pues_eso_ya_no_se_puede_ya_me_la_lleve_e59ff31a.mp3',
  glassBreak: '/assets/aistudio/Glass_Breaking_Sound_Effect_HD_Glass_Shattering_Sound_Effect_33b66029.mp3',
  glamrockDuel: '/assets/aistudio/ES_HORA_DE_DE_DE_DE_DE_DEL_DUELO__611c7cdb.mp3',
  auraFarmerSong: '/assets/aistudio/The_Aura_Farmer_-_Horror_Skunx__official_song__1825a188.mp3',
  tralaleroSong: '/assets/aistudio/TRALALERO_TRALALA____CANCION_MEME_OFICIAL____SIMBA_f421cc2d.mp3',
  paperMove:
    '/assets/aistudio/Sonido_de_Mover_Papel_Moviendo_Hoja_de_papel_-_Efecto_de_Sonido_9b753821.mp3',
  jumpscare: {
    ton: '/assets/aistudio/Fnaf_Jumpscare_Sound_Effect_6fe3c116.mp3',
    toso: '/assets/aistudio/FNAF_2_Jumpscare_Sound_f38574a3.mp3',
    nita: '/assets/aistudio/FNAF_3_Jumpscare_Sound_Effect_9574fe64.mp3',
    tis: '/assets/aistudio/FNAF_4_Jumpscare_Sound_Effect_74546419.mp3',
    arbol: '/assets/aistudio/FNAF_4_Jumpscare_Sound_Effect_74546419.mp3',
    champi: '/assets/aistudio/FNAF_3_Jumpscare_Sound_Effect_9574fe64.mp3',
    non: '/assets/aistudio/FNAF_2_Jumpscare_Sound_f38574a3.mp3',
    charro: '/assets/aistudio/Fnaf_Jumpscare_Sound_Effect_6fe3c116.mp3',
    glamrock: '/assets/aistudio/FNAF_4_Jumpscare_Sound_Effect_74546419.mp3',
    tralalero: '/assets/aistudio/FNAF_2_Jumpscare_Sound_f38574a3.mp3',
  } as Record<TelechobiId, string>,
} as const;

const PRELOAD_SFX_URLS: string[] = [
  AUDIO_ASSETS.ventSfx,
  AUDIO_ASSETS.ventCreak,
  AUDIO_ASSETS.cameraLure,
  AUDIO_ASSETS.heavyBreathing,
  AUDIO_ASSETS.doorSlam,
  AUDIO_ASSETS.hallwayNoise,
  AUDIO_ASSETS.doorScare,
  AUDIO_ASSETS.generatorLoop,
  AUDIO_ASSETS.arbolLaugh,
  AUDIO_ASSETS.nonCrawl,
  AUDIO_ASSETS.champiGears,
  AUDIO_ASSETS.foxyRun,
  AUDIO_ASSETS.charroVoice,
  AUDIO_ASSETS.glamrockDuel,
  AUDIO_ASSETS.paperMove,
  AUDIO_ASSETS.jumpscare.ton,
  AUDIO_ASSETS.jumpscare.toso,
  AUDIO_ASSETS.jumpscare.nita,
  AUDIO_ASSETS.jumpscare.tis,
];

const ASSET_FALLBACK_OFFSET_SEC: Record<string, number> = {
  [AUDIO_ASSETS.menuMusic]: 0,
  [AUDIO_ASSETS.ventSfx]: 0.24,
  [AUDIO_ASSETS.ventCreak]: 0.245,
  [AUDIO_ASSETS.cameraLure]: 0.528,
  [AUDIO_ASSETS.heavyBreathing]: 0.18,
  [AUDIO_ASSETS.doorSlam]: 0.445,
  [AUDIO_ASSETS.hallwayNoise]: 0.21,
  [AUDIO_ASSETS.doorScare]: 1.11,
  [AUDIO_ASSETS.generatorLoop]: 0.29,
  [AUDIO_ASSETS.arbolLaugh]: 0.08,
  [AUDIO_ASSETS.nonCrawl]: 0.05,
  [AUDIO_ASSETS.nonLaugh]: 0.05,
  [AUDIO_ASSETS.champiTires]: 0.05,
  [AUDIO_ASSETS.champiGears]: 0.02,
  [AUDIO_ASSETS.foxyRun]: 0.02,
  [AUDIO_ASSETS.camInterference]: 0.04,
  [AUDIO_ASSETS.charroVoice]: 0,
  [AUDIO_ASSETS.glassBreak]: 0.04,
  [AUDIO_ASSETS.jumpscare.ton]: 0.22,
  [AUDIO_ASSETS.jumpscare.toso]: 0.335,
  [AUDIO_ASSETS.jumpscare.nita]: 0.825,
  [AUDIO_ASSETS.jumpscare.tis]: 0.48,
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;
  private noiseBuffer: AudioBuffer | null = null;

  // Shared Master & Studio Echo Bus
  private masterGain: GainNode | null = null;
  private studioDryBus: GainNode | null = null;
  private studioEchoInput: GainNode | null = null;

  // Dynamic Ambience Nodes
  private ambientGain: GainNode | null = null;
  private ambientFilter: BiquadFilterNode | null = null;
  private threatGain: GainNode | null = null;
  private crtHumGain: GainNode | null = null;
  private ambientNodes: AudioNode[] = [];
  private ambientInterval: number | null = null;
  private menuMusicInterval: number | null = null;
  private breathActive = false;
  private lastFootstepAt = 0;
  private speechTimer: number | null = null;
  private activeUtteranceToken = 0;

  // Decoded & Zero-Latency Trimmed MP3 SFX Cache + Active Playback Handles
  private sfxRawBytes = new Map<string, ArrayBuffer>();
  private sfxRawFetching = new Map<string, Promise<ArrayBuffer | null>>();
  private sfxBuffers = new Map<string, AudioBuffer>();
  private sfxLoading = new Map<string, Promise<AudioBuffer | null>>();
  private failedSfxUrls = new Set<string>();

  private activeJumpscareSource: AudioBufferSourceNode | null = null;
  private activeJumpscareAudio: HTMLAudioElement | null = null;
  private jumpscareToken = 0;

  private activeVentSource: AudioBufferSourceNode | null = null;
  private activeVentAudio: HTMLAudioElement | null = null;
  private ventDelayTimer: number | null = null;

  private activeVentCreakSource: AudioBufferSourceNode | null = null;
  private activeVentCreakAudio: HTMLAudioElement | null = null;
  private ventCreakToken = 0;

  private activeCameraLureSource: AudioBufferSourceNode | null = null;
  private activeCameraLureAudio: HTMLAudioElement | null = null;
  private cameraLureToken = 0;

  private activeDoorSlamSource: AudioBufferSourceNode | null = null;
  private activeDoorSlamAudio: HTMLAudioElement | null = null;

  private activeHallwaySource: AudioBufferSourceNode | null = null;
  private activeHallwayAudio: HTMLAudioElement | null = null;
  private hallwayNoiseToken = 0;

  private activeDoorScareSource: AudioBufferSourceNode | null = null;
  private activeDoorScareAudio: HTMLAudioElement | null = null;
  private doorScareToken = 0;

  private activeGeneratorSource: AudioBufferSourceNode | null = null;
  private activeGeneratorAudio: HTMLAudioElement | null = null;
  private generatorToken = 0;

  private activeTurnBreathSource: AudioBufferSourceNode | null = null;
  private turnBreathTimer: number | null = null;

  private activeCharroSource: AudioBufferSourceNode | null = null;
  private activeCharroAudio: HTMLAudioElement | null = null;
  private activeCharroSynthStop: (() => void) | null = null;
  private activeCharroUtterance: SpeechSynthesisUtterance | null = null;
  private charroToken = 0;
  private charroDuckedMusic = false;

  private activeInterferenceSource: AudioBufferSourceNode | null = null;
  private activeInterferenceAudio: HTMLAudioElement | null = null;
  private activeInterferenceSynthStop: (() => void) | null = null;
  private interferenceToken = 0;

  private activeNonCrawlSource: AudioBufferSourceNode | null = null;
  private activeNonCrawlAudio: HTMLAudioElement | null = null;
  private activeNonCrawlSynthStop: (() => void) | null = null;
  private nonCrawlToken = 0;

  private activeFoxyRunSource: AudioBufferSourceNode | null = null;
  private activeFoxyRunAudio: HTMLAudioElement | null = null;
  private foxyRunToken = 0;

  private infiniteHomerSource: AudioBufferSourceNode | null = null;
  private infiniteHomerGain: GainNode | null = null;
  private infiniteHomerAudio: HTMLAudioElement | null = null;
  private infiniteHomerActive = false;
  private infiniteHomerToken = 0;

  private bossAudioEndsAt = 0;

  private heavyBreathingAudio: HTMLAudioElement | null = null;
  private gestureUnlockBound = false;

  // Main Menu OST (Five Nights at Candy's OST - Menu Theme)
  private menuMusicAudio: HTMLAudioElement | null = null;
  private menuMusicShouldPlay = false;
  private menuMusicRetryBound = false;

  // Night-only Ennard Boss Fight Music
  private nightMusicAudio: HTMLAudioElement | null = null;
  private nightMusicShouldPlay = false;
  private nightMusicRetryBound = false;
  private rechargingSilence = false;

  // Secret Brainrot Animatronics Audio Handles
  private activeGlamrockDuelSource: AudioBufferSourceNode | null = null;
  private activeGlamrockDuelAudio: HTMLAudioElement | null = null;
  private glamrockDuelToken = 0;

  private auraBattleAudio: HTMLAudioElement | null = null;
  private auraBattleToken = 0;

  private tralaleroAudio: HTMLAudioElement | null = null;
  private tralaleroToken = 0;

  private activePaperSource: AudioBufferSourceNode | null = null;
  private activePaperAudio: HTMLAudioElement | null = null;
  private paperToken = 0;

  // Night 7 Ending Fire & Soul Release audio
  private endingFireNodes: AudioNode[] = [];
  private endingFireInterval: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Eagerly fetch SFX bytes on load and unlock/decode on the very first user gesture
      this.prefetchAllSfxBytes();
      this.bindFirstGestureUnlock();
    }
  }

  private bindFirstGestureUnlock() {
    if (this.gestureUnlockBound || typeof window === 'undefined') return;
    this.gestureUnlockBound = true;
    const onFirstGesture = () => {
      window.removeEventListener('pointerdown', onFirstGesture);
      window.removeEventListener('keydown', onFirstGesture);
      this.unlock();
    };
    window.addEventListener('pointerdown', onFirstGesture, { once: true, passive: true });
    window.addEventListener('keydown', onFirstGesture, { once: true, passive: true });
  }

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    if (!this.noiseBuffer && this.ctx) {
      const len = this.ctx.sampleRate * 2;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      this.noiseBuffer = buf;
    }

    if (this.ctx && !this.masterGain) {
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -16;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.004;
      compressor.release.value = 0.2;

      const master = this.ctx.createGain();
      master.gain.value = this.muted ? 0 : 0.92;
      compressor.connect(master);
      master.connect(this.ctx.destination);

      const dry = this.ctx.createGain();
      dry.gain.value = 1.0;
      dry.connect(compressor);

      // Subtle concrete TV studio slapback/reverb loop for environmental distance & cohesion
      const echoIn = this.ctx.createGain();
      echoIn.gain.value = 0.34;
      const delayA = this.ctx.createDelay(0.5);
      delayA.delayTime.value = 0.135;
      const delayB = this.ctx.createDelay(0.5);
      delayB.delayTime.value = 0.245;
      const echoFilter = this.ctx.createBiquadFilter();
      echoFilter.type = 'lowpass';
      echoFilter.frequency.value = 1150;
      const echoFb = this.ctx.createGain();
      echoFb.gain.value = 0.26;

      echoIn.connect(delayA);
      delayA.connect(echoFilter);
      echoFilter.connect(delayB);
      delayB.connect(echoFb);
      echoFb.connect(delayA);
      echoFilter.connect(compressor);
      delayB.connect(compressor);

      this.masterGain = master;
      this.studioDryBus = dry;
      this.studioEchoInput = echoIn;
    }

    return this.ctx;
  }

  private getDryBus(): AudioNode | null {
    const ctx = this.ensureContext();
    if (!ctx) return null;
    return this.studioDryBus || ctx.destination;
  }

  private getEchoBus(): AudioNode | null {
    const ctx = this.ensureContext();
    if (!ctx) return null;
    return this.studioEchoInput || this.studioDryBus || ctx.destination;
  }

  public setMuted(muted: boolean) {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.92, this.ctx.currentTime, 0.04);
    }
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(
        muted || this.rechargingSilence ? 0 : 0.13,
        this.ctx.currentTime,
        0.05
      );
    }
    if (this.menuMusicAudio) {
      this.menuMusicAudio.muted = muted;
      if (!muted && this.menuMusicShouldPlay && this.menuMusicAudio.paused) {
        void this.menuMusicAudio.play().catch(() => {});
      } else if (muted && !this.menuMusicAudio.paused) {
        try {
          this.menuMusicAudio.pause();
        } catch {
          // ignore pause errors
        }
      }
    }
    if (this.nightMusicAudio) {
      this.nightMusicAudio.muted = muted;
      if (!muted && !this.rechargingSilence && this.nightMusicShouldPlay && this.nightMusicAudio.paused) {
        void this.nightMusicAudio.play().catch(() => {});
      }
    }
    if (this.heavyBreathingAudio) {
      this.heavyBreathingAudio.muted = muted;
      if (!muted && this.breathActive && this.heavyBreathingAudio.paused) {
        void this.heavyBreathingAudio.play().catch(() => {});
      }
    }
    this.syncInfiniteHomerVolume();
    if (muted) {
      this.stopMaskBreathing();
      this.stopPhoneVoice();
      this.stopJumpscare();
      this.stopVentSound();
      this.stopVentCreak();
      this.stopCameraLureAudio();
      this.stopDoorSlam();
      this.stopHallwayNoise();
      this.stopDoorScare();
      this.stopGeneratorSound();
      this.stopTurnBreath();
      this.stopCharroVoice();
      this.stopCamInterference();
      this.stopNonCrawl();
      this.stopChampiFoxyRun();
      this.stopGlamrockDuel();
      this.stopAuraBattleSong();
      this.stopTralaleroSong();
      this.stopPaperMove();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  private fetchRawSfxBytes(url: string): Promise<ArrayBuffer | null> {
    if (this.failedSfxUrls.has(url)) return Promise.resolve(null);
    const existing = this.sfxRawBytes.get(url);
    if (existing) return Promise.resolve(existing);
    const inflight = this.sfxRawFetching.get(url);
    if (inflight) return inflight;

    const promise = fetch(url)
      .then((res) => {
        if (!res.ok) {
          this.failedSfxUrls.add(url);
          throw new Error(`HTTP ${res.status}`);
        }
        return res.arrayBuffer();
      })
      .then((arr) => {
        this.sfxRawBytes.set(url, arr);
        return arr;
      })
      .catch(() => {
        this.failedSfxUrls.add(url);
        return null;
      })
      .finally(() => {
        this.sfxRawFetching.delete(url);
      });

    this.sfxRawFetching.set(url, promise);
    return promise;
  }

  public prefetchAllSfxBytes() {
    if (typeof window === 'undefined') return;
    for (const url of PRELOAD_SFX_URLS) {
      void this.fetchRawSfxBytes(url);
    }
  }

  private trimSilenceFromBuffer(ctx: AudioContext, buffer: AudioBuffer): AudioBuffer {
    const sampleRate = buffer.sampleRate;
    const len = buffer.length;
    const numChannels = buffer.numberOfChannels;
    if (len < 64 || numChannels === 0) return buffer;

    // Scan using a tiny ~6ms RMS/peak check to bypass dead silence & 1-frame MP3 encoder pops
    const windowSize = Math.max(1, Math.floor(sampleRate * 0.006));
    const stepSize = Math.max(1, Math.floor(windowSize / 2));
    const startThreshold = 0.032;

    let firstAudibleSample = 0;
    let foundStart = false;

    for (let i = 0; i < len && !foundStart; i += stepSize) {
      let maxAbs = 0;
      const end = Math.min(len, i + windowSize);
      for (let ch = 0; ch < numChannels; ch++) {
        const data = buffer.getChannelData(ch);
        let sumSq = 0;
        for (let j = i; j < end; j++) {
          const v = data[j];
          sumSq += v * v;
        }
        const rms = Math.sqrt(sumSq / (end - i));
        if (rms > maxAbs) maxAbs = rms;
      }
      if (maxAbs >= startThreshold) {
        firstAudibleSample = Math.max(0, i - Math.floor(sampleRate * 0.004));
        foundStart = true;
      }
    }

    if (!foundStart) {
      firstAudibleSample = 0;
    }

    // Also trim trailing dead silence (< 0.004)
    let lastAudibleSample = len;
    for (let i = len - 1; i > firstAudibleSample; i -= stepSize) {
      let peak = 0;
      const start = Math.max(firstAudibleSample, i - windowSize);
      for (let ch = 0; ch < numChannels; ch++) {
        const data = buffer.getChannelData(ch);
        for (let j = start; j <= i; j++) {
          const av = Math.abs(data[j]);
          if (av > peak) peak = av;
        }
      }
      if (peak >= 0.008) {
        lastAudibleSample = Math.min(len, i + Math.floor(sampleRate * 0.02));
        break;
      }
    }

    const trimmedLen = Math.max(1, lastAudibleSample - firstAudibleSample);
    if (firstAudibleSample < Math.floor(sampleRate * 0.015) && lastAudibleSample > len - Math.floor(sampleRate * 0.05)) {
      return buffer;
    }

    const out = ctx.createBuffer(numChannels, trimmedLen, sampleRate);
    const fadeSamples = Math.min(trimmedLen, Math.floor(sampleRate * 0.003));
    for (let ch = 0; ch < numChannels; ch++) {
      const src = buffer.getChannelData(ch);
      const dst = out.getChannelData(ch);
      dst.set(src.subarray(firstAudibleSample, firstAudibleSample + trimmedLen));
      for (let f = 0; f < fadeSamples; f++) {
        dst[f] *= f / fadeSamples;
      }
    }
    return out;
  }

  private async loadSfxBuffer(url: string): Promise<AudioBuffer | null> {
    const existing = this.sfxBuffers.get(url);
    if (existing) return existing;
    const inflight = this.sfxLoading.get(url);
    if (inflight) return inflight;

    const ctx = this.ensureContext();
    if (!ctx) return null;

    const promise = this.fetchRawSfxBytes(url)
      .then((arr) => {
        if (!arr) return null;
        // Clone slice because decodeAudioData detaches the passed ArrayBuffer
        return ctx.decodeAudioData(arr.slice(0));
      })
      .then((decoded) => {
        if (!decoded) return null;
        const skipTrim =
          url === AUDIO_ASSETS.charroVoice ||
          url === AUDIO_ASSETS.cameraLure ||
          url === AUDIO_ASSETS.ventSfx ||
          url === AUDIO_ASSETS.nonCrawl;
        const processed = skipTrim ? decoded : this.trimSilenceFromBuffer(ctx, decoded);
        this.sfxBuffers.set(url, processed);
        return processed;
      })
      .catch(() => null)
      .finally(() => {
        this.sfxLoading.delete(url);
      });

    this.sfxLoading.set(url, promise);
    return promise;
  }

  public preloadNightSfx() {
    if (typeof window === 'undefined') return;
    for (const url of PRELOAD_SFX_URLS) {
      void this.loadSfxBuffer(url);
    }
  }

  public unlock() {
    this.ensureContext();
    this.preloadNightSfx();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices();
      } catch {
        // ignore speech synthesis probe errors
      }
    }
  }

  private ensureMenuMusicElement(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.menuMusicAudio) {
      const audio = new Audio(AUDIO_ASSETS.menuMusic);
      audio.loop = true;
      audio.preload = 'auto';
      this.menuMusicAudio = audio;
    }
    return this.menuMusicAudio;
  }

  private retryMenuMusicOnGesture = () => {
    this.unbindMenuMusicRetry();
    if (!this.menuMusicShouldPlay || this.muted) return;
    const audio = this.ensureMenuMusicElement();
    if (audio && audio.paused) {
      void audio.play().catch(() => {});
    }
  };

  private bindMenuMusicRetry() {
    if (this.menuMusicRetryBound || typeof window === 'undefined') return;
    this.menuMusicRetryBound = true;
    window.addEventListener('pointerdown', this.retryMenuMusicOnGesture, { once: true });
    window.addEventListener('keydown', this.retryMenuMusicOnGesture, { once: true });
  }

  private unbindMenuMusicRetry() {
    if (!this.menuMusicRetryBound || typeof window === 'undefined') return;
    this.menuMusicRetryBound = false;
    window.removeEventListener('pointerdown', this.retryMenuMusicOnGesture);
    window.removeEventListener('keydown', this.retryMenuMusicOnGesture);
  }

  public startMenuMusic() {
    this.menuMusicShouldPlay = true;
    const audio = this.ensureMenuMusicElement();
    if (!audio) return;

    audio.loop = true;
    audio.muted = this.muted;
    audio.volume = 0.38;
    if (this.muted) return;

    if (!audio.paused) return;
    try {
      audio.currentTime = 0;
    } catch {
      // ignore seek if stream not ready
    }

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        this.bindMenuMusicRetry();
      });
    }
  }

  public stopMenuMusic() {
    this.menuMusicShouldPlay = false;
    this.unbindMenuMusicRetry();
    if (this.menuMusicAudio) {
      try {
        this.menuMusicAudio.pause();
        this.menuMusicAudio.currentTime = 0;
      } catch {
        // ignore audio teardown errors
      }
    }
  }

  private ensureNightMusicElement(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.nightMusicAudio) {
      const audio = new Audio(AUDIO_ASSETS.nightMusic);
      audio.loop = true;
      audio.preload = 'auto';
      this.nightMusicAudio = audio;
    }
    return this.nightMusicAudio;
  }

  private retryNightMusicOnGesture = () => {
    this.unbindNightMusicRetry();
    if (!this.nightMusicShouldPlay || this.muted) return;
    const audio = this.ensureNightMusicElement();
    if (audio && audio.paused) {
      void audio.play().catch(() => {});
    }
  };

  private bindNightMusicRetry() {
    if (this.nightMusicRetryBound || typeof window === 'undefined') return;
    this.nightMusicRetryBound = true;
    window.addEventListener('pointerdown', this.retryNightMusicOnGesture, { once: true });
    window.addEventListener('keydown', this.retryNightMusicOnGesture, { once: true });
  }

  private unbindNightMusicRetry() {
    if (!this.nightMusicRetryBound || typeof window === 'undefined') return;
    this.nightMusicRetryBound = false;
    window.removeEventListener('pointerdown', this.retryNightMusicOnGesture);
    window.removeEventListener('keydown', this.retryNightMusicOnGesture);
  }

  public startNightMusic(ducked = false) {
    this.stopMenuMusic();
    this.nightMusicShouldPlay = true;
    this.preloadNightSfx();

    const audio = this.ensureNightMusicElement();
    if (!audio) return;

    audio.loop = true;
    audio.muted = this.muted;
    // Keep Sister Location boss fight music subtle so ventilation audio is crystal clear without HUD alerts
    audio.volume = ducked ? 0.06 : 0.13;
    try {
      audio.currentTime = 0;
    } catch {
      // ignore if stream not seekable yet
    }

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        this.bindNightMusicRetry();
      });
    }
  }

  public setNightMusicDucked(ducked: boolean) {
    if (this.nightMusicAudio) {
      this.nightMusicAudio.volume = ducked ? 0.06 : 0.13;
    }
  }

  public setRechargingSilence(active: boolean) {
    if (this.rechargingSilence === active) return;
    this.rechargingSilence = active;

    if (active) {
      this.stopVentSound();
      this.stopVentCreak();
      this.stopHallwayNoise();
      this.stopDoorScare();
      if (this.nightMusicAudio && !this.nightMusicAudio.paused) {
        try {
          this.nightMusicAudio.pause();
        } catch {
          // ignore pause errors
        }
      }
      if (this.ctx) {
        const now = this.ctx.currentTime;
        this.ambientGain?.gain.setTargetAtTime(0, now, 0.05);
        this.threatGain?.gain.setTargetAtTime(0, now, 0.05);
        this.crtHumGain?.gain.setTargetAtTime(0, now, 0.05);
      }
    } else {
      if (this.ctx && !this.muted) {
        const now = this.ctx.currentTime;
        this.ambientGain?.gain.setTargetAtTime(0.13, now, 0.12);
      }
      if (
        this.nightMusicAudio &&
        this.nightMusicShouldPlay &&
        !this.muted &&
        this.nightMusicAudio.paused
      ) {
        void this.nightMusicAudio.play().catch(() => {});
      }
    }
    this.syncInfiniteHomerVolume();
  }

  public stopNightMusic() {
    this.nightMusicShouldPlay = false;
    this.rechargingSilence = false;
    this.unbindNightMusicRetry();
    this.stopVentCreak();
    this.stopCameraLureAudio();
    this.stopInfiniteHomerLoop();
    this.stopDoorSlam();
    this.stopHallwayNoise();
    this.stopDoorScare();
    this.stopGeneratorSound();
    this.stopTurnBreath();
    this.stopCharroVoice();
    this.stopCamInterference();
    this.stopNonCrawl();
    this.stopChampiFoxyRun();
    this.stopMaskBreathing();
    this.stopGlamrockDuel();
    this.stopAuraBattleSong();
    this.stopTralaleroSong();
    this.stopPaperMove();
    if (this.nightMusicAudio) {
      try {
        this.nightMusicAudio.pause();
        this.nightMusicAudio.currentTime = 0;
      } catch {
        // ignore audio teardown errors
      }
    }
  }

  public stopVentSound() {
    if (this.ventDelayTimer !== null) {
      window.clearTimeout(this.ventDelayTimer);
      this.ventDelayTimer = null;
    }
    if (this.activeVentSource) {
      try {
        this.activeVentSource.stop();
        this.activeVentSource.disconnect();
      } catch {
        // ignore stop errors
      }
      this.activeVentSource = null;
    }
    if (this.activeVentAudio) {
      try {
        this.activeVentAudio.pause();
        this.activeVentAudio.currentTime = 0;
      } catch {
        // ignore audio pause errors
      }
      this.activeVentAudio = null;
    }
  }

  public playVentSound(mode: 'alert' | 'retreat' = 'alert', delayMs = 0) {
    this.stopVentSound();
    if (this.muted || this.rechargingSilence) return;

    const volume = mode === 'alert' ? 0.95 : 0.28;

    const trigger = () => {
      this.ventDelayTimer = null;
      if (this.muted) return;

      const ctx = this.ensureContext();
      const bus = mode === 'retreat' ? this.getEchoBus() : this.getDryBus();
      const buffer = this.sfxBuffers.get(AUDIO_ASSETS.ventSfx);

      if (ctx && bus && buffer) {
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        const g = ctx.createGain();
        g.gain.value = volume;
        src.connect(g);
        g.connect(bus);
        src.onended = () => {
          if (this.activeVentSource === src) {
            this.activeVentSource = null;
          }
        };
        this.activeVentSource = src;
        src.start(0);
      } else {
        void this.loadSfxBuffer(AUDIO_ASSETS.ventSfx);
        const audio = new Audio(AUDIO_ASSETS.ventSfx);
        audio.volume = volume;
        audio.muted = this.muted;
        try {
          audio.currentTime = ASSET_FALLBACK_OFFSET_SEC[AUDIO_ASSETS.ventSfx] ?? 0;
        } catch {
          // ignore seek before ready
        }
        audio.onended = () => {
          if (this.activeVentAudio === audio) {
            this.activeVentAudio = null;
          }
        };
        this.activeVentAudio = audio;
        void audio.play().catch(() => {
          // Synthesize metallic vent clank fallback only if HTMLAudio playback fails
          if (ctx && bus && this.noiseBuffer && !this.muted) {
            const now = ctx.currentTime;
            [0, 0.16, 0.34].forEach((offset) => {
              const t = now + offset;
              const noise = ctx.createBufferSource();
              noise.buffer = this.noiseBuffer!;
              const bp = ctx.createBiquadFilter();
              bp.type = 'bandpass';
              bp.frequency.value = 540;
              bp.Q.value = 2.4;
              const ng = ctx.createGain();
              ng.gain.setValueAtTime(volume * 0.25, t);
              ng.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
              noise.connect(bp);
              bp.connect(ng);
              ng.connect(bus);
              noise.start(t);
              noise.stop(t + 0.15);
            });
          }
        });
      }
    };

    if (delayMs > 0) {
      this.ventDelayTimer = window.setTimeout(trigger, delayMs);
    } else {
      trigger();
    }
  }

  public stopVentCreak() {
    this.ventCreakToken += 1;
    if (this.activeVentCreakSource) {
      try {
        this.activeVentCreakSource.stop(0);
        this.activeVentCreakSource.disconnect();
      } catch {
        // ignore stop errors
      }
      this.activeVentCreakSource = null;
    }
    if (this.activeVentCreakAudio) {
      try {
        this.activeVentCreakAudio.pause();
        this.activeVentCreakAudio.currentTime = 0;
        this.activeVentCreakAudio.src = '';
      } catch {
        // ignore pause errors
      }
      this.activeVentCreakAudio = null;
    }
  }

  public playVentCreak(volume = 0.88) {
    this.stopVentCreak();
    if (this.muted || this.rechargingSilence) return;

    const token = ++this.ventCreakToken;
    const url = AUDIO_ASSETS.ventCreak;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    const buffer = this.sfxBuffers.get(url);

    if (ctx && dry && buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = volume;
      src.connect(g);
      g.connect(dry);
      src.onended = () => {
        if (this.activeVentCreakSource === src) {
          this.activeVentCreakSource = null;
        }
      };
      this.activeVentCreakSource = src;
      src.start(0);
      return;
    }

    void this.loadSfxBuffer(url);
    const audio = new Audio(url);
    audio.volume = volume;
    audio.muted = this.muted;
    try {
      audio.currentTime = ASSET_FALLBACK_OFFSET_SEC[url] ?? 0;
    } catch {
      // ignore seek before ready
    }
    audio.onended = () => {
      if (this.activeVentCreakAudio === audio) {
        this.activeVentCreakAudio = null;
      }
    };
    this.activeVentCreakAudio = audio;
    void audio.play().then(() => {
      if (token !== this.ventCreakToken || this.muted) {
        audio.pause();
      }
    }).catch(() => {});
  }

  /**
   * Adapts office ambience & dread drones dynamically to gameplay visuals:
   * - maskOn muffles the studio room (lowpass 380Hz) while breathing plays
   * - monitorOpen adds CRT flyback hum
   * - nearbyThreat fades in a tense low studio sub-drone
   */
  public setOfficeState(state: {
    monitorOpen: boolean;
    maskOn: boolean;
    nearbyThreat: boolean;
    power: number;
  }) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.ambientFilter) {
      const targetCutoff = state.maskOn ? 360 : state.monitorOpen ? 920 : 620;
      this.ambientFilter.frequency.setTargetAtTime(targetCutoff, now, 0.16);
    }
    if (this.crtHumGain) {
      this.crtHumGain.gain.setTargetAtTime(
        !this.muted && !this.rechargingSilence && state.monitorOpen ? 0.18 : 0.025,
        now,
        0.12
      );
    }
    if (this.threatGain) {
      const threatLevel =
        this.muted || this.rechargingSilence
          ? 0
          : state.nearbyThreat
            ? 0.32
            : state.power < 22
              ? 0.14
              : 0.0;
      this.threatGain.gain.setTargetAtTime(threatLevel, now, 0.35);
    }
  }

  private playDistantStudioCreak(ctx: AudioContext) {
    const echo = this.getEchoBus();
    if (this.muted || this.rechargingSilence || !echo) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    const startFreq = 72 + Math.random() * 68;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 0.6, now + 1.65);

    filter.type = 'bandpass';
    filter.frequency.value = 330;
    filter.Q.value = 4.2;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.032, now + 0.45);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.75);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(echo);
    osc.start(now);
    osc.stop(now + 1.8);
  }

  private playDistantDripOrIntercom(ctx: AudioContext, mode: 'menu' | 'office') {
    const echo = this.getEchoBus();
    if (this.muted || this.rechargingSilence || !this.noiseBuffer || !echo) return;
    const now = ctx.currentTime;

    if (mode === 'menu' || Math.random() < 0.42) {
      // Ghostly detuned Mexican TV test-card tone ("carta de ajuste") fading down the hall
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const base = mode === 'menu' ? 988 : 440;
      osc.frequency.setValueAtTime(base, now);
      osc.frequency.linearRampToValueAtTime(base - 32, now + 1.15);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(mode === 'menu' ? 0.018 : 0.012, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.25);

      osc.connect(gain);
      gain.connect(echo);
      osc.start(now);
      osc.stop(now + 1.3);
    } else if (Math.random() < 0.72) {
      // Water drip inside abandoned studio ceiling
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      const f = 880 + Math.random() * 520;
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 1.48, now + 0.09);

      gain.gain.setValueAtTime(0.028, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(echo);
      osc.start(now);
      osc.stop(now + 0.16);
    } else {
      // Distant studio Betacam intercom static burst
      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;
      filter.Q.value = 3.2;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.025, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(echo);
      noise.start(now);
      noise.stop(now + 0.25);
    }
  }

  private playMenuNocturneNote(ctx: AudioContext, step: number) {
    const echo = this.getEchoBus();
    if (this.muted || !echo) return;
    // Melancholic, slightly tape-warped 1998 children's show music box in A minor
    const melody = [440, 523.25, 493.88, 392, 440, 329.63, 349.23, 329.63];
    const bass = [110, 110, 98, 98, 87.31, 87.31, 82.41, 82.41];
    const now = ctx.currentTime;

    const noteFreq = melody[step % melody.length];
    const detune = (Math.random() - 0.5) * 14; // aged Betacam tape wow & flutter

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(noteFreq, now);
    osc.detune.setValueAtTime(detune, now);
    osc.detune.linearRampToValueAtTime(detune - 18, now + 1.5);

    filter.type = 'lowpass';
    filter.frequency.value = 980;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.032, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.7);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(echo);
    osc.start(now);
    osc.stop(now + 1.75);

    if (step % 2 === 0) {
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(bass[(step / 2) % bass.length], now);
      bassGain.gain.setValueAtTime(0.001, now);
      bassGain.gain.linearRampToValueAtTime(0.035, now + 0.35);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
      bassOsc.connect(bassGain);
      bassGain.connect(echo);
      bassOsc.start(now);
      bassOsc.stop(now + 2.9);
    }
  }

  public startAmbience(mode: 'menu' | 'office') {
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !this.noiseBuffer || !dry) return;
    this.stopAmbience();

    const masterAmb = ctx.createGain();
    masterAmb.gain.value = this.muted ? 0 : mode === 'menu' ? 0.12 : 0.13;

    const ambFilter = ctx.createBiquadFilter();
    ambFilter.type = 'lowpass';
    ambFilter.frequency.value = mode === 'menu' ? 1400 : 620;
    masterAmb.connect(ambFilter);
    ambFilter.connect(dry);

    this.ambientGain = masterAmb;
    this.ambientFilter = ambFilter;

    // Layer 1: Abandoned studio ventilation / analog tape hiss
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    noise.loop = true;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = mode === 'menu' ? 'bandpass' : 'lowpass';
    noiseFilter.frequency.value = mode === 'menu' ? 1150 : 320;
    noiseFilter.Q.value = mode === 'menu' ? 0.7 : 0.9;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value = mode === 'menu' ? 0.42 : 0.55;

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(masterAmb);
    noise.start();

    // Layer 2: 60Hz fluorescent ballast & transformer hum + low studio room resonance
    const humOsc = ctx.createOscillator();
    humOsc.type = 'sawtooth';
    humOsc.frequency.value = mode === 'menu' ? 55 : 60;

    const humFilter = ctx.createBiquadFilter();
    humFilter.type = 'lowpass';
    humFilter.frequency.value = 145;

    const humGain = ctx.createGain();
    humGain.gain.value = 0.28;

    humOsc.connect(humFilter);
    humFilter.connect(humGain);
    humGain.connect(masterAmb);
    humOsc.start();

    // Layer 3: CRT flyback / monitor buzz (dynamically modulated in office when monitor opens)
    const crtOsc = ctx.createOscillator();
    crtOsc.type = 'triangle';
    crtOsc.frequency.value = mode === 'menu' ? 1580 : 1620;
    const crtGain = ctx.createGain();
    crtGain.gain.value = mode === 'menu' ? 0.03 : 0.025;
    crtOsc.connect(crtGain);
    crtGain.connect(masterAmb);
    crtOsc.start();
    this.crtHumGain = crtGain;

    // Layer 4: Dynamic office danger sub-drone (fades in smoothly when animatronics approach)
    const threatOsc = ctx.createOscillator();
    threatOsc.type = 'sawtooth';
    threatOsc.frequency.value = 39;
    const threatFilter = ctx.createBiquadFilter();
    threatFilter.type = 'lowpass';
    threatFilter.frequency.value = 95;
    const threatGain = ctx.createGain();
    threatGain.gain.value = 0.0;
    threatOsc.connect(threatFilter);
    threatFilter.connect(threatGain);
    threatGain.connect(dry);
    threatOsc.start();
    this.threatGain = threatGain;

    this.ambientNodes = [noise, humOsc, crtOsc, threatOsc];

    // Periodic abandoned TV station sounds (metal rig creaks, drips, dead test tones, intercom crackles)
    this.ambientInterval = window.setInterval(() => {
      if (!this.ctx || !this.ambientGain || this.muted || this.rechargingSilence) return;
      const roll = Math.random();
      if (roll < 0.36) {
        this.playDistantStudioCreak(this.ctx);
      } else if (roll < 0.78) {
        this.playDistantDripOrIntercom(this.ctx, mode);
      }
    }, mode === 'menu' ? 3500 : 4100);

    // Main Menu uses "Five Nights at Candy's OST - Menu Theme" via startMenuMusic()
    if (mode === 'menu' && !this.menuMusicShouldPlay) {
      this.startMenuMusic();
    }
  }

  public stopAmbience() {
    if (this.ambientInterval !== null) {
      window.clearInterval(this.ambientInterval);
      this.ambientInterval = null;
    }
    if (this.menuMusicInterval !== null) {
      window.clearInterval(this.menuMusicInterval);
      this.menuMusicInterval = null;
    }
    this.ambientNodes.forEach((node) => {
      try {
        (node as AudioScheduledSourceNode).stop?.();
      } catch {
        // ignore
      }
    });
    this.ambientNodes = [];
    this.ambientGain = null;
    this.ambientFilter = null;
    this.threatGain = null;
    this.crtHumGain = null;
  }

  public playClick(pitch = 780) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !dry) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(pitch, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.045);

    gain.gain.setValueAtTime(0.09, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(dry);
    osc.start();
    osc.stop(ctx.currentTime + 0.055);
  }

  public playLookTurn() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !this.noiseBuffer || !dry) return;
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(420, now);
    filter.frequency.linearRampToValueAtTime(260, now + 0.14);
    filter.Q.value = 1.4;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.075, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dry);
    noise.start(now);
    noise.stop(now + 0.16);
  }

  public playMaskToggle(on: boolean) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !this.noiseBuffer || !dry) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(on ? 160 : 210, now);
    osc.frequency.exponentialRampToValueAtTime(on ? 72 : 120, now + 0.14);
    oscGain.gain.setValueAtTime(0.16, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 640;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.14, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(oscGain);
    oscGain.connect(dry);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(dry);

    osc.start(now);
    osc.stop(now + 0.17);
    noise.start(now);
    noise.stop(now + 0.19);
  }

  public playNightStartCue() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const echo = this.getEchoBus();
    if (!ctx || !this.noiseBuffer || !echo) return;
    const now = ctx.currentTime;

    // Heavy VHS tape click + low broadcast resonance chord
    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1100;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.18, now);
    ng.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    noise.connect(filter);
    filter.connect(ng);
    ng.connect(echo);
    noise.start(now);
    noise.stop(now + 0.14);

    [110, 164.81, 220].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + 0.08);
      gain.gain.setValueAtTime(0.001, now + 0.08);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.1);
      osc.connect(gain);
      gain.connect(echo);
      osc.start(now + 0.08);
      osc.stop(now + 2.15);
    });
  }

  public playPaperRustle() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const echo = this.getEchoBus();
    if (!ctx || !this.noiseBuffer || !echo) return;
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.value = 1.6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(echo);
    noise.start(now);
    noise.stop(now + 0.24);
  }

  public playFlashlightClick(on: boolean) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !dry) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(on ? 1200 : 880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(on ? 1900 : 420, ctx.currentTime + 0.035);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(dry);
    osc.start();
    osc.stop(ctx.currentTime + 0.045);
  }

  public stopDoorSlam() {
    if (this.activeDoorSlamSource) {
      try {
        this.activeDoorSlamSource.stop(0);
        this.activeDoorSlamSource.disconnect();
      } catch {
        // ignore door slam stop error
      }
      this.activeDoorSlamSource = null;
    }
    if (this.activeDoorSlamAudio) {
      try {
        this.activeDoorSlamAudio.pause();
        this.activeDoorSlamAudio.currentTime = 0;
      } catch {
        // ignore door slam html audio stop error
      }
      this.activeDoorSlamAudio = null;
    }
  }

  public playDoorSlam(closed: boolean) {
    this.stopDoorSlam();
    if (this.muted) return;

    const url = AUDIO_ASSETS.doorSlam;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    const buffer = this.sfxBuffers.get(url);
    const vol = closed ? 0.86 : 0.72;

    if (ctx && dry && buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = vol;
      src.connect(g);
      g.connect(dry);
      src.onended = () => {
        if (this.activeDoorSlamSource === src) {
          this.activeDoorSlamSource = null;
        }
      };
      this.activeDoorSlamSource = src;
      src.start(0);
      return;
    }

    void this.loadSfxBuffer(url);
    const audio = new Audio(url);
    audio.volume = vol;
    audio.muted = this.muted;
    try {
      audio.currentTime = ASSET_FALLBACK_OFFSET_SEC[url] ?? 0;
    } catch {
      // ignore seek before ready
    }
    audio.onended = () => {
      if (this.activeDoorSlamAudio === audio) {
        this.activeDoorSlamAudio = null;
      }
    };
    this.activeDoorSlamAudio = audio;
    void audio.play().catch(() => {});
  }

  public isHallwayNoisePlaying(): boolean {
    return Boolean(this.activeHallwaySource || this.activeHallwayAudio);
  }

  public stopHallwayNoise() {
    this.hallwayNoiseToken += 1;
    if (this.activeHallwaySource) {
      try {
        this.activeHallwaySource.stop(0);
        this.activeHallwaySource.disconnect();
      } catch {
        // ignore hallway noise stop error
      }
      this.activeHallwaySource = null;
    }
    if (this.activeHallwayAudio) {
      try {
        this.activeHallwayAudio.pause();
        this.activeHallwayAudio.currentTime = 0;
      } catch {
        // ignore hallway noise html stop error
      }
      this.activeHallwayAudio = null;
    }
  }

  public playHallwayNoise() {
    this.stopHallwayNoise();
    if (this.muted || this.rechargingSilence) return;

    const token = ++this.hallwayNoiseToken;
    const url = AUDIO_ASSETS.hallwayNoise;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    const buffer = this.sfxBuffers.get(url);

    if (ctx && dry && buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = 0.78;
      src.connect(g);
      g.connect(dry);
      src.onended = () => {
        if (this.activeHallwaySource === src) {
          this.activeHallwaySource = null;
        }
      };
      this.activeHallwaySource = src;
      src.start(0);
      return;
    }

    void this.loadSfxBuffer(url);
    const audio = new Audio(url);
    audio.volume = 0.78;
    audio.muted = this.muted;
    try {
      audio.currentTime = ASSET_FALLBACK_OFFSET_SEC[url] ?? 0;
    } catch {
      // ignore seek before ready
    }
    audio.onended = () => {
      if (this.activeHallwayAudio === audio) {
        this.activeHallwayAudio = null;
      }
    };
    this.activeHallwayAudio = audio;
    void audio.play().then(() => {
      if (token !== this.hallwayNoiseToken || this.muted) {
        audio.pause();
      }
    }).catch(() => {});
  }

  public playDoorThuds() {
    if (this.muted || this.rechargingSilence) return;
    const ctx = this.ensureContext();
    const echo = this.getEchoBus();
    if (!ctx || !this.noiseBuffer || !echo) return;

    const offsets = [0, 0.24, 0.52];
    offsets.forEach((offset, idx) => {
      const t = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(92 - idx * 8, t);
      osc.frequency.exponentialRampToValueAtTime(28, t + 0.16);

      gain.gain.setValueAtTime(0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer!;
      const f = ctx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.value = 260;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.28, t);
      ng.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(echo);
      noise.connect(f);
      f.connect(ng);
      ng.connect(echo);

      osc.start(t);
      osc.stop(t + 0.19);
      noise.start(t);
      noise.stop(t + 0.15);
    });
  }

  public playCameraSwitch() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !this.noiseBuffer || !dry) return;
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1800;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dry);
    noise.start(now);
    noise.stop(now + 0.09);
  }

  public playStaticBurst(duration = 0.25, level = 0.2) {
    if (this.muted || this.rechargingSilence) return;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !this.noiseBuffer || !dry) return;
    const now = ctx.currentTime;

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2100;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(level, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(dry);
    noise.start(now);
    noise.stop(now + duration + 0.02);
  }

  public stopCameraLureAudio() {
    this.cameraLureToken += 1;
    if (this.activeCameraLureSource) {
      try {
        this.activeCameraLureSource.stop(0);
        this.activeCameraLureSource.disconnect();
      } catch {
        // ignore lure buffer stop error
      }
      this.activeCameraLureSource = null;
    }
    if (this.activeCameraLureAudio) {
      try {
        this.activeCameraLureAudio.pause();
        this.activeCameraLureAudio.currentTime = 0;
        this.activeCameraLureAudio.src = '';
      } catch {
        // ignore lure html audio stop error
      }
      this.activeCameraLureAudio = null;
    }
  }

  public playPhoneRing() {
    this.stopCameraLureAudio();
    if (this.muted) return;

    const token = ++this.cameraLureToken;
    const url = AUDIO_ASSETS.cameraLure;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    const buffer = this.sfxBuffers.get(url);

    if (ctx && dry && buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = 0.78;
      src.connect(g);
      // Direct dry connection (0ms delay instead of 135ms+ echo delay)
      g.connect(dry);
      src.onended = () => {
        if (this.activeCameraLureSource === src) {
          this.activeCameraLureSource = null;
        }
      };
      this.activeCameraLureSource = src;
      src.start(0);
      return;
    }

    void this.loadSfxBuffer(url);
    const audio = new Audio(url);
    audio.volume = 0.78;
    audio.muted = this.muted;
    try {
      audio.currentTime = ASSET_FALLBACK_OFFSET_SEC[url] ?? 0;
    } catch {
      // ignore seek before metadata
    }
    audio.onended = () => {
      if (this.activeCameraLureAudio === audio) {
        this.activeCameraLureAudio = null;
      }
    };
    this.activeCameraLureAudio = audio;
    void audio.play().then(() => {
      if (token !== this.cameraLureToken || this.muted) {
        audio.pause();
      }
    }).catch(() => {});
  }

  public playErrorBeep() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !dry) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(165, now + 0.12);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(gain);
    gain.connect(dry);
    osc.start(now);
    osc.stop(now + 0.29);
  }

  public playRebootSuccess() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !dry) return;
    const notes = [523, 659, 784];
    notes.forEach((freq, i) => {
      const t = ctx.currentTime + i * 0.07;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.11, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(dry);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  public playFootsteps(level: 'far' | 'medium' | 'heavy' | boolean = false) {
    if (this.muted || this.rechargingSilence) return;
    const distance: 'far' | 'medium' | 'heavy' =
      typeof level === 'boolean' ? (level ? 'heavy' : 'medium') : level;

    const nowMs = performance.now();
    if (distance !== 'heavy' && nowMs - this.lastFootstepAt < 240) {
      return;
    }
    this.lastFootstepAt = nowMs;

    const ctx = this.ensureContext();
    const echo = this.getEchoBus();
    if (!ctx || !this.noiseBuffer || !echo) return;

    const offsets = distance === 'heavy' ? [0, 0.24, 0.48] : [0, 0.28];
    const baseGain = distance === 'heavy' ? 0.3 : distance === 'medium' ? 0.17 : 0.095;
    const baseFreq = distance === 'heavy' ? 62 : distance === 'medium' ? 78 : 96;

    offsets.forEach((offset, idx) => {
      const t = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq - idx * 4, t);
      osc.frequency.exponentialRampToValueAtTime(24, t + 0.13);
      gain.gain.setValueAtTime(baseGain, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      const scrape = ctx.createBufferSource();
      scrape.buffer = this.noiseBuffer!;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = distance === 'far' ? 420 : 680;
      filter.Q.value = 1.8;
      const sGain = ctx.createGain();
      sGain.gain.setValueAtTime(baseGain * 0.45, t);
      sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

      osc.connect(gain);
      gain.connect(echo);
      scrape.connect(filter);
      filter.connect(sGain);
      sGain.connect(echo);

      osc.start(t);
      osc.stop(t + 0.16);
      scrape.start(t);
      scrape.stop(t + 0.1);
    });
  }

  public playPhoneCallCue(
    cue: 'ring' | 'voice' | 'ton_footsteps' | 'ton_ambush' | 'line_dead' = 'voice'
  ) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    const echo = this.getEchoBus();
    if (!ctx || !this.noiseBuffer || !dry || !echo) return;
    const now = ctx.currentTime;

    if (cue === 'ring') {
      // Classic 1990s desk phone double ring + answering machine cassette click/beep
      [0, 0.36].forEach((offset) => {
        const t = now + offset;
        const oscA = ctx.createOscillator();
        const oscB = ctx.createOscillator();
        const g = ctx.createGain();
        oscA.type = 'sine';
        oscB.type = 'sine';
        oscA.frequency.value = 940;
        oscB.frequency.value = 1120;
        g.gain.setValueAtTime(0.11, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
        oscA.connect(g);
        oscB.connect(g);
        g.connect(echo);
        oscA.start(t);
        oscB.start(t);
        oscA.stop(t + 0.25);
        oscB.stop(t + 0.25);
      });

      const beep = ctx.createOscillator();
      const bGain = ctx.createGain();
      beep.type = 'sine';
      beep.frequency.value = 1000;
      bGain.gain.setValueAtTime(0.001, now + 0.72);
      bGain.gain.linearRampToValueAtTime(0.12, now + 0.74);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.94);
      beep.connect(bGain);
      bGain.connect(dry);
      beep.start(now + 0.72);
      beep.stop(now + 0.96);
    }

    if (cue === 'voice') {
      // Subtle cassette line tick so spoken Spanish voice stays crisp and dominant
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 540;
      g.gain.setValueAtTime(0.018, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.connect(g);
      g.connect(dry);
      osc.start(now);
      osc.stop(now + 0.05);
    }

    if (cue === 'ton_footsteps') {
      // Heavy metallic footsteps approaching Alejandro on the other end of the line
      [0, 0.34, 0.68, 1.0].forEach((offset, idx) => {
        const t = now + offset;
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(86 - idx * 4, t);
        osc.frequency.exponentialRampToValueAtTime(32, t + 0.16);
        filter.type = 'bandpass';
        filter.frequency.value = 420;
        g.gain.setValueAtTime(0.14 + idx * 0.04, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
        osc.connect(filter);
        filter.connect(g);
        g.connect(dry);
        osc.start(t);
        osc.stop(t + 0.19);
      });
    }

    if (cue === 'ton_ambush') {
      // Night 5: Ton ambushes & kills Alejandro Romero over the live studio phone line
      const bang = ctx.createOscillator();
      const bGain = ctx.createGain();
      bang.type = 'sawtooth';
      bang.frequency.setValueAtTime(130, now);
      bang.frequency.exponentialRampToValueAtTime(26, now + 0.32);
      bGain.gain.setValueAtTime(0.32, now);
      bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      bang.connect(bGain);
      bGain.connect(echo);
      bang.start(now);
      bang.stop(now + 0.36);

      // Telephone-filtered Ton robotic shriek
      [210, 415, 790].forEach((f, idx) => {
        const t = now + 0.35;
        const osc = ctx.createOscillator();
        const bp = ctx.createBiquadFilter();
        const g = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sawtooth' : 'square';
        osc.frequency.setValueAtTime(f * 0.9, t);
        osc.frequency.linearRampToValueAtTime(f * 1.45, t + 0.25);
        osc.frequency.linearRampToValueAtTime(f * 0.7, t + 1.15);
        bp.type = 'bandpass';
        bp.frequency.value = 1250;
        bp.Q.value = 1.5;
        g.gain.setValueAtTime(0.16, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
        osc.connect(bp);
        bp.connect(g);
        g.connect(dry);
        osc.start(t);
        osc.stop(t + 1.24);
      });

      const burst = ctx.createBufferSource();
      burst.buffer = this.noiseBuffer;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.24, now + 0.32);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 1.45);
      burst.connect(ng);
      ng.connect(dry);
      burst.start(now + 0.32);
      burst.stop(now + 1.5);
    }

    if (cue === 'line_dead') {
      // Dead telephone disconnect tone (Mexican 425Hz off-hook cadence)
      [0, 0.55, 1.1, 1.65].forEach((offset) => {
        const t = now + offset;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 425;
        g.gain.setValueAtTime(0.085, t);
        g.gain.setValueAtTime(0.085, t + 0.28);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        osc.connect(g);
        g.connect(dry);
        osc.start(t);
        osc.stop(t + 0.34);
      });
    }
  }

  private pickSpanishVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    const maleHint = (v: SpeechSynthesisVoice) =>
      /jorge|raul|raúl|pablo|diego|carlos|mateo|alonso|sebastian|male/i.test(v.name);

    return (
      voices.find((v) => v.lang.toLowerCase() === 'es-mx' && maleHint(v)) ||
      voices.find((v) => v.lang.toLowerCase() === 'es-mx') ||
      voices.find((v) => (v.lang.toLowerCase() === 'es-419' || v.lang.toLowerCase() === 'es-us') && maleHint(v)) ||
      voices.find((v) => v.lang.toLowerCase() === 'es-419' || v.lang.toLowerCase() === 'es-us') ||
      voices.find((v) => v.lang.toLowerCase().startsWith('es') && maleHint(v)) ||
      voices.find((v) => v.lang.toLowerCase().startsWith('es')) ||
      null
    );
  }

  public stopPhoneVoice() {
    this.activeUtteranceToken += 1;
    if (this.speechTimer !== null) {
      window.clearTimeout(this.speechTimer);
      this.speechTimer = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore speech cancel errors
      }
    }
  }

  public speakPhoneSegment(
    text: string,
    options?: {
      delayMs?: number;
      pitch?: number;
      rate?: number;
      onStart?: () => void;
      onEnd?: () => void;
    }
  ): boolean {
    if (this.muted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    this.stopPhoneVoice();
    const token = this.activeUtteranceToken;
    const delayMs = options?.delayMs ?? 0;

    const startSpeaking = () => {
      if (this.muted || token !== this.activeUtteranceToken) return;
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        const spanishVoice = this.pickSpanishVoice();
        if (spanishVoice) {
          utterance.voice = spanishVoice;
          utterance.lang = spanishVoice.lang;
        } else {
          utterance.lang = 'es-MX';
        }
        utterance.pitch = options?.pitch ?? 0.9;
        utterance.rate = options?.rate ?? 1.04;
        utterance.volume = 0.96;

        let settled = false;
        const finish = () => {
          if (settled || token !== this.activeUtteranceToken) return;
          settled = true;
          options?.onEnd?.();
        };

        utterance.onstart = () => {
          if (token === this.activeUtteranceToken) {
            options?.onStart?.();
          }
        };
        utterance.onend = finish;
        utterance.onerror = finish;

        window.speechSynthesis.speak(utterance);
      } catch {
        options?.onEnd?.();
      }
    };

    if (delayMs > 0) {
      this.speechTimer = window.setTimeout(startSpeaking, delayMs);
    } else {
      startSpeaking();
    }
    return true;
  }

  public playCallEndCue() {
    this.stopPhoneVoice();
    if (this.muted) return;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !dry) return;
    const now = ctx.currentTime;

    // Cassette relay click + shift start tone
    const click = ctx.createOscillator();
    const cGain = ctx.createGain();
    click.type = 'square';
    click.frequency.setValueAtTime(640, now);
    click.frequency.exponentialRampToValueAtTime(190, now + 0.06);
    cGain.gain.setValueAtTime(0.11, now);
    cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    click.connect(cGain);
    cGain.connect(dry);
    click.start(now);
    click.stop(now + 0.07);
  }

  private ensureHeavyBreathingElement(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;
    if (!this.heavyBreathingAudio) {
      const audio = new Audio(AUDIO_ASSETS.heavyBreathing);
      audio.loop = true;
      audio.preload = 'auto';
      this.heavyBreathingAudio = audio;
    }
    return this.heavyBreathingAudio;
  }

  public startMaskBreathing() {
    this.setBreathingState(true, 100);
  }

  public setBreathingState(active: boolean, oxygenPct = 100) {
    this.breathActive = active;
    if (!active || this.muted) {
      if (this.heavyBreathingAudio) {
        try {
          this.heavyBreathingAudio.pause();
          if (!active) this.heavyBreathingAudio.currentTime = 0;
        } catch {
          // ignore breathing pause error
        }
      }
      return;
    }

    const audio = this.ensureHeavyBreathingElement();
    if (!audio) return;

    // Scales breathing loudness & panic speed as oxygen drops toward 0%
    const deficit = Math.max(0, Math.min(1, (100 - oxygenPct) / 100));
    audio.loop = true;
    audio.muted = this.muted;
    audio.volume = Math.min(0.92, 0.34 + deficit * 0.56);
    try {
      audio.playbackRate = 0.96 + deficit * 0.32;
    } catch {
      // ignore playbackRate bounds on older devices
    }

    if (audio.paused) {
      void audio.play().catch(() => {});
    }
  }

  public stopMaskBreathing() {
    this.breathActive = false;
    if (this.heavyBreathingAudio) {
      try {
        this.heavyBreathingAudio.pause();
        this.heavyBreathingAudio.currentTime = 0;
      } catch {
        // ignore breathing stop error
      }
    }
  }

  public stopTurnBreath() {
    if (this.turnBreathTimer !== null) {
      window.clearTimeout(this.turnBreathTimer);
      this.turnBreathTimer = null;
    }
    if (this.activeTurnBreathSource) {
      try {
        this.activeTurnBreathSource.stop(0);
        this.activeTurnBreathSource.disconnect();
      } catch {
        // ignore turn breath stop error
      }
      this.activeTurnBreathSource = null;
    }
  }

  public playTurnBreath() {
    this.stopTurnBreath();
    if (this.muted) return;

    const url = AUDIO_ASSETS.heavyBreathing;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    const buffer = this.sfxBuffers.get(url);

    if (ctx && dry && buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0.62, now);
      g.gain.setValueAtTime(0.62, now + 1.15);
      g.gain.exponentialRampToValueAtTime(0.01, now + 1.55);
      src.connect(g);
      g.connect(dry);
      src.onended = () => {
        if (this.activeTurnBreathSource === src) {
          this.activeTurnBreathSource = null;
        }
      };
      this.activeTurnBreathSource = src;
      src.start(0);
      this.turnBreathTimer = window.setTimeout(() => {
        this.stopTurnBreath();
      }, 1580);
      return;
    }

    void this.loadSfxBuffer(url);
    const audio = this.ensureHeavyBreathingElement();
    if (!audio) return;
    audio.loop = false;
    audio.muted = this.muted;
    audio.volume = 0.62;
    try {
      audio.currentTime = ASSET_FALLBACK_OFFSET_SEC[url] ?? 0;
    } catch {
      // ignore seek before ready
    }
    void audio.play().catch(() => {});
    this.turnBreathTimer = window.setTimeout(() => {
      if (!this.breathActive) {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {
          // ignore
        }
      }
      this.turnBreathTimer = null;
    }, 1550);
  }

  public stopDoorScare() {
    this.doorScareToken += 1;
    if (this.activeDoorScareSource) {
      try {
        this.activeDoorScareSource.stop(0);
        this.activeDoorScareSource.disconnect();
      } catch {
        // ignore door scare stop error
      }
      this.activeDoorScareSource = null;
    }
    if (this.activeDoorScareAudio) {
      try {
        this.activeDoorScareAudio.pause();
        this.activeDoorScareAudio.currentTime = 0;
        this.activeDoorScareAudio.src = '';
      } catch {
        // ignore door scare html stop error
      }
      this.activeDoorScareAudio = null;
    }
  }

  public playDoorScare() {
    this.stopDoorScare();
    if (this.muted || this.rechargingSilence) return;

    const token = ++this.doorScareToken;
    const url = AUDIO_ASSETS.doorScare;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    const buffer = this.sfxBuffers.get(url);

    if (ctx && dry && buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = 0.88;
      src.connect(g);
      g.connect(dry);
      src.onended = () => {
        if (this.activeDoorScareSource === src) {
          this.activeDoorScareSource = null;
        }
      };
      this.activeDoorScareSource = src;
      src.start(0);
      return;
    }

    void this.loadSfxBuffer(url);
    const audio = new Audio(url);
    audio.volume = 0.88;
    audio.muted = this.muted;
    try {
      audio.currentTime = ASSET_FALLBACK_OFFSET_SEC[url] ?? 0;
    } catch {
      // ignore seek
    }
    audio.onended = () => {
      if (this.activeDoorScareAudio === audio) {
        this.activeDoorScareAudio = null;
      }
    };
    this.activeDoorScareAudio = audio;
    void audio.play().then(() => {
      if (token !== this.doorScareToken || this.muted) {
        audio.pause();
      }
    }).catch(() => {});
  }

  public stopGeneratorSound() {
    this.generatorToken += 1;
    if (this.activeGeneratorSource) {
      try {
        this.activeGeneratorSource.stop(0);
        this.activeGeneratorSource.disconnect();
      } catch {
        // ignore generator stop error
      }
      this.activeGeneratorSource = null;
    }
    if (this.activeGeneratorAudio) {
      try {
        this.activeGeneratorAudio.pause();
        this.activeGeneratorAudio.currentTime = 0;
        this.activeGeneratorAudio.src = '';
      } catch {
        // ignore generator html stop error
      }
      this.activeGeneratorAudio = null;
    }
  }

  public startGeneratorSound() {
    if (this.activeGeneratorSource || this.activeGeneratorAudio) return;
    if (this.muted) return;

    const token = ++this.generatorToken;
    const url = AUDIO_ASSETS.generatorLoop;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    const buffer = this.sfxBuffers.get(url);

    if (ctx && dry && buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      src.loop = true;
      const g = ctx.createGain();
      g.gain.value = 0.72;
      src.connect(g);
      g.connect(dry);
      src.onended = () => {
        if (this.activeGeneratorSource === src) {
          this.activeGeneratorSource = null;
        }
      };
      this.activeGeneratorSource = src;
      src.start(0);
      return;
    }

    void this.loadSfxBuffer(url);
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = 0.72;
    audio.muted = this.muted;
    try {
      audio.currentTime = ASSET_FALLBACK_OFFSET_SEC[url] ?? 0;
    } catch {
      // ignore seek
    }
    this.activeGeneratorAudio = audio;
    void audio.play().then(() => {
      if (token !== this.generatorToken || this.muted) {
        audio.pause();
      }
    }).catch(() => {});
  }

  public playHallFlicker() {
    if (this.muted || this.rechargingSilence) return;
    const ctx = this.ensureContext();
    const echo = this.getEchoBus();
    if (!ctx || !this.noiseBuffer || !echo) return;

    const pulses = [0, 0.22, 0.55, 1.05, 1.82, 2.02, 2.22];
    pulses.forEach((offset, idx) => {
      const t = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(idx >= 4 ? 120 + idx * 18 : 68, t);
      gain.gain.setValueAtTime(idx >= 4 ? 0.14 : 0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      const noise = ctx.createBufferSource();
      noise.buffer = this.noiseBuffer!;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = idx >= 4 ? 1900 : 850;
      const nGain = ctx.createGain();
      nGain.gain.setValueAtTime(idx >= 4 ? 0.16 : 0.08, t);
      nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

      osc.connect(gain);
      gain.connect(echo);
      noise.connect(filter);
      filter.connect(nGain);
      nGain.connect(echo);

      osc.start(t);
      osc.stop(t + 0.13);
      noise.start(t);
      noise.stop(t + 0.12);
    });
  }

  public playBlackoutJingle() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const echo = this.getEchoBus();
    if (!ctx || !echo) return;
    const notes = [392, 493.88, 587.33, 493.88, 392, 329.63, 392];
    notes.forEach((f, idx) => {
      const t = ctx.currentTime + idx * 0.42;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f * (idx % 2 === 0 ? 1 : 0.985), t);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
      osc.connect(gain);
      gain.connect(echo);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  }

  public isBossWarningActive(): boolean {
    return performance.now() < this.bossAudioEndsAt;
  }

  private synthArbolLaugh(volume = 0.74, echo = true) {
    const ctx = this.ensureContext();
    const bus = echo ? this.getEchoBus() : this.getDryBus();
    if (!ctx || !bus) return;
    const now = ctx.currentTime;
    const pulses = [0, 0.24, 0.49, 0.75, 1.05];
    pulses.forEach((offset, idx) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const sub = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      sub.type = 'triangle';
      const baseF = 118 - idx * 8;
      osc.frequency.setValueAtTime(baseF, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(44, baseF * 0.62), t + 0.21);
      sub.frequency.setValueAtTime(baseF * 0.5, t);
      sub.frequency.exponentialRampToValueAtTime(Math.max(28, baseF * 0.34), t + 0.21);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(420, t);
      filter.Q.value = 3.2;
      const amp = Math.min(0.45, volume * 0.42);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(amp, t + 0.025);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      osc.connect(filter);
      sub.connect(filter);
      filter.connect(g);
      g.connect(bus);
      osc.start(t);
      sub.start(t);
      osc.stop(t + 0.24);
      sub.stop(t + 0.24);
    });
  }

  private synthNonLaugh(volume = 0.76, echo = true) {
    const ctx = this.ensureContext();
    const bus = echo ? this.getEchoBus() : this.getDryBus();
    if (!ctx || !bus) return;
    const now = ctx.currentTime;
    const bursts = [0, 0.14, 0.28, 0.43, 0.61];
    bursts.forEach((offset, idx) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const mod = ctx.createOscillator();
      const modGain = ctx.createGain();
      const bp = ctx.createBiquadFilter();
      const g = ctx.createGain();
      osc.type = 'square';
      const f = 310 - idx * 24;
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(120, f * 0.68), t + 0.12);
      mod.type = 'sine';
      mod.frequency.value = 34;
      modGain.gain.value = 48;
      mod.connect(modGain);
      modGain.connect(osc.frequency);
      bp.type = 'bandpass';
      bp.frequency.value = 920;
      bp.Q.value = 1.8;
      const amp = Math.min(0.32, volume * 0.3);
      g.gain.setValueAtTime(0.001, t);
      g.gain.linearRampToValueAtTime(amp, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.13);
      osc.connect(bp);
      bp.connect(g);
      g.connect(bus);
      osc.start(t);
      mod.start(t);
      osc.stop(t + 0.14);
      mod.stop(t + 0.14);
    });
  }

  private synthChampiTires(volume = 0.66) {
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !dry) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const bp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1680, now);
    osc.frequency.exponentialRampToValueAtTime(840, now + 0.82);
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(1450, now);
    bp.Q.value = 4.5;
    const amp = Math.min(0.28, volume * 0.28);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(amp, now + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.85);
    osc.connect(bp);
    bp.connect(g);
    g.connect(dry);
    osc.start(now);
    osc.stop(now + 0.88);
    if (this.noiseBuffer) {
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuffer;
      const nBp = ctx.createBiquadFilter();
      nBp.type = 'bandpass';
      nBp.frequency.value = 2100;
      nBp.Q.value = 2.4;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(amp * 0.7, now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.82);
      n.connect(nBp);
      nBp.connect(ng);
      ng.connect(dry);
      n.start(now);
      n.stop(now + 0.85);
    }
  }

  private synthGlassBreak(volume = 0.84) {
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !dry) return;
    const now = ctx.currentTime;
    if (this.noiseBuffer) {
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuffer;
      const hp = ctx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 1650;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(Math.min(0.55, volume * 0.56), now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
      n.connect(hp);
      hp.connect(ng);
      ng.connect(dry);
      n.start(now);
      n.stop(now + 0.55);
    }
    const shardFreqs = [2850, 4120, 3490, 5260, 2380, 3920];
    shardFreqs.forEach((f, idx) => {
      const t = now + idx * 0.038;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t);
      osc.frequency.exponentialRampToValueAtTime(f * 0.72, t + 0.16);
      g.gain.setValueAtTime(Math.min(0.28, volume * 0.3), t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      osc.connect(g);
      g.connect(dry);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  private playSynthFallbackByUrl(
    url: string,
    volume: number,
    options?: { echo?: boolean; maxDurationMs?: number }
  ): boolean {
    if (url === AUDIO_ASSETS.arbolLaugh) {
      this.synthArbolLaugh(volume, Boolean(options?.echo));
      return true;
    }
    if (url === AUDIO_ASSETS.nonLaugh) {
      this.synthNonLaugh(volume, Boolean(options?.echo));
      return true;
    }
    if (url === AUDIO_ASSETS.champiTires) {
      this.synthChampiTires(volume);
      return true;
    }
    if (url === AUDIO_ASSETS.glassBreak) {
      this.synthGlassBreak(volume);
      return true;
    }
    return false;
  }

  private playBufferOrAudio(
    url: string,
    volume: number,
    options?: { markBossWindowMs?: number; maxDurationMs?: number; echo?: boolean }
  ) {
    if (this.muted || this.rechargingSilence) return;
    if (options?.markBossWindowMs) {
      this.bossAudioEndsAt = Math.max(
        this.bossAudioEndsAt,
        performance.now() + options.markBossWindowMs
      );
    }

    const ctx = this.ensureContext();
    const bus = options?.echo ? this.getEchoBus() : this.getDryBus();
    const buffer = this.sfxBuffers.get(url);

    if (ctx && bus && buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = volume;
      src.connect(g);
      g.connect(bus);
      src.start(0);
      if (options?.maxDurationMs) {
        src.stop(ctx.currentTime + options.maxDurationMs / 1000);
      }
      return;
    }

    if (this.failedSfxUrls.has(url)) {
      this.playSynthFallbackByUrl(url, volume, options);
      return;
    }

    void this.loadSfxBuffer(url).then((decoded) => {
      if (!decoded && this.failedSfxUrls.has(url)) {
        // Fallback already triggered if HTML audio fails; avoid duplicate play
      }
    });
    const audio = new Audio(url);
    audio.volume = volume;
    audio.muted = this.muted;
    try {
      audio.currentTime = ASSET_FALLBACK_OFFSET_SEC[url] ?? 0;
    } catch {
      // ignore seek
    }
    void audio.play().catch(() => {
      this.playSynthFallbackByUrl(url, volume, options);
    });
    if (options?.maxDurationMs) {
      window.setTimeout(() => {
        try {
          audio.pause();
          audio.currentTime = 0;
        } catch {
          // ignore
        }
      }, options.maxDurationMs);
    }
  }

  public playArbolLaugh(volume = 0.74, isHallwayWarn = false) {
    this.playBufferOrAudio(AUDIO_ASSETS.arbolLaugh, volume, {
      markBossWindowMs: isHallwayWarn ? 1850 : 0,
      echo: !isHallwayWarn,
    });
  }

  public stopNonCrawl() {
    this.nonCrawlToken += 1;
    if (this.activeNonCrawlSynthStop) {
      try {
        this.activeNonCrawlSynthStop();
      } catch {
        // ignore
      }
      this.activeNonCrawlSynthStop = null;
    }
    if (this.activeNonCrawlSource) {
      try {
        this.activeNonCrawlSource.stop(0);
        this.activeNonCrawlSource.disconnect();
      } catch {
        // ignore
      }
      this.activeNonCrawlSource = null;
    }
    if (this.activeNonCrawlAudio) {
      try {
        this.activeNonCrawlAudio.pause();
        this.activeNonCrawlAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.activeNonCrawlAudio = null;
    }
  }

  private synthNonCrawl(volume = 0.56, token: number) {
    const ctx = this.ensureContext();
    const echo = this.getEchoBus();
    if (!ctx || !echo || token !== this.nonCrawlToken) return;
    const now = ctx.currentTime;
    const activeNodes: Array<AudioScheduledSourceNode> = [];
    const steps = [0, 0.19, 0.38, 0.58, 0.79, 1.0];
    steps.forEach((offset, idx) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sawtooth';
      osc.frequency.setValueAtTime(idx % 2 === 0 ? 185 : 260, t);
      osc.frequency.exponentialRampToValueAtTime(75, t + 0.11);
      g.gain.setValueAtTime(Math.min(0.24, volume * 0.26), t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
      osc.connect(g);
      g.connect(echo);
      osc.start(t);
      osc.stop(t + 0.13);
      activeNodes.push(osc);
      if (this.noiseBuffer) {
        const n = ctx.createBufferSource();
        n.buffer = this.noiseBuffer;
        const bp = ctx.createBiquadFilter();
        bp.type = 'bandpass';
        bp.frequency.value = 1100;
        bp.Q.value = 2.6;
        const ng = ctx.createGain();
        ng.gain.setValueAtTime(Math.min(0.22, volume * 0.28), t);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        n.connect(bp);
        bp.connect(ng);
        ng.connect(echo);
        n.start(t);
        n.stop(t + 0.11);
        activeNodes.push(n);
      }
    });
    this.activeNonCrawlSynthStop = () => {
      activeNodes.forEach((node) => {
        try {
          node.stop(0);
          node.disconnect();
        } catch {
          // ignore
        }
      });
    };
  }

  public playNonCrawl(volume = 0.56) {
    this.stopNonCrawl();
    if (this.muted || this.rechargingSilence) return;
    const token = ++this.nonCrawlToken;
    const url = AUDIO_ASSETS.nonCrawl;
    const ctx = this.ensureContext();
    const echo = this.getEchoBus();
    const buffer = this.sfxBuffers.get(url);

    if (ctx && echo && buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = volume;
      src.connect(g);
      g.connect(echo);
      src.onended = () => {
        if (this.activeNonCrawlSource === src) this.activeNonCrawlSource = null;
      };
      this.activeNonCrawlSource = src;
      src.start(0);
      return;
    }

    if (this.failedSfxUrls.has(url)) {
      this.synthNonCrawl(volume, token);
      return;
    }

    void this.loadSfxBuffer(url);
    const audio = new Audio(url);
    audio.volume = Math.min(1, volume);
    audio.muted = this.muted;
    try {
      audio.currentTime = ASSET_FALLBACK_OFFSET_SEC[url] ?? 0;
    } catch {
      // ignore seek before ready
    }
    audio.onended = () => {
      if (this.activeNonCrawlAudio === audio) {
        this.activeNonCrawlAudio = null;
      }
    };
    this.activeNonCrawlAudio = audio;
    void audio.play().catch(() => {
      if (token === this.nonCrawlToken && !this.muted && !this.rechargingSilence) {
        this.synthNonCrawl(volume, token);
      }
    });
  }

  public playNonLaugh(volume = 0.76, isHallwayWarn = false) {
    this.playBufferOrAudio(AUDIO_ASSETS.nonLaugh, volume, {
      markBossWindowMs: isHallwayWarn ? 1850 : 0,
      echo: !isHallwayWarn,
    });
  }

  public playChampiTires(volume = 0.66, isHallwayWarn = false) {
    this.playBufferOrAudio(AUDIO_ASSETS.champiTires, volume, {
      markBossWindowMs: isHallwayWarn ? 1600 : 0,
      maxDurationMs: 1850,
    });
  }

  public playChampiGears(volume = 0.68) {
    this.playBufferOrAudio(AUDIO_ASSETS.champiGears, volume, {
      maxDurationMs: 1650,
    });
  }

  public stopChampiFoxyRun() {
    this.foxyRunToken += 1;
    if (this.activeFoxyRunSource) {
      try {
        this.activeFoxyRunSource.stop(0);
        this.activeFoxyRunSource.disconnect();
      } catch {
        // ignore stop error
      }
      this.activeFoxyRunSource = null;
    }
    if (this.activeFoxyRunAudio) {
      try {
        this.activeFoxyRunAudio.pause();
        this.activeFoxyRunAudio.currentTime = 0;
        this.activeFoxyRunAudio.src = '';
      } catch {
        // ignore pause error
      }
      this.activeFoxyRunAudio = null;
    }
  }

  public playChampiFoxyRun(volume = 0.94) {
    this.stopChampiFoxyRun();
    if (this.muted || this.rechargingSilence) return;

    const token = ++this.foxyRunToken;
    const url = AUDIO_ASSETS.foxyRun;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    const buffer = this.sfxBuffers.get(url);

    if (ctx && dry && buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = volume;
      src.connect(g);
      g.connect(dry);
      src.onended = () => {
        if (this.activeFoxyRunSource === src) {
          this.activeFoxyRunSource = null;
        }
      };
      this.activeFoxyRunSource = src;
      src.start(0);
      return;
    }

    void this.loadSfxBuffer(url);
    const audio = new Audio(url);
    audio.volume = volume;
    audio.muted = this.muted;
    try {
      audio.currentTime = ASSET_FALLBACK_OFFSET_SEC[url] ?? 0;
    } catch {
      // ignore seek
    }
    audio.onended = () => {
      if (this.activeFoxyRunAudio === audio) {
        this.activeFoxyRunAudio = null;
      }
    };
    this.activeFoxyRunAudio = audio;
    void audio.play().then(() => {
      if (token !== this.foxyRunToken || this.muted) {
        audio.pause();
      }
    }).catch(() => {});
  }

  private syncInfiniteHomerVolume() {
    const shouldSilence = !this.infiniteHomerActive || this.muted || this.rechargingSilence;
    if (this.infiniteHomerGain && this.ctx) {
      this.infiniteHomerGain.gain.setTargetAtTime(
        shouldSilence ? 0 : 0.145,
        this.ctx.currentTime,
        0.06
      );
    }
    if (this.infiniteHomerAudio) {
      this.infiniteHomerAudio.muted = shouldSilence;
      this.infiniteHomerAudio.volume = 0.145;
      if (!shouldSilence && this.infiniteHomerAudio.paused) {
        void this.infiniteHomerAudio.play().catch(() => {});
      } else if (shouldSilence && !this.infiniteHomerAudio.paused) {
        try {
          this.infiniteHomerAudio.pause();
        } catch {
          // ignore pause
        }
      }
    }
  }

  public startInfiniteHomerLoop() {
    if (this.infiniteHomerActive) {
      this.syncInfiniteHomerVolume();
      return;
    }
    this.infiniteHomerActive = true;
    const token = ++this.infiniteHomerToken;
    const url = AUDIO_ASSETS.cameraLure;

    const startHtmlFallback = () => {
      if (!this.infiniteHomerActive || token !== this.infiniteHomerToken) return;
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0.145;
      audio.muted = this.muted || this.rechargingSilence;
      this.infiniteHomerAudio = audio;
      if (!audio.muted) {
        void audio.play().catch(() => {});
      }
    };

    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    const cached = this.sfxBuffers.get(url);

    if (ctx && dry && cached) {
      const src = ctx.createBufferSource();
      src.buffer = cached;
      src.loop = true;
      // Gentle warm lowpass + low balanced gain so footsteps, vent creaks & boss laughs cut clearly
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1550;
      const gain = ctx.createGain();
      gain.gain.value = this.muted || this.rechargingSilence ? 0 : 0.145;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(dry);
      this.infiniteHomerSource = src;
      this.infiniteHomerGain = gain;
      src.start(0);
      return;
    }

    startHtmlFallback();
    void this.loadSfxBuffer(url).then((decoded) => {
      if (!decoded || !this.infiniteHomerActive || token !== this.infiniteHomerToken) return;
      const activeCtx = this.ensureContext();
      const activeDry = this.getDryBus();
      if (!activeCtx || !activeDry) return;
      if (this.infiniteHomerAudio) {
        try {
          this.infiniteHomerAudio.pause();
          this.infiniteHomerAudio.src = '';
        } catch {
          // ignore
        }
        this.infiniteHomerAudio = null;
      }
      if (!this.infiniteHomerSource) {
        const src = activeCtx.createBufferSource();
        src.buffer = decoded;
        src.loop = true;
        const filter = activeCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1550;
        const gain = activeCtx.createGain();
        gain.gain.value = this.muted || this.rechargingSilence ? 0 : 0.145;
        src.connect(filter);
        filter.connect(gain);
        gain.connect(activeDry);
        this.infiniteHomerSource = src;
        this.infiniteHomerGain = gain;
        src.start(0);
      }
    });
  }

  public stopInfiniteHomerLoop() {
    this.infiniteHomerActive = false;
    this.infiniteHomerToken += 1;
    if (this.infiniteHomerSource) {
      try {
        this.infiniteHomerSource.stop(0);
        this.infiniteHomerSource.disconnect();
      } catch {
        // ignore
      }
      this.infiniteHomerSource = null;
    }
    if (this.infiniteHomerGain) {
      try {
        this.infiniteHomerGain.disconnect();
      } catch {
        // ignore
      }
      this.infiniteHomerGain = null;
    }
    if (this.infiniteHomerAudio) {
      try {
        this.infiniteHomerAudio.pause();
        this.infiniteHomerAudio.currentTime = 0;
        this.infiniteHomerAudio.src = '';
      } catch {
        // ignore
      }
      this.infiniteHomerAudio = null;
    }
  }

  public playGlassBreak(volume = 0.92) {
    if (this.muted || this.rechargingSilence) return;
    this.synthGlassBreak(volume);
  }

  public stopCamInterference() {
    this.interferenceToken += 1;
    if (this.activeInterferenceSynthStop) {
      try {
        this.activeInterferenceSynthStop();
      } catch {
        // ignore
      }
      this.activeInterferenceSynthStop = null;
    }
    if (this.activeInterferenceSource) {
      try {
        this.activeInterferenceSource.stop(0);
        this.activeInterferenceSource.disconnect();
      } catch {
        // ignore
      }
      this.activeInterferenceSource = null;
    }
    if (this.activeInterferenceAudio) {
      try {
        this.activeInterferenceAudio.pause();
        this.activeInterferenceAudio.currentTime = 0;
      } catch {
        // ignore
      }
      this.activeInterferenceAudio = null;
    }
  }

  private synthCamInterference(volume = 0.78, token: number) {
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !dry || token !== this.interferenceToken) return;
    const now = ctx.currentTime;
    const nodes: AudioScheduledSourceNode[] = [];
    const osc = ctx.createOscillator();
    const og = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(125, now);
    osc.frequency.linearRampToValueAtTime(60, now + 1.1);
    og.gain.setValueAtTime(Math.min(0.18, volume * 0.16), now);
    og.gain.exponentialRampToValueAtTime(0.001, now + 1.15);
    osc.connect(og);
    og.connect(dry);
    osc.start(now);
    osc.stop(now + 1.18);
    nodes.push(osc);
    if (this.noiseBuffer) {
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(1900, now);
      bp.frequency.exponentialRampToValueAtTime(680, now + 1.1);
      bp.Q.value = 1.6;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(Math.min(0.32, volume * 0.34), now);
      ng.gain.exponentialRampToValueAtTime(0.001, now + 1.15);
      n.connect(bp);
      bp.connect(ng);
      ng.connect(dry);
      n.start(now);
      n.stop(now + 1.18);
      nodes.push(n);
    }
    this.activeInterferenceSynthStop = () => {
      nodes.forEach((node) => {
        try {
          node.stop(0);
          node.disconnect();
        } catch {
          // ignore
        }
      });
    };
  }

  public playCamInterference(volume = 0.78) {
    this.stopCamInterference();
    if (this.muted || this.rechargingSilence) return;
    const token = ++this.interferenceToken;
    const url = AUDIO_ASSETS.camInterference;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    const buffer = this.sfxBuffers.get(url);

    if (ctx && dry && buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = volume;
      src.connect(g);
      g.connect(dry);
      src.onended = () => {
        if (this.activeInterferenceSource === src) this.activeInterferenceSource = null;
      };
      this.activeInterferenceSource = src;
      src.start(0);
      return;
    }

    if (this.failedSfxUrls.has(url)) {
      this.synthCamInterference(volume, token);
      return;
    }

    void this.loadSfxBuffer(url);
    const audio = new Audio(url);
    audio.volume = volume;
    audio.muted = this.muted;
    this.activeInterferenceAudio = audio;
    void audio
      .play()
      .then(() => {
        if (token !== this.interferenceToken || this.muted) audio.pause();
      })
      .catch(() => {
        if (token === this.interferenceToken && !this.muted && !this.rechargingSilence) {
          this.synthCamInterference(volume, token);
        }
      });
  }

  public stopCharroVoice() {
    this.charroToken += 1;
    if (this.charroDuckedMusic) {
      this.charroDuckedMusic = false;
      this.setNightMusicDucked(false);
    }
    if (this.activeCharroSynthStop) {
      try {
        this.activeCharroSynthStop();
      } catch {
        // ignore
      }
      this.activeCharroSynthStop = null;
    }
    if (this.activeCharroSource) {
      try {
        this.activeCharroSource.stop(0);
        this.activeCharroSource.disconnect();
      } catch {
        // ignore
      }
      this.activeCharroSource = null;
    }
    if (this.activeCharroAudio) {
      try {
        this.activeCharroAudio.pause();
        this.activeCharroAudio.currentTime = 0;
        this.activeCharroAudio.src = '';
      } catch {
        // ignore
      }
      this.activeCharroAudio = null;
    }
    if (this.activeCharroUtterance) {
      this.activeCharroUtterance = null;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
        } catch {
          // ignore
        }
      }
    }
  }

  private synthCharroVoice(volume = 0.88, maxDurationMs?: number, token?: number) {
    const ctx = this.ensureContext();
    const echo = this.getEchoBus();
    if (!ctx || !echo || (token !== undefined && token !== this.charroToken)) return;
    const now = ctx.currentTime;
    const durSec = maxDurationMs ? Math.min(2.6, maxDurationMs / 1000) : 2.8;
    const nodes: AudioScheduledSourceNode[] = [];

    // Dark spectral bass growl + eerie metallic whip resonance
    const bass = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const lp = ctx.createBiquadFilter();
    const g = ctx.createGain();
    bass.type = 'sawtooth';
    sub.type = 'triangle';
    bass.frequency.setValueAtTime(92, now);
    bass.frequency.linearRampToValueAtTime(62, now + durSec);
    sub.frequency.setValueAtTime(46, now);
    sub.frequency.linearRampToValueAtTime(34, now + durSec);
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(340, now);
    lp.Q.value = 3.5;
    const amp = Math.min(0.28, volume * 0.28);
    g.gain.setValueAtTime(0.001, now);
    g.gain.linearRampToValueAtTime(amp, now + 0.08);
    g.gain.exponentialRampToValueAtTime(0.001, now + durSec);
    bass.connect(lp);
    sub.connect(lp);
    lp.connect(g);
    g.connect(echo);
    bass.start(now);
    sub.start(now);
    bass.stop(now + durSec + 0.04);
    sub.stop(now + durSec + 0.04);
    nodes.push(bass, sub);

    if (this.noiseBuffer) {
      const whip = ctx.createBufferSource();
      whip.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.setValueAtTime(2400, now + 0.05);
      bp.frequency.exponentialRampToValueAtTime(520, now + 0.36);
      bp.Q.value = 3.0;
      const wg = ctx.createGain();
      wg.gain.setValueAtTime(0.001, now + 0.05);
      wg.gain.linearRampToValueAtTime(amp * 0.65, now + 0.08);
      wg.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
      whip.connect(bp);
      bp.connect(wg);
      wg.connect(echo);
      whip.start(now + 0.05);
      whip.stop(now + 0.4);
      nodes.push(whip);
    }

    if (
      typeof window !== 'undefined' &&
      'speechSynthesis' in window &&
      typeof SpeechSynthesisUtterance !== 'undefined' &&
      token === this.charroToken
    ) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(
          'Devolver el alma de Beatriz... pues eso ya no se puede, ya me la llevé'
        );
        utter.lang = 'es-MX';
        utter.pitch = 0.25;
        utter.rate = 0.92;
        utter.volume = Math.min(1, volume);
        const voices = window.speechSynthesis.getVoices();
        const esVoice = voices.find((v) => v.lang.toLowerCase().startsWith('es'));
        if (esVoice) utter.voice = esVoice;
        utter.onend = () => {
          if (this.activeCharroUtterance === utter) {
            this.activeCharroUtterance = null;
          }
        };
        utter.onerror = () => {
          if (this.activeCharroUtterance === utter) {
            this.activeCharroUtterance = null;
          }
        };
        this.activeCharroUtterance = utter;
        window.speechSynthesis.speak(utter);
      } catch {
        // ignore speech synthesis fallback errors
      }
    }

    this.activeCharroSynthStop = () => {
      nodes.forEach((node) => {
        try {
          node.stop(0);
          node.disconnect();
        } catch {
          // ignore
        }
      });
    };
  }

  public playCharroVoice(volume = 0.96, maxDurationMs?: number) {
    this.stopCharroVoice();
    if (this.muted || this.rechargingSilence) return;
    const token = ++this.charroToken;
    const url = AUDIO_ASSETS.charroVoice;
    const playVol = Math.min(1, Math.max(0.95, volume));
    this.charroDuckedMusic = true;
    this.setNightMusicDucked(true);
    const restoreDuck = () => {
      if (token === this.charroToken && this.charroDuckedMusic) {
        this.charroDuckedMusic = false;
        this.setNightMusicDucked(false);
      }
    };
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    const buffer = this.sfxBuffers.get(url);

    if (ctx && dry && buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = playVol;
      src.connect(g);
      g.connect(dry);
      src.onended = () => {
        if (this.activeCharroSource === src) this.activeCharroSource = null;
        restoreDuck();
      };
      this.activeCharroSource = src;
      src.start(0);
      if (maxDurationMs) {
        src.stop(ctx.currentTime + maxDurationMs / 1000);
      }
      return;
    }

    if (this.failedSfxUrls.has(url)) {
      this.synthCharroVoice(playVol, maxDurationMs, token);
      return;
    }

    void this.loadSfxBuffer(url);
    const audio = new Audio(url);
    audio.volume = playVol;
    audio.muted = this.muted;
    audio.onended = () => {
      if (this.activeCharroAudio === audio) this.activeCharroAudio = null;
      restoreDuck();
    };
    this.activeCharroAudio = audio;
    void audio
      .play()
      .then(() => {
        if (token !== this.charroToken || this.muted) {
          audio.pause();
          return;
        }
        if (maxDurationMs) {
          window.setTimeout(() => {
            if (token === this.charroToken && this.activeCharroAudio === audio) {
              try {
                audio.pause();
                audio.currentTime = 0;
              } catch {
                // ignore
              }
              restoreDuck();
            }
          }, maxDurationMs);
        }
      })
      .catch(() => {
        if (token === this.charroToken && !this.muted && !this.rechargingSilence) {
          this.synthCharroVoice(playVol, maxDurationMs, token);
        }
      });
  }

  public stopJumpscare() {
    this.jumpscareToken += 1;
    if (this.activeJumpscareSource) {
      try {
        this.activeJumpscareSource.stop(0);
        this.activeJumpscareSource.disconnect();
      } catch {
        // ignore buffer stop errors
      }
      this.activeJumpscareSource = null;
    }
    if (this.activeJumpscareAudio) {
      try {
        this.activeJumpscareAudio.pause();
        this.activeJumpscareAudio.currentTime = 0;
        this.activeJumpscareAudio.src = '';
      } catch {
        // ignore html audio stop errors
      }
      this.activeJumpscareAudio = null;
    }
  }

  private synthJumpscare(killer: TelechobiId) {
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !dry) return;
    const now = ctx.currentTime;
    const baseFreq =
      killer === 'charro' || killer === 'arbol'
        ? 185
        : killer === 'champi' || killer === 'tis'
          ? 340
          : 260;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const shaperGain = ctx.createGain();
    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 2.4, now + 0.14);
    osc1.frequency.linearRampToValueAtTime(baseFreq * 1.4, now + 1.15);
    osc2.frequency.setValueAtTime(baseFreq * 1.48, now);
    osc2.frequency.linearRampToValueAtTime(baseFreq * 2.9, now + 0.9);
    shaperGain.gain.setValueAtTime(0.42, now);
    shaperGain.gain.exponentialRampToValueAtTime(0.002, now + 1.25);
    osc1.connect(shaperGain);
    osc2.connect(shaperGain);
    shaperGain.connect(dry);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.28);
    osc2.stop(now + 1.28);

    if (this.noiseBuffer) {
      const n = ctx.createBufferSource();
      n.buffer = this.noiseBuffer;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 1450;
      bp.Q.value = 1.1;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(0.55, now);
      ng.gain.exponentialRampToValueAtTime(0.002, now + 1.2);
      n.connect(bp);
      bp.connect(ng);
      ng.connect(dry);
      n.start(now);
      n.stop(now + 1.22);
    }
  }

  public playJumpscare(
    killer: TelechobiId = 'ton',
    source: JumpscareSource = 'door'
  ) {
    this.stopJumpscare();
    this.stopNightMusic();
    this.stopVentSound();
    this.stopVentCreak();
    this.stopCameraLureAudio();
    this.stopInfiniteHomerLoop();
    this.stopDoorSlam();
    this.stopHallwayNoise();
    this.stopMaskBreathing();
    this.stopPhoneVoice();
    this.stopCharroVoice();
    this.stopCamInterference();
    this.stopNonCrawl();
    this.stopChampiFoxyRun();
    this.stopGlamrockDuel();
    this.stopAuraBattleSong();
    this.stopTralaleroSong();
    this.stopPaperMove();
    if (this.muted) return;

    if (source === 'oxygen') {
      // Suffocation blackout cue instead of a loud animatronic scream
      const ctx = this.ensureContext();
      const dry = this.getDryBus();
      if (ctx && this.noiseBuffer && dry) {
        const now = ctx.currentTime;
        const n = ctx.createBufferSource();
        n.buffer = this.noiseBuffer;
        const f = ctx.createBiquadFilter();
        f.type = 'lowpass';
        f.frequency.setValueAtTime(680, now);
        f.frequency.exponentialRampToValueAtTime(110, now + 1.25);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.32, now);
        g.gain.exponentialRampToValueAtTime(0.001, now + 1.3);
        n.connect(f);
        f.connect(g);
        g.connect(dry);
        n.start(now);
        n.stop(now + 1.32);
      }
      return;
    }

    const token = ++this.jumpscareToken;
    const assetUrl = AUDIO_ASSETS.jumpscare[killer] || AUDIO_ASSETS.jumpscare.ton;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    const buffer = this.sfxBuffers.get(assetUrl);

    if (ctx && dry && buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.value = 0.96;
      src.connect(gain);
      gain.connect(dry);
      src.onended = () => {
        if (this.activeJumpscareSource === src) {
          this.activeJumpscareSource = null;
        }
      };
      this.activeJumpscareSource = src;
      src.start(0);
      return;
    }

    if (this.failedSfxUrls.has(assetUrl)) {
      this.synthJumpscare(killer);
      return;
    }

    void this.loadSfxBuffer(assetUrl);
    const audio = new Audio(assetUrl);
    audio.volume = 0.96;
    audio.muted = this.muted;
    try {
      audio.currentTime = ASSET_FALLBACK_OFFSET_SEC[assetUrl] ?? 0;
    } catch {
      // ignore seek before ready
    }
    audio.onended = () => {
      if (this.activeJumpscareAudio === audio) {
        this.activeJumpscareAudio = null;
      }
    };
    this.activeJumpscareAudio = audio;
    void audio
      .play()
      .then(() => {
        if (token !== this.jumpscareToken || this.muted) {
          audio.pause();
        }
      })
      .catch(() => {
        if (token === this.jumpscareToken && !this.muted) {
          this.synthJumpscare(killer);
        }
      });
  }

  public play6AMChime() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const echo = this.getEchoBus();
    if (!ctx || !echo) return;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, idx) => {
      const t = ctx.currentTime + idx * 0.45;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;
      gain.gain.setValueAtTime(0.19, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      osc.connect(gain);
      gain.connect(echo);
      osc.start(t);
      osc.stop(t + 1.25);
    });
  }

  public playMatchIgnite() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !dry || !this.noiseBuffer) return;
    const now = ctx.currentTime;

    // Sharp match strike + quick fuel whoosh
    const strike = ctx.createBufferSource();
    strike.buffer = this.noiseBuffer;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.setValueAtTime(2400, now);
    bp.Q.value = 1.6;
    const g1 = ctx.createGain();
    g1.gain.setValueAtTime(0.001, now);
    g1.gain.linearRampToValueAtTime(0.24, now + 0.04);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    strike.connect(bp);
    bp.connect(g1);
    g1.connect(dry);
    strike.start(now);
    strike.stop(now + 0.24);

    const whoosh = ctx.createBufferSource();
    whoosh.buffer = this.noiseBuffer;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.setValueAtTime(160, now + 0.16);
    lp.frequency.exponentialRampToValueAtTime(950, now + 0.55);
    lp.frequency.exponentialRampToValueAtTime(340, now + 1.35);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.001, now + 0.16);
    g2.gain.linearRampToValueAtTime(0.32, now + 0.42);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 1.45);
    whoosh.connect(lp);
    lp.connect(g2);
    g2.connect(dry);
    whoosh.start(now + 0.16);
    whoosh.stop(now + 1.5);
  }

  public startEndingFireSound() {
    this.stopEndingFireSound();
    if (this.muted) return;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !dry || !this.noiseBuffer) return;

    const now = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = this.noiseBuffer;
    src.loop = true;

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 460;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 1.2);

    src.connect(lp);
    lp.connect(gain);
    gain.connect(dry);
    src.start(now);

    this.endingFireNodes = [src, lp, gain];

    this.endingFireInterval = window.setInterval(() => {
      if (this.muted || !this.ctx || !this.noiseBuffer) return;
      const d = this.getDryBus();
      if (!d) return;
      const t = this.ctx.currentTime;
      const pop = this.ctx.createBufferSource();
      pop.buffer = this.noiseBuffer;
      const hp = this.ctx.createBiquadFilter();
      hp.type = 'bandpass';
      hp.frequency.value = 1600 + Math.random() * 1900;
      hp.Q.value = 3.2;
      const g = this.ctx.createGain();
      const peak = 0.04 + Math.random() * 0.08;
      g.gain.setValueAtTime(peak, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05 + Math.random() * 0.04);
      pop.connect(hp);
      hp.connect(g);
      g.connect(d);
      pop.start(t);
      pop.stop(t + 0.11);
    }, 240);
  }

  public stopEndingFireSound() {
    if (this.endingFireInterval !== null) {
      window.clearInterval(this.endingFireInterval);
      this.endingFireInterval = null;
    }
    this.endingFireNodes.forEach((n) => {
      try {
        if ('stop' in n && typeof (n as AudioBufferSourceNode).stop === 'function') {
          (n as AudioBufferSourceNode).stop();
        }
        n.disconnect();
      } catch {
        // ignore stop error
      }
    });
    this.endingFireNodes = [];
  }

  public playSoulReleaseChord() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const echo = this.getEchoBus();
    if (!ctx || !echo) return;

    const freqs = [261.63, 329.63, 392.0, 523.25, 659.25];
    freqs.forEach((f, idx) => {
      const t = ctx.currentTime + idx * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.085, t + 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + 5.2);
      osc.connect(gain);
      gain.connect(echo);
      osc.start(t);
      osc.stop(t + 5.3);
    });
  }

  public stopGlamrockDuel() {
    this.glamrockDuelToken += 1;
    if (this.activeGlamrockDuelSource) {
      try {
        this.activeGlamrockDuelSource.stop(0);
        this.activeGlamrockDuelSource.disconnect();
      } catch {
        // ignore
      }
      this.activeGlamrockDuelSource = null;
    }
    if (this.activeGlamrockDuelAudio) {
      try {
        this.activeGlamrockDuelAudio.pause();
        this.activeGlamrockDuelAudio.currentTime = 0;
        this.activeGlamrockDuelAudio.src = '';
      } catch {
        // ignore
      }
      this.activeGlamrockDuelAudio = null;
    }
  }

  public playGlamrockDuel(volume = 0.94) {
    this.stopGlamrockDuel();
    if (this.muted || this.rechargingSilence) return;
    const token = ++this.glamrockDuelToken;
    const url = AUDIO_ASSETS.glamrockDuel;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    const buffer = this.sfxBuffers.get(url);

    if (ctx && dry && buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = volume;
      src.connect(g);
      g.connect(dry);
      src.onended = () => {
        if (this.activeGlamrockDuelSource === src) {
          this.activeGlamrockDuelSource = null;
        }
      };
      this.activeGlamrockDuelSource = src;
      src.start(0);
      return;
    }

    void this.loadSfxBuffer(url);
    const audio = new Audio(url);
    audio.volume = volume;
    audio.muted = this.muted;
    audio.onended = () => {
      if (this.activeGlamrockDuelAudio === audio) {
        this.activeGlamrockDuelAudio = null;
      }
    };
    this.activeGlamrockDuelAudio = audio;
    void audio.play().then(() => {
      if (token !== this.glamrockDuelToken || this.muted) {
        audio.pause();
      }
    }).catch(() => {});
  }

  public stopAuraBattleSong() {
    this.auraBattleToken += 1;
    if (this.auraBattleAudio) {
      try {
        this.auraBattleAudio.pause();
        this.auraBattleAudio.currentTime = 0;
        this.auraBattleAudio.src = '';
      } catch {
        // ignore
      }
      this.auraBattleAudio = null;
    }
    if (this.nightMusicShouldPlay && this.nightMusicAudio && !this.rechargingSilence) {
      this.setNightMusicDucked(false);
    }
  }

  public startAuraBattleSong(volume = 0.72) {
    this.stopGlamrockDuel();
    this.stopAuraBattleSong();
    if (this.muted || this.rechargingSilence) return;
    const token = ++this.auraBattleToken;
    this.setNightMusicDucked(true);
    const audio = new Audio(AUDIO_ASSETS.auraFarmerSong);
    audio.loop = true;
    audio.volume = volume;
    audio.muted = this.muted;
    try {
      audio.currentTime = 0;
    } catch {
      // ignore
    }
    this.auraBattleAudio = audio;
    void audio.play().then(() => {
      if (token !== this.auraBattleToken || this.muted) {
        audio.pause();
      }
    }).catch(() => {});
  }

  public stopTralaleroSong() {
    this.tralaleroToken += 1;
    if (this.tralaleroAudio) {
      try {
        this.tralaleroAudio.pause();
        this.tralaleroAudio.currentTime = 0;
        this.tralaleroAudio.src = '';
      } catch {
        // ignore
      }
      this.tralaleroAudio = null;
    }
    if (this.nightMusicShouldPlay && this.nightMusicAudio && !this.rechargingSilence) {
      this.setNightMusicDucked(false);
    }
  }

  public startTralaleroSong(volume = 0.65) {
    this.stopTralaleroSong();
    if (this.muted || this.rechargingSilence) return;
    const token = ++this.tralaleroToken;
    this.setNightMusicDucked(true);
    const audio = new Audio(AUDIO_ASSETS.tralaleroSong);
    audio.loop = true;
    audio.volume = volume;
    audio.muted = this.muted;
    try {
      audio.currentTime = 0;
    } catch {
      // ignore
    }
    this.tralaleroAudio = audio;
    void audio.play().then(() => {
      if (token !== this.tralaleroToken || this.muted) {
        audio.pause();
      }
    }).catch(() => {});
  }

  public stopPaperMove() {
    this.paperToken += 1;
    if (this.activePaperSource) {
      try {
        this.activePaperSource.stop(0);
        this.activePaperSource.disconnect();
      } catch {
        // ignore
      }
      this.activePaperSource = null;
    }
    if (this.activePaperAudio) {
      try {
        this.activePaperAudio.pause();
        this.activePaperAudio.currentTime = 0;
        this.activePaperAudio.src = '';
      } catch {
        // ignore
      }
      this.activePaperAudio = null;
    }
  }

  public playPaperMove(volume = 0.92) {
    this.stopPaperMove();
    if (this.muted) return;
    const token = ++this.paperToken;
    const url = AUDIO_ASSETS.paperMove;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    const buffer = this.sfxBuffers.get(url);

    if (ctx && dry && buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const g = ctx.createGain();
      g.gain.value = volume;
      src.connect(g);
      g.connect(dry);
      src.onended = () => {
        if (this.activePaperSource === src) {
          this.activePaperSource = null;
        }
      };
      this.activePaperSource = src;
      src.start(0);
      return;
    }

    void this.loadSfxBuffer(url);
    const audio = new Audio(url);
    audio.volume = volume;
    audio.muted = this.muted;
    audio.onended = () => {
      if (this.activePaperAudio === audio) {
        this.activePaperAudio = null;
      }
    };
    this.activePaperAudio = audio;
    void audio.play().then(() => {
      if (token !== this.paperToken || this.muted) {
        audio.pause();
      }
    }).catch(() => {});
  }
}

export const soundEngine = new SoundEngine();
