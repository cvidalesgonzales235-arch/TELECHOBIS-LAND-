// Procedural Web Audio API synthesizer for TELECHOBIS LAND
// Unified abandoned 1999 TV studio acoustic bus (compressor + concrete hall slapback reverb)
// + adaptive tension drone + detuned 1990s analog VHS nocturne

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
  private breathTimer: number | null = null;
  private lastFootstepAt = 0;
  private speechTimer: number | null = null;
  private activeUtteranceToken = 0;

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
      this.ambientGain.gain.setTargetAtTime(muted ? 0 : 0.12, this.ctx.currentTime, 0.05);
    }
    if (muted) {
      this.stopMaskBreathing();
      this.stopPhoneVoice();
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public unlock() {
    this.ensureContext();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.getVoices();
      } catch {
        // ignore speech synthesis probe errors
      }
    }
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
        !this.muted && state.monitorOpen ? 0.18 : 0.025,
        now,
        0.12
      );
    }
    if (this.threatGain) {
      const threatLevel = this.muted
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
    if (this.muted || !echo) return;
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
    if (this.muted || !this.noiseBuffer || !echo) return;
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
      if (!this.ctx || !this.ambientGain || this.muted) return;
      const roll = Math.random();
      if (roll < 0.36) {
        this.playDistantStudioCreak(this.ctx);
      } else if (roll < 0.78) {
        this.playDistantDripOrIntercom(this.ctx, mode);
      }
    }, mode === 'menu' ? 3500 : 4100);

    // Haunted VHS Nocturne Music Box in Main Menu
    if (mode === 'menu') {
      let step = 0;
      this.playMenuNocturneNote(ctx, step++);
      this.menuMusicInterval = window.setInterval(() => {
        if (!this.ctx || this.muted) return;
        this.playMenuNocturneNote(this.ctx, step++);
      }, 1750);
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

  public playDoorSlam(closed: boolean) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const echo = this.getEchoBus();
    const dry = this.getDryBus();
    if (!ctx || !this.noiseBuffer || !echo || !dry) return;

    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(closed ? 110 : 75, now);
    osc.frequency.exponentialRampToValueAtTime(34, now + 0.28);
    oscGain.gain.setValueAtTime(0.32, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(closed ? 520 : 380, now);
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.22, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(oscGain);
    oscGain.connect(dry);
    oscGain.connect(echo);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(echo);

    osc.start(now);
    osc.stop(now + 0.32);
    noise.start(now);
    noise.stop(now + 0.26);
  }

  public playDoorThuds() {
    if (this.muted) return;
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
    if (this.muted) return;
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

  public playPhoneRing() {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const echo = this.getEchoBus();
    if (!ctx || !echo) return;

    const ringBursts = [0, 0.45];
    ringBursts.forEach((offset) => {
      const start = ctx.currentTime + offset;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.value = 1180;
      osc2.frequency.value = 1460;

      gain.gain.setValueAtTime(0.12, start);
      gain.gain.setValueAtTime(0.12, start + 0.28);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.34);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(echo);

      osc1.start(start);
      osc2.start(start);
      osc1.stop(start + 0.35);
      osc2.stop(start + 0.35);
    });
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
    if (this.muted) return;
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

  public startMaskBreathing() {
    if (this.muted) return;
    if (this.breathTimer !== null) return;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !this.noiseBuffer || !dry) return;

    const triggerBreath = () => {
      if (this.muted) return;
      const c = this.ensureContext();
      const d = this.getDryBus();
      if (!c || !this.noiseBuffer || !d) return;
      const now = c.currentTime;

      const noise = c.createBufferSource();
      noise.buffer = this.noiseBuffer;

      const filter = c.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(480, now);
      filter.frequency.linearRampToValueAtTime(760, now + 0.35);
      filter.frequency.linearRampToValueAtTime(360, now + 0.85);
      filter.Q.value = 2.4;

      const gain = c.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.25);
      gain.gain.linearRampToValueAtTime(0.02, now + 0.55);
      gain.gain.linearRampToValueAtTime(0.14, now + 0.72);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(d);
      noise.start(now);
      noise.stop(now + 1.2);
    };

    triggerBreath();
    this.breathTimer = window.setInterval(triggerBreath, 1450);
  }

  public stopMaskBreathing() {
    if (this.breathTimer !== null) {
      window.clearInterval(this.breathTimer);
      this.breathTimer = null;
    }
  }

  public playHallFlicker() {
    if (this.muted) return;
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

  public playJumpscare(
    killer: 'ton' | 'toso' | 'nita' | 'tis' = 'ton',
    source: 'door' | 'hallway' = 'door'
  ) {
    if (this.muted) return;
    const ctx = this.ensureContext();
    const dry = this.getDryBus();
    if (!ctx || !this.noiseBuffer || !dry) return;
    const now = ctx.currentTime;

    const baseProfiles: Record<'ton' | 'toso' | 'nita' | 'tis', number[]> = {
      ton: [195, 340, 610, 990],
      toso: [240, 445, 720, 1180],
      nita: [290, 520, 890, 1420],
      tis: [320, 610, 1040, 1640],
    };

    const freqs = baseProfiles[killer] || baseProfiles.ton;
    const pitchShift = source === 'hallway' ? 1.12 : 0.94;

    freqs.forEach((baseF, idx) => {
      const f = baseF * pitchShift;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(source === 'hallway' ? f * 0.78 : f * 1.08, now);
      osc.frequency.linearRampToValueAtTime(f * 1.4, now + 0.18);
      osc.frequency.linearRampToValueAtTime(f * 0.68, now + 1.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.setValueAtTime(0.18, now + 0.72);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.28);

      osc.connect(gain);
      gain.connect(dry);
      osc.start(now);
      osc.stop(now + 1.32);
    });

    if (source === 'door') {
      const impact = ctx.createOscillator();
      const impGain = ctx.createGain();
      impact.type = 'sine';
      impact.frequency.setValueAtTime(115, now);
      impact.frequency.exponentialRampToValueAtTime(28, now + 0.25);
      impGain.gain.setValueAtTime(0.42, now);
      impGain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
      impact.connect(impGain);
      impGain.connect(dry);
      impact.start(now);
      impact.stop(now + 0.28);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0.38, now);
    nGain.gain.exponentialRampToValueAtTime(0.001, now + 1.22);
    noise.connect(nGain);
    nGain.connect(dry);
    noise.start(now);
    noise.stop(now + 1.26);
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
}

export const soundEngine = new SoundEngine();
