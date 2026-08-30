// Advanced Web Audio API Diesel Locomotive & Environmental Sound Synthesizer
// Modeled after Sri Lankan Railways Class M2 / S13 / M4 Diesel Engines

class TrainAudioSynthesizer {
  private ctx: AudioContext | null = null;
  
  // Diesel Engine Synthesizer Nodes
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;
  private idleOsc1: OscillatorNode | null = null;
  private idleOsc2: OscillatorNode | null = null;
  private subBassOsc: OscillatorNode | null = null;
  private turboOsc: OscillatorNode | null = null;
  private turboGain: GainNode | null = null;
  private tractionHumOsc: OscillatorNode | null = null;
  private tractionGain: GainNode | null = null;
  
  // Track Joint & Mechanical State
  private lastClackTime: number = 0;
  private isMuted: boolean = false;
  private currentEngineRPM: number = 42; // Interpolated RPM for realistic spool-up inertia

  constructor() {
    // Lazy initialized on first user interaction
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
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(muted ? 0 : 0.28, this.ctx.currentTime, 0.1);
    }
  }

  private setupEngineLoop() {
    if (!this.ctx) return;

    try {
      const t = this.ctx.currentTime;
      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.setValueAtTime(0.001, t);

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.setValueAtTime(220, t);
      this.engineFilter.Q.setValueAtTime(1.5, t);

      // Primary Cylinder Churn (Sawtooth for mechanical diesel combustion)
      this.idleOsc1 = this.ctx.createOscillator();
      this.idleOsc1.type = 'sawtooth';
      this.idleOsc1.frequency.setValueAtTime(42, t);

      // Secondary Harmonic (Triangle for crankshaft resonance)
      this.idleOsc2 = this.ctx.createOscillator();
      this.idleOsc2.type = 'triangle';
      this.idleOsc2.frequency.setValueAtTime(84, t);

      // Deep Sub-bass Thump (Sine wave pulse)
      this.subBassOsc = this.ctx.createOscillator();
      this.subBassOsc.type = 'sine';
      this.subBassOsc.frequency.setValueAtTime(28, t);

      // Turbocharger Whine (High frequency sine that revs with throttle)
      this.turboOsc = this.ctx.createOscillator();
      this.turboOsc.type = 'sine';
      this.turboOsc.frequency.setValueAtTime(480, t);

      this.turboGain = this.ctx.createGain();
      this.turboGain.gain.setValueAtTime(0.001, t);
      this.turboOsc.connect(this.turboGain);
      this.turboGain.connect(this.engineGain);

      // Electric Traction Motor Inverter Hum (Increases with speed)
      this.tractionHumOsc = this.ctx.createOscillator();
      this.tractionHumOsc.type = 'triangle';
      this.tractionHumOsc.frequency.setValueAtTime(120, t);

      this.tractionGain = this.ctx.createGain();
      this.tractionGain.gain.setValueAtTime(0.001, t);
      this.tractionHumOsc.connect(this.tractionGain);
      this.tractionGain.connect(this.engineGain);

      // Connect diesel oscillators to lowpass filter
      this.idleOsc1.connect(this.engineFilter);
      this.idleOsc2.connect(this.engineFilter);
      this.subBassOsc.connect(this.engineFilter);

      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.idleOsc1.start();
      this.idleOsc2.start();
      this.subBassOsc.start();
      this.turboOsc.start();
      this.tractionHumOsc.start();
    } catch (e) {
      console.warn("Engine audio synth initialization note:", e);
    }
  }

  // Dynamic Engine Audio based on speed, throttle notch, and load
  public updateEngineSound(speedKmh: number, throttle: number, isMoving: boolean) {
    this.initContext();
    if (!this.ctx || !this.engineGain || !this.idleOsc1 || !this.idleOsc2 || !this.engineFilter || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notchRatio = throttle / 100; // 0.0 to 1.0

    // Engine RPM target: Idle is 40Hz, Notch 8 full power is 92Hz
    const targetRPM = 40 + (notchRatio * 46) + (Math.min(speedKmh, 120) * 0.12);
    // Natural spool-up inertia (smoothly approach target)
    this.currentEngineRPM += (targetRPM - this.currentEngineRPM) * 0.08;

    const baseFreq = this.currentEngineRPM;
    this.idleOsc1.frequency.setTargetAtTime(baseFreq, t, 0.15);
    this.idleOsc2.frequency.setTargetAtTime(baseFreq * 2.01, t, 0.15);
    if (this.subBassOsc) {
      this.subBassOsc.frequency.setTargetAtTime(baseFreq * 0.5, t, 0.15);
    }

    // Filter frequency opens up with throttle (muffled at idle, loud throat roar at full throttle)
    const filterFreq = 180 + (notchRatio * 650) + (speedKmh * 2.5);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, t, 0.2);

    // Turbo Whine Sound
    if (this.turboOsc && this.turboGain) {
      const turboFreq = 420 + (notchRatio * 900) + (speedKmh * 4.0);
      const turboVol = notchRatio > 0.1 ? Math.min(0.12, (notchRatio - 0.1) * 0.14) : 0.001;
      this.turboOsc.frequency.setTargetAtTime(turboFreq, t, 0.25);
      this.turboGain.gain.setTargetAtTime(turboVol, t, 0.2);
    }

    // Traction Motor Inverter Hum
    if (this.tractionHumOsc && this.tractionGain) {
      const tractionFreq = 80 + (speedKmh * 8.5);
      const tractionVol = isMoving ? Math.min(0.08, (speedKmh / 100) * 0.08) : 0.001;
      this.tractionHumOsc.frequency.setTargetAtTime(tractionFreq, t, 0.1);
      this.tractionGain.gain.setTargetAtTime(tractionVol, t, 0.1);
    }

    // Master Engine Volume
    const masterVol = isMoving || throttle > 0
      ? Math.min(0.32, 0.12 + (notchRatio * 0.14) + ((speedKmh / 120) * 0.08))
      : 0.08; // Gentle idle rumble when stopped
    this.engineGain.gain.setTargetAtTime(masterVol, t, 0.15);

    // Dynamic Track-Joint Rhythmic Wheel Clicking
    if (speedKmh > 6) {
      // Real track joints are spaced ~18-25 meters apart: frequency = speed / distance
      // Higher speed = shorter interval
      const intervalMs = Math.max(160, 2200 - (speedKmh * 17.5));
      const now = performance.now();
      if (now - this.lastClackTime > intervalMs) {
        this.playTrackClack(speedKmh);
        this.lastClackTime = now;
      }
    }
  }

  // Realistic Dual Rail Axle Clack "ka-tack... ka-tack"
  public playTrackClack(speedKmh: number) {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const vol = Math.min(0.26, 0.05 + (speedKmh / 120) * 0.21);
      
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.06);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      // First axle strike
      const noise1 = this.ctx.createBufferSource();
      noise1.buffer = buffer;
      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(520 + Math.random() * 80, t);
      filter1.Q.setValueAtTime(2.0, t);

      const gain1 = this.ctx.createGain();
      gain1.gain.setValueAtTime(vol, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      noise1.connect(filter1);
      filter1.connect(gain1);
      gain1.connect(this.ctx.destination);
      noise1.start(t);

      // Second axle strike (spaced closely ~55ms behind leading axle)
      const noise2 = this.ctx.createBufferSource();
      noise2.buffer = buffer;
      const gain2 = this.ctx.createGain();
      gain2.gain.setValueAtTime(vol * 0.8, t + 0.055);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

      noise2.connect(filter1);
      gain2.connect(this.ctx.destination);
      noise2.start(t + 0.055);
    } catch (e) {}
  }

  // Sri Lankan Railway Dual Horn
  public playHorn(hornType: 'dual_tone' | 'deep_diesel' | 'express_chime' = 'deep_diesel') {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const osc3 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Deep Diesel Horn (Classic Canadian G12 / MLW M4 Leslie RS-3L Horn Chord)
      let f1 = 262; // C4
      let f2 = 330; // E4
      let f3 = 392; // G4

      if (hornType === 'dual_tone') {
        f1 = 370; // F#4
        f2 = 465; // A#4
        f3 = 554; // C#5
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

      // Acoustic Doppler/Air resonance wobble
      osc1.frequency.linearRampToValueAtTime(f1 * 1.015, t + 0.5);
      osc2.frequency.linearRampToValueAtTime(f2 * 1.015, t + 0.5);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, t);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.42, t + 0.04);
      gain.gain.setValueAtTime(0.42, t + 1.25);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.85);

      osc1.start(t);
      osc2.start(t);
      osc3.start(t);

      osc1.stop(t + 1.9);
      osc2.stop(t + 1.9);
      osc3.stop(t + 1.9);
    } catch (e) {}
  }

  // Air Brake Release Hiss
  public playBrakeRelease() {
    this.initContext();
    if (!this.ctx || this.isMuted) return;

    try {
      const t = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.85);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      whiteNoise.start(t);
    } catch (e) {}
  }

  // Brake Squeal (Frictional metal squeal when stopping)
  public playBrakeSqueal(speedKmh: number) {
    this.initContext();
    if (!this.ctx || this.isMuted || speedKmh < 2 || speedKmh > 32) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(2300 + Math.random() * 400, t);
      osc.frequency.linearRampToValueAtTime(1750, t + 0.5);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.55);
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

      gain.gain.setValueAtTime(0.28, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.95);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 1.0);
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
        // G5 -> E5 Major third
        osc1.frequency.setValueAtTime(784, t);
        osc2.frequency.setValueAtTime(659, t + 0.25);
      } else {
        // Warning 3-beeps
        osc1.frequency.setValueAtTime(880, t);
        osc2.frequency.setValueAtTime(880, t + 0.25);
      }

      gain1.gain.setValueAtTime(0.22, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      gain2.gain.setValueAtTime(0.22, t + 0.25);
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
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (Ascending Arpeggio)
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.18);
        gain.gain.setValueAtTime(0.2, t + idx * 0.18);
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
      osc.frequency.setValueAtTime(1050, t);

      gain.gain.setValueAtTime(0.18, t);
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
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.35);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.25;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2600, t);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      noise.start(t);
    } catch (e) {}
  }
}

export const trainAudio = new TrainAudioSynthesizer();
