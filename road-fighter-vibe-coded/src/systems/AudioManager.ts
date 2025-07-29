import { AUDIO_CONFIG, GAME_CONFIG } from "../utils/Constants";

export class AudioManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private engineGain: GainNode | null = null;

  // V12 Engine sound components
  private engineOscillators: OscillatorNode[] = [];
  private engineFilters: BiquadFilterNode[] = [];
  private engineGains: GainNode[] = [];
  private isEngineRunning: boolean = false;

  // Remove background music properties - we don't need them anymore
  private isEnabled: boolean = GAME_CONFIG.ENABLE_AUDIO;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      // Create master gain node
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = AUDIO_CONFIG.MASTER_VOLUME;
      this.masterGain.connect(this.audioContext.destination);

      // Create separate gain nodes for different audio types
      this.sfxGain = this.audioContext.createGain();
      this.sfxGain.gain.value = AUDIO_CONFIG.SFX_VOLUME;
      this.sfxGain.connect(this.masterGain);

      this.engineGain = this.audioContext.createGain();
      this.engineGain.gain.value = AUDIO_CONFIG.ENGINE_VOLUME * 1.5; // Boost engine volume
      this.engineGain.connect(this.masterGain);

      console.log("🔊 Audio Manager initialized successfully");
    } catch (error) {
      console.error("Failed to initialize audio:", error);
      this.isEnabled = false;
    }
  }

  // Resume audio context (required by browsers after user interaction)
  public async resumeAudio(): Promise<void> {
    if (!this.audioContext || !this.isEnabled) return;

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
      console.log("🔊 Audio context resumed");
    }
  }

  // V12 ENGINE SOUNDS - Multiple oscillators for realistic V12 rumble
  public startEngineSound(): void {
    if (
      !this.audioContext ||
      !this.engineGain ||
      !GAME_CONFIG.ENABLE_ENGINE_SOUND ||
      this.isEngineRunning
    )
      return;

    try {
      // Create multiple oscillators to simulate V12 engine cylinders
      const engineFrequencies = [
        80, // Deep bass rumble
        120, // Low-mid engine growl
        180, // Mid-range engine note
        240, // Higher engine harmonic
        90, // Slightly detuned bass for richness
        135, // Mid-low harmonic
      ];

      const oscillatorTypes: OscillatorType[] = [
        "sawtooth",
        "square",
        "sawtooth",
        "triangle",
        "sawtooth",
        "square",
      ];
      const volumes = [0.8, 0.6, 0.4, 0.3, 0.5, 0.4]; // Different volumes for each component

      engineFrequencies.forEach((freq, index) => {
        // Create oscillator
        const oscillator = this.audioContext!.createOscillator();
        const filter = this.audioContext!.createBiquadFilter();
        const gain = this.audioContext!.createGain();

        // Setup oscillator with slight randomization for organic feel
        oscillator.type = oscillatorTypes[index];
        oscillator.frequency.value = freq + (Math.random() - 0.5) * 5; // Slight detuning

        // Setup low pass filter for muffled, realistic engine sound
        filter.type = "lowpass";
        filter.frequency.value = 300 + index * 50; // Different filter frequencies
        filter.Q.value = 2 + index * 0.5;

        // Setup gain
        gain.gain.value = volumes[index] * 0.3; // Start quiet

        // Connect: oscillator -> filter -> gain -> engine gain -> master
        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(this.engineGain);

        // Add slight frequency modulation for engine "burble"
        const lfo = this.audioContext!.createOscillator();
        const lfoGain = this.audioContext!.createGain();
        lfo.frequency.value = 8 + index * 2; // Different LFO rates
        lfoGain.gain.value = 2 + index; // Modulation depth

        lfo.connect(lfoGain);
        lfoGain.connect(oscillator.frequency);

        oscillator.start();
        lfo.start();

        // Store references
        this.engineOscillators.push(oscillator);
        this.engineFilters.push(filter);
        this.engineGains.push(gain);
      });

      this.isEngineRunning = true;
      console.log("🏎️ V12 Engine sound started - ROAAAAR!");
    } catch (error) {
      console.error("Failed to start V12 engine sound:", error);
    }
  }

  public updateEngineSound(speed: number): void {
    if (
      this.engineOscillators.length === 0 ||
      !this.isEngineRunning ||
      !this.audioContext
    )
      return;

    // Map speed to engine characteristics
    const normalizedSpeed = Math.max(
      0,
      Math.min(
        1.2, // Allow over-rev for excitement
        (speed - AUDIO_CONFIG.ENGINE_MIN_SPEED) /
          (AUDIO_CONFIG.ENGINE_MAX_SPEED - AUDIO_CONFIG.ENGINE_MIN_SPEED)
      )
    );

    const currentTime = this.audioContext.currentTime;

    this.engineOscillators.forEach((oscillator, index) => {
      if (!oscillator) return;

      // Base frequencies for each engine component
      const baseFreqs = [80, 120, 180, 240, 90, 135];
      const speedMultiplier = 1 + normalizedSpeed * 2.5; // More dramatic frequency change

      // Calculate new frequency with some randomization for engine irregularity
      const targetFreq =
        baseFreqs[index] * speedMultiplier +
        Math.sin(currentTime * 10 + index) * 3;

      // Smooth frequency changes
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(20, targetFreq), // Prevent frequency going too low
        currentTime + 0.1
      );
    });

    // Update filter frequencies for more aggressive sound at high speeds
    this.engineFilters.forEach((filter, index) => {
      if (!filter) return;

      const baseFilterFreq = 300 + index * 50;
      const filterMultiplier = 1 + normalizedSpeed * 3; // Open up filters at high speed
      const targetFilterFreq = baseFilterFreq * filterMultiplier;

      filter.frequency.exponentialRampToValueAtTime(
        Math.min(8000, targetFilterFreq), // Cap filter frequency
        currentTime + 0.1
      );
    });

    // Update volumes - engine gets louder at higher speeds
    this.engineGains.forEach((gain, index) => {
      if (!gain) return;

      const baseVolumes = [0.8, 0.6, 0.4, 0.3, 0.5, 0.4];
      const volumeMultiplier = 0.3 + normalizedSpeed * 0.7; // Range from 0.3 to 1.0
      const targetVolume = baseVolumes[index] * volumeMultiplier;

      gain.gain.exponentialRampToValueAtTime(
        Math.max(0.01, targetVolume),
        currentTime + 0.05
      );
    });
  }

  public stopEngineSound(): void {
    if (this.engineOscillators.length > 0 && this.isEngineRunning) {
      try {
        this.engineOscillators.forEach((oscillator) => {
          if (oscillator) {
            oscillator.stop();
          }
        });

        this.engineOscillators = [];
        this.engineFilters = [];
        this.engineGains = [];
        this.isEngineRunning = false;
        console.log("🏎️ V12 Engine sound stopped");
      } catch (error) {
        console.error("Failed to stop V12 engine sound:", error);
      }
    }
  }

  // Remove all background music methods - we don't need them anymore!

  // ENHANCED SOUND EFFECTS
  public playCollisionSound(): void {
    // More dramatic collision sound
    this.playExplosiveSound(120, 0.8, 1.5);

    // Add metallic crash sound
    setTimeout(() => {
      this.playMetallicCrash();
    }, 100);
  }

  public playExplosionSound(): void {
    this.playExplosiveSound(60, 1.0, 3.0);
  }

  private playMetallicCrash(): void {
    if (!this.audioContext || !this.sfxGain) return;

    try {
      // Create metallic crash using filtered noise and sine waves
      const crashFrequencies = [800, 1200, 1800, 2400];

      crashFrequencies.forEach((freq, index) => {
        const oscillator = this.audioContext!.createOscillator();
        const gain = this.audioContext!.createGain();
        const filter = this.audioContext!.createBiquadFilter();

        oscillator.type = "square";
        oscillator.frequency.value = freq;

        filter.type = "bandpass";
        filter.frequency.value = freq;
        filter.Q.value = 5;

        const volume = 0.3 - index * 0.05;
        gain.gain.setValueAtTime(volume, this.audioContext!.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          this.audioContext!.currentTime + 0.8
        );

        oscillator.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        oscillator.start();
        oscillator.stop(this.audioContext!.currentTime + 0.8);
      });
    } catch (error) {
      console.error("Failed to play metallic crash:", error);
    }
  }

  public playCheckpointSound(): void {
    this.playMelodic([440, 554, 659], 0.3, 0.4); // A-C#-E chord - louder
  }

  public playPowerUpSound(): void {
    this.playMelodic([523, 659, 784, 1047], 0.2, 0.5); // C-E-G-C ascending - louder
  }

  public playLevelCompleteSound(): void {
    this.playMelodic([523, 659, 784, 1047, 1319], 0.4, 0.6); // Victory fanfare - louder
  }

  public playVictorySound(): void {
    this.playMelodic([523, 659, 784, 1047, 1319, 1568], 0.5, 0.8); // Grand victory - much louder
  }

  public playGameOverSound(): void {
    this.playMelodic([330, 294, 262, 220], 0.8, 0.6); // Descending sad melody - louder
  }

  // Add engine rev sound for power-ups
  public playEngineRevSound(): void {
    if (!this.audioContext || !this.sfxGain) return;

    try {
      const revOscillator = this.audioContext.createOscillator();
      const revGain = this.audioContext.createGain();
      const revFilter = this.audioContext.createBiquadFilter();

      revOscillator.type = "sawtooth";
      revOscillator.frequency.setValueAtTime(
        150,
        this.audioContext.currentTime
      );
      revOscillator.frequency.exponentialRampToValueAtTime(
        400,
        this.audioContext.currentTime + 0.5
      );

      revFilter.type = "lowpass";
      revFilter.frequency.value = 1000;
      revFilter.Q.value = 2;

      revGain.gain.setValueAtTime(0.6, this.audioContext.currentTime);
      revGain.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + 0.8
      );

      revOscillator.connect(revFilter);
      revFilter.connect(revGain);
      revGain.connect(this.sfxGain);

      revOscillator.start();
      revOscillator.stop(this.audioContext.currentTime + 0.8);
    } catch (error) {
      console.error("Failed to play engine rev sound:", error);
    }
  }

  private playExplosiveSound(
    baseFreq: number,
    volume: number,
    duration: number
  ): void {
    if (!this.audioContext || !this.sfxGain) return;

    try {
      // Create more dramatic explosion with multiple layers
      const noiseBuffer = this.audioContext.createBuffer(
        1,
        this.audioContext.sampleRate * duration,
        this.audioContext.sampleRate
      );
      const noiseData = noiseBuffer.getChannelData(0);

      // Generate more intense white noise
      for (let i = 0; i < noiseData.length; i++) {
        noiseData[i] =
          (Math.random() * 2 - 1) * volume * (1 - i / noiseData.length); // Fade out
      }

      const noiseSource = this.audioContext.createBufferSource();
      noiseSource.buffer = noiseBuffer;

      // Add multiple filters for richer explosion sound
      const lowPassFilter = this.audioContext.createBiquadFilter();
      lowPassFilter.type = "lowpass";
      lowPassFilter.frequency.value = baseFreq;
      lowPassFilter.Q.value = 2;

      const highPassFilter = this.audioContext.createBiquadFilter();
      highPassFilter.type = "highpass";
      highPassFilter.frequency.value = 30;

      // Add gain envelope
      const gain = this.audioContext.createGain();
      gain.gain.setValueAtTime(volume, this.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        this.audioContext.currentTime + duration
      );

      // Connect chain
      noiseSource.connect(highPassFilter);
      highPassFilter.connect(lowPassFilter);
      lowPassFilter.connect(gain);
      gain.connect(this.sfxGain);

      noiseSource.start();
      noiseSource.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.error("Failed to play explosive sound:", error);
    }
  }

  private playMelodic(
    frequencies: number[],
    noteDuration: number,
    volume: number
  ): void {
    if (!this.audioContext || !this.sfxGain) return;

    frequencies.forEach((freq, index) => {
      try {
        const oscillator = this.audioContext!.createOscillator();
        const gain = this.audioContext!.createGain();

        oscillator.type = "sine";
        oscillator.frequency.value = freq;

        // Envelope for musical note
        gain.gain.setValueAtTime(
          0,
          this.audioContext!.currentTime + index * noteDuration
        );
        gain.gain.linearRampToValueAtTime(
          volume,
          this.audioContext!.currentTime + index * noteDuration + 0.02
        );
        gain.gain.exponentialRampToValueAtTime(
          0.01,
          this.audioContext!.currentTime + (index + 1) * noteDuration
        );

        oscillator.connect(gain);
        gain.connect(this.sfxGain!);

        oscillator.start(this.audioContext!.currentTime + index * noteDuration);
        oscillator.stop(
          this.audioContext!.currentTime + (index + 1) * noteDuration
        );
      } catch (error) {
        console.error("Failed to play melodic note:", error);
      }
    });
  }

  // Volume controls
  public setMasterVolume(volume: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  public setSFXVolume(volume: number): void {
    if (this.sfxGain) {
      this.sfxGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  public setEngineVolume(volume: number): void {
    if (this.engineGain) {
      this.engineGain.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  // Cleanup
  public destroy(): void {
    this.stopEngineSound();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    console.log("🔊 Audio Manager destroyed");
  }
}
