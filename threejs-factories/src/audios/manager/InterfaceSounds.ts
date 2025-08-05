import * as THREE from "three";
import type { GlobalAudioConfig } from "../types/AudioTypes.js";
import { AUDIO_DEFAULTS, AUDIO_FILES } from "../constants/AudioConstants.js";

/**
 * Creates interface and ambient sounds like UI clicks, background music, wind, heartbeat
 */
export class InterfaceSounds {
  /**
   * Creates interface and ambient sounds
   */
  static async create(
    type:
      | "backgroundMusic"
      | "uiClick"
      | "powerUpChime"
      | "windAmbient"
      | "heartbeat",
    config: GlobalAudioConfig = {},
    createGlobalAudio: (
      url: string,
      config: GlobalAudioConfig
    ) => Promise<THREE.Audio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.Audio> {
    switch (type) {
      case "backgroundMusic":
        return this.createBackgroundMusic(
          config,
          createGlobalAudio,
          getAudioUrl
        );
      case "uiClick":
        return this.createUIClick(config, createGlobalAudio, getAudioUrl);
      case "powerUpChime":
        return this.createPowerUpChime(config, createGlobalAudio, getAudioUrl);
      case "windAmbient":
        return this.createWindAmbient(config, createGlobalAudio, getAudioUrl);
      case "heartbeat":
        return this.createHeartbeat(config, createGlobalAudio, getAudioUrl);
      default:
        throw new Error(`Unsupported interface sound type: ${type}`);
    }
  }

  private static async createBackgroundMusic(
    config: GlobalAudioConfig,
    createGlobalAudio: (
      url: string,
      config: GlobalAudioConfig
    ) => Promise<THREE.Audio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.Audio> {
    const url = config.customUrl || getAudioUrl(AUDIO_FILES.BACKGROUND_MUSIC);

    const defaultConfig: GlobalAudioConfig = {
      volume: AUDIO_DEFAULTS.BACKGROUND_MUSIC.VOLUME,
      loop: AUDIO_DEFAULTS.BACKGROUND_MUSIC.LOOP,
      autoplay: false,
      ...config,
    };

    return createGlobalAudio(url, defaultConfig);
  }

  private static async createUIClick(
    config: GlobalAudioConfig,
    createGlobalAudio: (
      url: string,
      config: GlobalAudioConfig
    ) => Promise<THREE.Audio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.Audio> {
    const url = config.customUrl || getAudioUrl(AUDIO_FILES.UI_CLICK);

    const defaultConfig: GlobalAudioConfig = {
      volume: AUDIO_DEFAULTS.UI_CLICK.VOLUME,
      loop: AUDIO_DEFAULTS.UI_CLICK.LOOP,
      autoplay: false,
      ...config,
    };

    return createGlobalAudio(url, defaultConfig);
  }

  private static async createPowerUpChime(
    config: GlobalAudioConfig,
    createGlobalAudio: (
      url: string,
      config: GlobalAudioConfig
    ) => Promise<THREE.Audio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.Audio> {
    const url = config.customUrl || getAudioUrl(AUDIO_FILES.POWER_UP_CHIME);

    const defaultConfig: GlobalAudioConfig = {
      volume: AUDIO_DEFAULTS.POWER_UP_CHIME.VOLUME,
      loop: AUDIO_DEFAULTS.POWER_UP_CHIME.LOOP,
      autoplay: false,
      ...config,
    };

    return createGlobalAudio(url, defaultConfig);
  }

  private static async createWindAmbient(
    config: GlobalAudioConfig,
    createGlobalAudio: (
      url: string,
      config: GlobalAudioConfig
    ) => Promise<THREE.Audio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.Audio> {
    const url = config.customUrl || getAudioUrl(AUDIO_FILES.WIND_AMBIENT);

    const defaultConfig: GlobalAudioConfig = {
      volume: AUDIO_DEFAULTS.WIND_AMBIENT.VOLUME,
      loop: AUDIO_DEFAULTS.WIND_AMBIENT.LOOP,
      autoplay: false,
      ...config,
    };

    return createGlobalAudio(url, defaultConfig);
  }

  private static async createHeartbeat(
    config: GlobalAudioConfig,
    createGlobalAudio: (
      url: string,
      config: GlobalAudioConfig
    ) => Promise<THREE.Audio>,
    getAudioUrl: (filename: string, basePath?: string) => string
  ): Promise<THREE.Audio> {
    const url = config.customUrl || getAudioUrl(AUDIO_FILES.HEARTBEAT);

    const defaultConfig: GlobalAudioConfig = {
      volume: AUDIO_DEFAULTS.HEARTBEAT.VOLUME,
      loop: AUDIO_DEFAULTS.HEARTBEAT.LOOP,
      playbackRate: AUDIO_DEFAULTS.HEARTBEAT.PLAYBACK_RATE,
      autoplay: false,
      ...config,
    };

    return createGlobalAudio(url, defaultConfig);
  }
}
