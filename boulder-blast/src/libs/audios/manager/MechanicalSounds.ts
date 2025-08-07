import * as THREE from "three";
import type { PositionalAudioConfig } from "../types/AudioTypes.js";
import { AUDIO_DEFAULTS, AUDIO_FILES } from "../constants/AudioConstants.js";

/**
 * Creates vehicle and mechanical sounds like engine, machine hum
 */
export class MechanicalSounds {
  /**
   * Creates mechanical sounds
   */
  static async create(
    type: "engine" | "machineHum",
    config: PositionalAudioConfig = {},
    createPositionalAudio: (
      url: string,
      config: PositionalAudioConfig
    ) => Promise<THREE.PositionalAudio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.PositionalAudio> {
    switch (type) {
      case "engine":
        return this.createEngineSound(
          config,
          createPositionalAudio,
          getAudioUrl
        );
      case "machineHum":
        return this.createMachineHum(
          config,
          createPositionalAudio,
          getAudioUrl
        );
      default:
        throw new Error(`Unsupported mechanical sound type: ${type}`);
    }
  }

  private static async createEngineSound(
    config: PositionalAudioConfig,
    createPositionalAudio: (
      url: string,
      config: PositionalAudioConfig
    ) => Promise<THREE.PositionalAudio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.PositionalAudio> {
    const url = config.customUrl || getAudioUrl(AUDIO_FILES.ENGINE);

    const defaultConfig: PositionalAudioConfig = {
      volume: AUDIO_DEFAULTS.ENGINE.VOLUME,
      loop: AUDIO_DEFAULTS.ENGINE.LOOP,
      refDistance: AUDIO_DEFAULTS.ENGINE.REF_DISTANCE,
      rolloffFactor: AUDIO_DEFAULTS.ENGINE.ROLLOFF_FACTOR,
      maxDistance: AUDIO_DEFAULTS.ENGINE.MAX_DISTANCE,
      distanceModel: AUDIO_DEFAULTS.ENGINE.DISTANCE_MODEL,
      autoplay: false,
      ...config,
    };

    return createPositionalAudio(url, defaultConfig);
  }

  private static async createMachineHum(
    config: PositionalAudioConfig,
    createPositionalAudio: (
      url: string,
      config: PositionalAudioConfig
    ) => Promise<THREE.PositionalAudio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.PositionalAudio> {
    const url = config.customUrl || getAudioUrl(AUDIO_FILES.MACHINE_HUM);

    const defaultConfig: PositionalAudioConfig = {
      volume: AUDIO_DEFAULTS.MACHINE_HUM.VOLUME,
      loop: AUDIO_DEFAULTS.MACHINE_HUM.LOOP,
      refDistance: AUDIO_DEFAULTS.MACHINE_HUM.REF_DISTANCE,
      rolloffFactor: AUDIO_DEFAULTS.MACHINE_HUM.ROLLOFF_FACTOR,
      maxDistance: AUDIO_DEFAULTS.MACHINE_HUM.MAX_DISTANCE,
      distanceModel: AUDIO_DEFAULTS.MACHINE_HUM.DISTANCE_MODEL,
      autoplay: false,
      ...config,
    };

    return createPositionalAudio(url, defaultConfig);
  }
}
