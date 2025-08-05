import * as THREE from "three";
import type { PositionalAudioConfig } from "../types/AudioTypes.js";
import { AUDIO_DEFAULTS, AUDIO_FILES } from "../constants/AudioConstants.js";

/**
 * Creates weapon and combat sounds like laser shot, explosion, sword clash
 */
export class CombatSounds {
  /**
   * Creates combat sounds
   */
  static async create(
    type: "laserShot" | "explosion" | "swordClash",
    config: PositionalAudioConfig = {},
    createPositionalAudio: (
      url: string,
      config: PositionalAudioConfig
    ) => Promise<THREE.PositionalAudio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.PositionalAudio> {
    switch (type) {
      case "laserShot":
        return this.createLaserSound(
          config,
          createPositionalAudio,
          getAudioUrl
        );
      case "explosion":
        return this.createExplosion(config, createPositionalAudio, getAudioUrl);
      case "swordClash":
        return this.createSwordClash(
          config,
          createPositionalAudio,
          getAudioUrl
        );
      default:
        throw new Error(`Unsupported combat sound type: ${type}`);
    }
  }

  private static async createLaserSound(
    config: PositionalAudioConfig,
    createPositionalAudio: (
      url: string,
      config: PositionalAudioConfig
    ) => Promise<THREE.PositionalAudio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.PositionalAudio> {
    const url = config.customUrl || getAudioUrl(AUDIO_FILES.LASER_SHOT);

    const defaultConfig: PositionalAudioConfig = {
      volume: AUDIO_DEFAULTS.LASER_SHOT.VOLUME,
      loop: AUDIO_DEFAULTS.LASER_SHOT.LOOP,
      refDistance: AUDIO_DEFAULTS.LASER_SHOT.REF_DISTANCE,
      rolloffFactor: AUDIO_DEFAULTS.LASER_SHOT.ROLLOFF_FACTOR,
      maxDistance: AUDIO_DEFAULTS.LASER_SHOT.MAX_DISTANCE,
      distanceModel: AUDIO_DEFAULTS.LASER_SHOT.DISTANCE_MODEL,
      autoplay: false,
      ...config,
    };

    return createPositionalAudio(url, defaultConfig);
  }

  private static async createExplosion(
    config: PositionalAudioConfig,
    createPositionalAudio: (
      url: string,
      config: PositionalAudioConfig
    ) => Promise<THREE.PositionalAudio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.PositionalAudio> {
    const url = config.customUrl || getAudioUrl(AUDIO_FILES.EXPLOSION);

    const defaultConfig: PositionalAudioConfig = {
      volume: AUDIO_DEFAULTS.EXPLOSION.VOLUME,
      loop: AUDIO_DEFAULTS.EXPLOSION.LOOP,
      refDistance: AUDIO_DEFAULTS.EXPLOSION.REF_DISTANCE,
      rolloffFactor: AUDIO_DEFAULTS.EXPLOSION.ROLLOFF_FACTOR,
      maxDistance: AUDIO_DEFAULTS.EXPLOSION.MAX_DISTANCE,
      distanceModel: AUDIO_DEFAULTS.EXPLOSION.DISTANCE_MODEL,
      autoplay: false,
      ...config,
    };

    return createPositionalAudio(url, defaultConfig);
  }

  private static async createSwordClash(
    config: PositionalAudioConfig,
    createPositionalAudio: (
      url: string,
      config: PositionalAudioConfig
    ) => Promise<THREE.PositionalAudio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.PositionalAudio> {
    const url = config.customUrl || getAudioUrl(AUDIO_FILES.SWORD_CLASH);

    const defaultConfig: PositionalAudioConfig = {
      volume: AUDIO_DEFAULTS.SWORD_CLASH.VOLUME,
      loop: AUDIO_DEFAULTS.SWORD_CLASH.LOOP,
      refDistance: AUDIO_DEFAULTS.SWORD_CLASH.REF_DISTANCE,
      rolloffFactor: AUDIO_DEFAULTS.SWORD_CLASH.ROLLOFF_FACTOR,
      maxDistance: AUDIO_DEFAULTS.SWORD_CLASH.MAX_DISTANCE,
      distanceModel: AUDIO_DEFAULTS.SWORD_CLASH.DISTANCE_MODEL,
      autoplay: false,
      ...config,
    };

    return createPositionalAudio(url, defaultConfig);
  }
}
