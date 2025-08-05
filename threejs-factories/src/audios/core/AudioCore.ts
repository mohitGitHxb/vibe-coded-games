import * as THREE from "three";

/**
 * Core utilities for audio creation and management
 */
export class AudioCore {
  private audioListener: THREE.AudioListener;
  private audioLoader: THREE.AudioLoader;
  private audioBasePath: string;

  constructor(
    audioListener: THREE.AudioListener,
    audioBasePath: string = "/sounds/",
    audioLoader?: THREE.AudioLoader
  ) {
    this.audioListener = audioListener;
    this.audioBasePath = audioBasePath;
    this.audioLoader = audioLoader || new THREE.AudioLoader();
  }

  /**
   * Create a basic audio object
   */
  createAudio(): THREE.Audio<GainNode> {
    return new THREE.Audio(this.audioListener);
  }

  /**
   * Create a positional audio object
   */
  createPositionalAudio(): THREE.PositionalAudio {
    return new THREE.PositionalAudio(this.audioListener);
  }

  /**
   * Load audio buffer from URL
   */
  async loadAudioBuffer(url: string): Promise<AudioBuffer> {
    return new Promise((resolve, reject) => {
      this.audioLoader.load(
        this.audioBasePath + url,
        resolve,
        undefined,
        reject
      );
    });
  }

  /**
   * Get audio listener
   */
  getListener(): THREE.AudioListener {
    return this.audioListener;
  }
}
