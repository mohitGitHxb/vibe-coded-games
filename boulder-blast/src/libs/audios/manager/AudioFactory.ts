import * as THREE from "three";
import type { SoundType } from "../types/AudioTypes.js";
import { SoundType as ST } from "../types/AudioTypes.js";

/**
 * Audio Factory for loading real audio files and synthetic sound generation
 */
export class AudioFactory {
  private audioListener: THREE.AudioListener;
  private audioLoader: THREE.AudioLoader;

  constructor(audioListener: THREE.AudioListener) {
    this.audioListener = audioListener;
    this.audioLoader = new THREE.AudioLoader();
  }

  /**
   * Create audio sounds - uses real audio files where available, synthetic otherwise
   */
  async createSound(
    soundType: SoundType
  ): Promise<THREE.Audio<GainNode> | null> {
    try {
      const sound = new THREE.Audio(this.audioListener);

      // Try to load real audio file first, fall back to synthetic
      const audioBuffer = await this.loadRealOrSyntheticAudio(soundType);
      if (audioBuffer) {
        sound.setBuffer(audioBuffer);
        return sound;
      }

      return null;
    } catch (error) {
      console.error(`Failed to create sound ${soundType}:`, error);
      return null;
    }
  }

  /**
   * Load real audio file or create synthetic sound as fallback
   */
  private async loadRealOrSyntheticAudio(
    soundType: SoundType
  ): Promise<AudioBuffer | null> {
    // Map sound types to audio file paths
    const audioFiles: Partial<Record<SoundType, string>> = {
      [ST.LaserShot]: "/audio/laser.mp3",
      [ST.Explosion]: "/audio/explosion.mp3",
      [ST.BackgroundMusic]: "/audio/background.mp3",
    };

    const audioFile = audioFiles[soundType];

    if (audioFile) {
      try {
        console.log(`🔄 Attempting to load ${soundType} from ${audioFile}...`);

        // Try to load the real audio file
        return await new Promise<AudioBuffer>((resolve, reject) => {
          this.audioLoader.load(
            audioFile,
            (buffer) => {
              console.log(
                `🔊 Successfully loaded real audio: ${soundType} from ${audioFile} (Duration: ${buffer.duration.toFixed(
                  2
                )}s)`
              );
              resolve(buffer);
            },
            (progress) => {
              // Progress callback
              if (progress.lengthComputable) {
                const percentComplete =
                  (progress.loaded / progress.total) * 100;
                console.log(
                  `📈 Loading ${soundType}: ${percentComplete.toFixed(1)}%`
                );
              }
            },
            (error) => {
              console.error(
                `❌ Failed to load ${audioFile} for ${soundType}:`,
                error
              );
              console.warn(
                `⚠️ Falling back to synthetic sound for ${soundType}`
              );
              reject(error);
            }
          );
        });
      } catch (error) {
        console.warn(
          `⚠️ Real audio loading failed for ${soundType}, using synthetic fallback:`,
          error
        );
        return this.createSyntheticSound(soundType);
      }
    }

    // Use synthetic sound for types without real audio files
    return this.createSyntheticSound(soundType);
  }

  /**
   * Create synthetic audio buffer for different sound types (fallback or primary)
   */
  private createSyntheticSound(soundType: SoundType): AudioBuffer | null {
    const audioContext = THREE.AudioContext.getContext();
    if (!audioContext) return null;

    let duration = 1.0;
    let sampleRate = audioContext.sampleRate;

    // Adjust duration based on sound type
    switch (soundType) {
      case ST.UIClick:
        duration = 0.1;
        break;
      case ST.LaserShot:
        duration = 0.15; // Quick laser blast
        break;
      case ST.PowerUpChime:
        duration = 0.3;
        break;
      case ST.BackgroundMusic:
        duration = 3 * 60 + 56; // Loop this
        break;
      case ST.Explosion:
        duration = 1.5;
        break;
      default:
        duration = 1.0;
    }

    const buffer = audioContext.createBuffer(
      1,
      duration * sampleRate,
      sampleRate
    );
    const data = buffer.getChannelData(0);

    // Generate different waveforms based on sound type
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate;

      switch (soundType) {
        case ST.UIClick:
          // Short click sound
          data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 50) * 0.3;
          break;

        case ST.LaserShot:
          // Sci-fi laser sound with frequency sweep and harmonic
          const laserFreq = 1200 - 800 * t; // Descending sweep
          const harmonic = Math.sin(2 * Math.PI * laserFreq * 2 * t) * 0.3;
          const fundamental = Math.sin(2 * Math.PI * laserFreq * t);
          data[i] = (fundamental + harmonic) * Math.exp(-t * 8) * 0.25;
          break;

        case ST.PowerUpChime:
          // Sweep sound
          const freq = 200 + 400 * t;
          data[i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 3) * 0.2;
          break;

        case ST.BackgroundMusic:
          // Simple ambient tone
          data[i] =
            (Math.sin(2 * Math.PI * 220 * t) * 0.1 +
              Math.sin(2 * Math.PI * 330 * t) * 0.05 +
              Math.sin(2 * Math.PI * 440 * t) * 0.03) *
            (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.1 * t));
          break;

        case ST.Explosion:
          // Noise burst
          data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 2) * 0.4;
          break;

        default:
          // Default tone
          data[i] = Math.sin(2 * Math.PI * 440 * t) * Math.exp(-t * 2) * 0.1;
      }
    }

    return buffer;
  }
}

// Re-export types for convenience
export { SoundType } from "../types/AudioTypes.js";
export type {
  BaseAudioConfig,
  PositionalAudioConfig,
  GlobalAudioConfig,
  AudioConfig,
} from "../types/AudioTypes.js";
