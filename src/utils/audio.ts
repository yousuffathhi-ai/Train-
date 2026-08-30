class TrainAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private engineGain: GainNode | null = null;
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineSubOsc: OscillatorNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  
  private trackGain: GainNode | null = null;
  private trackInterval: any = null;
  
  private rainGain: GainNode | null = null;
  private rainSource: AudioBufferSourceNode | null = null;
  
  private isMuted: boolean = false;
  private lastClackTime: number = 0;

  constructor() {
    // Lazy initialize on first interaction
  }

  public async init() {
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.setupEngineLoop();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.engineGain) {
      this.engineGain.gain.setValueAtTime(muted ? 0 : 0.25, this.ctx?.currentTime || 0);
    }
  }

  private setupEngineLoop() {
    if (!this.ctx) return;

    try {
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.001, this.ctx.currentTime);

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(250, this.ctx.currentTime);

      // Low frequency diesel rumble
      this.engineOsc1 = this.ctx.createOscillator();
      this.engineOsc1.type = 'sawtooth';
      this.engineOsc1.frequency.setValueAtTime(45, this.ctx.currentTime);

      // Secondary engine harmonic
      this.engineOsc2 = this.ctx.createOscillator();
      this.engineOsc2.type = 'triangle';
      this.engineOsc2.frequency.setValueAtTime(90, this.ctx.currentTime);

      // Deep sub-bass pulse
      this.engineSubOsc = this.ctx.createOscillator();
      this.engineSubOsc.type = 'sine';
      this.engineSubOsc.frequency.setValueAtTime(30, this.ctx.currentTime);

      this.engineOsc1.connect(this.engineFilter);
      this.engineOsc2.connect(this.engineFilter);
      this.engineSubOsc.connect(this.engineFilter);

      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc1.start();
      this.engineOsc2.start();
      this.engineSubOsc.start();
    } catch (e) {
      console.warn("Audio initialization warning:", e);
    }
  }

  // Update dynamic engine sound based on throttle & speed
  public updateEngineSound(speedKmh: number, throttle: number, isMoving: boolean) {
    this.initContext();
    if (!this.ctx || !this.engineGain || !this.engineOsc1 || !this.engineOsc2 || !this.engineFilter || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Base frequency increases with throttle notch and speed
    const targetFreq = 42 + (throttle * 0.45) + (speedKmh * 0.35);
    const targetFilterFreq = 200 + (throttle * 4.5) + (speedKmh * 3.0);
    const targetVolume = isMoving || throttle > 0 ? Math.min(0.28, 0.08 + (throttle * 0.0015) + (speedKmh * 0.001)) : 0.05;

    this.engineOsc1.frequency.setTargetAtTime(targetFreq, t, 0.2);
    this.engineOsc2.frequency.setTargetAtTime(targetFreq * 2.02, t, 0.2);
    if (this.engineSubOsc) {
      this.engineSubOsc.frequency.setTargetAtTime(targetFreq * 0.5, t, 0.2);
    }
    this.engineFilter.frequency.setTargetAtTime(targetFilterFreq, t, 0.3);
    this.engineGain.gain.setTargetAtTime(targetVolume, t, 0.2);

    // Track joint clatter
    if (speedKmh > 10) {
      const intervalMs = Math.max(200, 1800 - (speedKmh * 12));
      const now = performance.now();
      if (now - this.lastClackTime > intervalMs) {
        this.playTrackClack(speedKmh);
        this.lastClackTime = now;
      }
    }
  }

  // Play realistic dual rail clack "ka-tack... ka-tack"
  public playTrackClack(speedKmh: number) {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const vol = Math.min(0.22, (speedKmh / 120) * 0.22);
      
      const bufferSize = this.ctx.sampleRate * 0.05;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }

      // First axle clack
      const noise1 = this.ctx.createBufferSource();
      noise1.buffer = buffer;
      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(500, t);
      const gain1 = this.ctx.createGain();
      gain1.gain.setValueAtTime(vol, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      noise1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(this.ctx.destination);
      noise1.start(t);

      // Second axle clack after 60ms
      const noise2 = this.ctx.createBufferSource();
      noise2.buffer = buffer;
      const gain2 = this.ctx.createGain();
      gain2.gain.setValueAtTime(vol * 0.75, t + 0.06);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

      noise2.connect(filter1);
      gain2.connect(this.ctx.destination);
      noise2.start(t + 0.06);
    } catch (e) {}
  }

  // Sri Lankan Railway Dual Horn
  public playHorn(hornType: 'dual_tone' | 'deep_diesel' | 'express_chime' = 'dual_tone') {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      let f1 = 370; // F#4
      let f2 = 465; // A#4
      let f3 = 554; // C#5

      if (hornType === 'deep_diesel') {
        f1 = 220; // A3
        f2 = 293; // D4
        f3 = 349; // F4
      } else if (hornType === 'express_chime') {
        f1 = 440; // A4
        f2 = 554; // C#5
        f3 = 659; // E5
      }

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc3.type = 'triangle';

      osc1.frequency.setValueAtTime(f1, t);
      osc2.frequency.setValueAtTime(f2, t);
      osc3.frequency.setValueAtTime(f3, t);

      // Slight vibrato / air variation
      osc1.frequency.linearRampToValueAtTime(f1 * 1.01, t + 0.4);
      osc2.frequency.linearRampToValueAtTime(f2 * 1.01, t + 0.4);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2200, t);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.05);
      gain.gain.setValueAtTime(0.35, t + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

      osc1.start(t);
      osc2.start(t);
      osc3.start(t);

      osc1.stop(t + 1.85);
      osc2.stop(t + 1.85);
      osc3.stop(t + 1.85);
    } catch (e) {}
  }

  // Air Brake Release Hiss
  public playBrakeRelease() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.8;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1400, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(t);
    } catch (e) {}
  }

  // Brake Squeal (Frictional metal squeal when stopping)
  public playBrakeSqueal(speedKmh: number) {
    this.initContext();
    if (!this.ctx || this.isMuted || speedKmh < 3 || speedKmh > 35) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400 + Math.random() * 400, t);
      osc.frequency.linearRampToValueAtTime(1800, t + 0.5);

      gain.gain.setValueAtTime(0.05, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.6);
    } catch (e) {}
  }

  // AWS Clear Signal Bell (Ding for Green aspect)
  public playAwsBell() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1320, t); // E6 bell

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.95);
    } catch (e) {}
  }

  // AWS Caution / Warning Buzzer (for Yellow / Red aspects)
  public playAwsWarningHorn() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(820, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.setValueAtTime(0.25, t + 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.85);
    } catch (e) {}
  }

  // Station Door Chime (Door opening / closing ding-dong)
  public playDoorChime(isOpen: boolean) {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      const gain2 = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';

      if (isOpen) {
        // High to low: G5 -> E5
        osc1.frequency.setValueAtTime(784, t);
        osc2.frequency.setValueAtTime(659, t + 0.25);
      } else {
        // Warning 3-beeps: C5, C5, C5
        osc1.frequency.setValueAtTime(880, t);
        osc2.frequency.setValueAtTime(880, t + 0.25);
      }

      gain1.gain.setValueAtTime(0.2, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      gain2.gain.setValueAtTime(0.2, t + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);
      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc1.start(t);
      osc1.stop(t + 0.4);
      osc2.start(t + 0.25);
      osc2.stop(t + 0.7);
    } catch (e) {}
  }

  // Station Arrival Chime
  public playStationArrivalChime() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C, E, G, C (Major chime)
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.18);
        gain.gain.setValueAtTime(0.18, t + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.18 + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(t + idx * 0.18);
        osc.stop(t + idx * 0.18 + 0.65);
      });
    } catch (e) {}
  }

  // Deadman Vigilance Buzzer
  public playVigilanceAlert() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(1100, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.22);
    } catch (e) {}
  }

  // Sander Air Hiss
  public playSanderHiss() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.3;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.2;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2800, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
    } catch (e) {}
  }
}

export const trainAudio = new TrainAudioSynthesizer();
