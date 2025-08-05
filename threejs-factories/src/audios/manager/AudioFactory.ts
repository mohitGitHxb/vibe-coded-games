import * as THREE from "three";
import type { SoundType } from "../types/AudioTypes.js";
import { SoundType as ST } from "../types/AudioTypes.js";

/**
 * Simplified Audio Factory for synthetic sound generation
 */
export class AudioFactory {
  private audioListener: THREE.AudioListener;

  constructor(audioListener: THREE.AudioListener) {
    this.audioListener = audioListener;
  }

  /**
   * Create synthetic audio sounds using Web Audio API
   */
  async createSound(
    soundType: SoundType
  ): Promise<THREE.Audio<GainNode> | null> {
    try {
      const sound = new THREE.Audio(this.audioListener);

      // Create synthetic audio based on sound type
      const audioBuffer = this.createSyntheticSound(soundType);
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
   * Create synthetic audio buffer for different sound types
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
      case ST.PowerUpChime:
        duration = 0.3;
        break;
      case ST.BackgroundMusic:
        duration = 4.0; // Loop this
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
