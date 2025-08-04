export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isInitialized: boolean = false;
  private masterVolume: number = 0.5;

  constructor() {
    console.log("🎵 AudioManager constructor called");
  }

  public async initialize(): Promise<void> {
    console.log("🎵 Initializing Audio System...");

    try {
      // Create audio context
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      console.log("🎵 Audio context created, state:", this.audioContext.state);

      // Generate all sounds
      await this.generateAllSounds();

      this.isInitialized = true;
      console.log("✅ Audio system initialized successfully");

      return Promise.resolve();
    } catch (error) {
      console.error("❌ Audio initialization failed:", error);
      return Promise.reject(error);
    }
  }

  public async enableAudio(): Promise<void> {
    console.log("🎵 Enabling audio...");

    if (!this.audioContext) {
      console.warn("❌ Audio context not created");
      return;
    }

    console.log(
      "🎵 Audio context state before resume:",
      this.audioContext.state
    );

    if (this.audioContext.state === "suspended") {
      try {
        await this.audioContext.resume();
        console.log(
          "✅ Audio context resumed, new state:",
          this.audioContext.state
        );
      } catch (error) {
        console.error("❌ Failed to resume audio context:", error);
      }
    }

    // Test sound immediately
    setTimeout(() => {
      console.log("🎵 Playing test sound...");
      this.playSound("gunshot", 0.3);
    }, 200);
  }

  private async generateAllSounds(): Promise<void> {
    console.log("🎵 Generating all sounds...");

    if (!this.audioContext) {
      throw new Error("Audio context not available");
    }

    try {
      // Generate gunshot
      this.sounds.set("gunshot", this.generateGunshot());
      console.log("✅ Gunshot generated");

      // Generate reload
      this.sounds.set("reload", this.generateReload());
      console.log("✅ Reload generated");

      // Generate enemy hit
      this.sounds.set("enemyHit", this.generateHit());
      console.log("✅ Enemy hit generated");

      // Generate enemy death
      this.sounds.set("enemyDeath", this.generateDeath());
      console.log("✅ Enemy death generated");

      // Generate player damage
      this.sounds.set("playerDamage", this.generatePlayerDamage());
      console.log("✅ Player damage generated");

      // Generate footstep
      this.sounds.set("footstep", this.generateFootstep());
      console.log("✅ Footstep generated");

      // Generate ambient
      this.sounds.set("ambient", this.generateAmbient());
      console.log("✅ Ambient generated");

      // Generate low ammo
      this.sounds.set("lowAmmo", this.generateLowAmmo());
      console.log("✅ Low ammo generated");

      // Generate game over
      this.sounds.set("gameOver", this.generateGameOver());
      console.log("✅ Game over generated");

      console.log(`✅ All ${this.sounds.size} sounds generated successfully`);
    } catch (error) {
      console.error("❌ Error generating sounds:", error);
      throw error;
    }
  }

  private generateGunshot(): AudioBuffer {
    if (!this.audioContext) throw new Error("No audio context");

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.15;
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 20);

      // Sharp crack sound
      const crack = (Math.random() * 2 - 1) * envelope;
      const pop = Math.sin(2 * Math.PI * 200 * t) * envelope * 0.5;

      data[i] = (crack + pop) * 0.8;
    }

    return buffer;
  }

  private generateReload(): AudioBuffer {
    if (!this.audioContext) throw new Error("No audio context");

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.4;
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      let sound = 0;

      // Click at start
      if (t < 0.1) {
        sound = (Math.random() * 2 - 1) * Math.exp(-t * 30) * 0.6;
      }
      // Click at end
      else if (t > 0.3) {
        sound = (Math.random() * 2 - 1) * Math.exp(-(t - 0.3) * 25) * 0.5;
      }

      data[i] = sound;
    }

    return buffer;
  }

  private generateHit(): AudioBuffer {
    if (!this.audioContext) throw new Error("No audio context");

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.1;
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 25);
      const hit = (Math.random() * 2 - 1) * envelope * 0.7;
      data[i] = hit;
    }

    return buffer;
  }

  private generateDeath(): AudioBuffer {
    if (!this.audioContext) throw new Error("No audio context");

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.5;
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 4);
      const lowRumble = Math.sin(2 * Math.PI * 60 * t) * envelope * 0.6;
      data[i] = lowRumble;
    }

    return buffer;
  }

  private generatePlayerDamage(): AudioBuffer {
    if (!this.audioContext) throw new Error("No audio context");

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.3;
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 10);
      const heartbeat = Math.sin(2 * Math.PI * 80 * t) * envelope * 0.7;
      data[i] = heartbeat;
    }

    return buffer;
  }

  private generateFootstep(): AudioBuffer {
    if (!this.audioContext) throw new Error("No audio context");

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.08;
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 40);
      const step = (Math.random() * 2 - 1) * envelope * 0.4;
      data[i] = step;
    }

    return buffer;
  }

  private generateAmbient(): AudioBuffer {
    if (!this.audioContext) throw new Error("No audio context");

    const sampleRate = this.audioContext.sampleRate;
    const duration = 2.0; // Short loop
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const wind = Math.sin(2 * Math.PI * 0.2 * t) * 0.05;
      const ambient = (Math.random() * 2 - 1) * 0.02;
      data[i] = wind + ambient;
    }

    return buffer;
  }

  private generateLowAmmo(): AudioBuffer {
    if (!this.audioContext) throw new Error("No audio context");

    const sampleRate = this.audioContext.sampleRate;
    const duration = 0.2;
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const beep = Math.sin(2 * Math.PI * 1000 * t) * (t < 0.1 ? 0.5 : 0);
      data[i] = beep;
    }

    return buffer;
  }

  private generateGameOver(): AudioBuffer {
    if (!this.audioContext) throw new Error("No audio context");

    const sampleRate = this.audioContext.sampleRate;
    const duration = 1.0;
    const samples = Math.floor(sampleRate * duration);
    const buffer = this.audioContext.createBuffer(1, samples, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 2);
      const frequency = 300 * Math.exp(-t * 3);
      const tone = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.6;
      data[i] = tone;
    }

    return buffer;
  }

  public playSound(soundName: string, volume: number = 1.0): void {
    console.log(`🎵 Playing sound: ${soundName} at volume ${volume}`);

    if (!this.isInitialized || !this.audioContext) {
      console.warn("❌ Audio not initialized");
      return;
    }

    if (this.audioContext.state !== "running") {
      console.warn(
        "❌ Audio context not running, state:",
        this.audioContext.state
      );
      return;
    }

    const soundBuffer = this.sounds.get(soundName);
    if (!soundBuffer) {
      console.warn(`❌ Sound '${soundName}' not found`);
      console.log("Available sounds:", Array.from(this.sounds.keys()));
      return;
    }

    try {
      // Create source
      const source = this.audioContext.createBufferSource();
      source.buffer = soundBuffer;

      // Create gain for volume control
      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume * this.masterVolume;

      // Connect nodes
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Add event listeners
      source.onended = () => {
        console.log(`✅ Sound '${soundName}' finished playing`);
      };

      // Start playing
      source.start(0);
      console.log(`🔊 Started playing '${soundName}'`);
    } catch (error) {
      console.error(`❌ Error playing sound '${soundName}':`, error);
    }
  }

  public playSoundWithRandomization(
    soundName: string,
    pitchVariation: number = 0.2,
    volume: number = 1.0
  ): void {
    console.log(`🎵 Playing '${soundName}' with randomization`);

    if (!this.isInitialized || !this.audioContext) {
      console.warn("❌ Audio not initialized");
      return;
    }

    const soundBuffer = this.sounds.get(soundName);
    if (!soundBuffer) {
      console.warn(`❌ Sound '${soundName}' not found`);
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = soundBuffer;

      // Add pitch variation
      const randomRate = 1.0 + (Math.random() - 0.5) * pitchVariation;
      source.playbackRate.value = randomRate;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = volume * this.masterVolume;

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start(0);
      console.log(
        `🔊 Playing '${soundName}' with rate ${randomRate.toFixed(2)}`
      );
    } catch (error) {
      console.error(`❌ Error playing randomized sound '${soundName}':`, error);
    }
  }

  private ambientSource: AudioBufferSourceNode | null = null;

  public startAmbient(): void {
    console.log("🌊 Starting ambient audio");

    if (!this.isInitialized || !this.audioContext) {
      console.warn("❌ Audio not initialized for ambient");
      return;
    }

    const ambientBuffer = this.sounds.get("ambient");
    if (!ambientBuffer) {
      console.warn("❌ Ambient sound not found");
      return;
    }

    try {
      // Stop existing ambient if playing
      if (this.ambientSource) {
        this.ambientSource.stop();
      }

      this.ambientSource = this.audioContext.createBufferSource();
      this.ambientSource.buffer = ambientBuffer;
      this.ambientSource.loop = true;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.value = 0.1 * this.masterVolume;

      this.ambientSource.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      this.ambientSource.start(0);
      console.log("✅ Ambient audio started");
    } catch (error) {
      console.error("❌ Error starting ambient audio:", error);
    }
  }

  public stopAmbient(): void {
    console.log("🔇 Stopping ambient audio");
    if (this.ambientSource) {
      try {
        this.ambientSource.stop();
        this.ambientSource = null;
        console.log("✅ Ambient audio stopped");
      } catch (error) {
        console.error("❌ Error stopping ambient:", error);
      }
    }
  }

  public stopSound(soundName: string): void {
    // For non-looping sounds, they stop automatically
    console.log(`🔇 Stop sound called for: ${soundName}`);
  }

  public setSFXVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    console.log("🔊 Master volume set to:", this.masterVolume);
  }

  public setMusicVolume(volume: number): void {
    // Alias for setSFXVolume
    this.setSFXVolume(volume);
  }

  public cleanup(): void {
    console.log("🧹 Cleaning up audio manager");

    this.stopAmbient();
    this.sounds.clear();

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

    this.isInitialized = false;
  }
}
