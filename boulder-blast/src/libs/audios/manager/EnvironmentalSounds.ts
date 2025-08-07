import * as THREE from "three";
import type { PositionalAudioConfig } from "../types/AudioTypes.js";
import { AUDIO_DEFAULTS, AUDIO_FILES } from "../constants/AudioConstants.js";

/**
 * Creates ambient environmental sounds like water drops, footsteps on grass
 */
export class EnvironmentalSounds {
  /**
   * Creates environmental sounds
   */
  static async create(
    type: "footstepsOnGrass" | "waterDrops",
    config: PositionalAudioConfig = {},
    createPositionalAudio: (
      url: string,
      config: PositionalAudioConfig
    ) => Promise<THREE.PositionalAudio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.PositionalAudio> {
    switch (type) {
      case "footstepsOnGrass":
        return this.createFootstepsOnGrass(
          config,
          createPositionalAudio,
          getAudioUrl
        );
      case "waterDrops":
        return this.createWaterDrops(
          config,
          createPositionalAudio,
          getAudioUrl
        );
      default:
        throw new Error(`Unsupported environmental sound type: ${type}`);
    }
  }

  private static async createFootstepsOnGrass(
    config: PositionalAudioConfig,
    createPositionalAudio: (
      url: string,
      config: PositionalAudioConfig
    ) => Promise<THREE.PositionalAudio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.PositionalAudio> {
    const url = config.customUrl || getAudioUrl(AUDIO_FILES.FOOTSTEPS_ON_GRASS);

    const defaultConfig: PositionalAudioConfig = {
      volume: AUDIO_DEFAULTS.FOOTSTEPS_ON_GRASS.VOLUME,
      loop: AUDIO_DEFAULTS.FOOTSTEPS_ON_GRASS.LOOP,
      refDistance: AUDIO_DEFAULTS.FOOTSTEPS_ON_GRASS.REF_DISTANCE,
      rolloffFactor: AUDIO_DEFAULTS.FOOTSTEPS_ON_GRASS.ROLLOFF_FACTOR,
      maxDistance: AUDIO_DEFAULTS.FOOTSTEPS_ON_GRASS.MAX_DISTANCE,
      distanceModel: AUDIO_DEFAULTS.FOOTSTEPS_ON_GRASS.DISTANCE_MODEL,
      autoplay: false,
      ...config,
    };

    return createPositionalAudio(url, defaultConfig);
  }

  private static async createWaterDrops(
    config: PositionalAudioConfig,
    createPositionalAudio: (
      url: string,
      config: PositionalAudioConfig
    ) => Promise<THREE.PositionalAudio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.PositionalAudio> {
    const url = config.customUrl || getAudioUrl(AUDIO_FILES.WATER_DROPS);

    const defaultConfig: PositionalAudioConfig = {
      volume: AUDIO_DEFAULTS.WATER_DROPS.VOLUME,
      loop: AUDIO_DEFAULTS.WATER_DROPS.LOOP,
      refDistance: AUDIO_DEFAULTS.WATER_DROPS.REF_DISTANCE,
      rolloffFactor: AUDIO_DEFAULTS.WATER_DROPS.ROLLOFF_FACTOR,
      maxDistance: AUDIO_DEFAULTS.WATER_DROPS.MAX_DISTANCE,
      distanceModel: AUDIO_DEFAULTS.WATER_DROPS.DISTANCE_MODEL,
      autoplay: false,
      ...config,
    };

    return createPositionalAudio(url, defaultConfig);
  }
}
