import * as THREE from "three";

/**
 * Available sound types for the factory
 */
export const SoundType = {
  Engine: "engine",
  LaserShot: "laserShot",
  BackgroundMusic: "backgroundMusic",
  FootstepsOnGrass: "footstepsOnGrass",
  Explosion: "explosion",
  UIClick: "uiClick",
  PowerUpChime: "powerUpChime",
  WaterDrops: "waterDrops",
  WindAmbient: "windAmbient",
  MachineHum: "machineHum",
  SwordClash: "swordClash",
  Heartbeat: "heartbeat",
} as const;

export type SoundType = (typeof SoundType)[keyof typeof SoundType];

/**
 * Base configuration interface for all audio
 */
export interface BaseAudioConfig {
  volume?: number;
  autoplay?: boolean;
  loop?: boolean;
  playbackRate?: number;
  detune?: number;
  customUrl?: string;
}

/**
 * Configuration for positional (3D) audio
 */
export interface PositionalAudioConfig extends BaseAudioConfig {
  refDistance?: number;
  rolloffFactor?: number;
  maxDistance?: number;
  distanceModel?: "linear" | "inverse" | "exponential";
  panningModel?: "equalpower" | "HRTF";
  coneInnerAngle?: number;
  coneOuterAngle?: number;
  coneOuterGain?: number;
}

/**
 * Configuration for global (non-positional) audio
 */
export interface GlobalAudioConfig extends BaseAudioConfig {
  // Global audio doesn't need spatial properties
}

/**
 * Interface for cached audio buffer data
 */
export interface CachedAudioData {
  buffer: AudioBuffer;
  loadTime: number;
  usageCount: number;
}

/**
 * Audio creator function type
 */
export type AudioCreator<T extends BaseAudioConfig = BaseAudioConfig> = (
  config?: T
) => Promise<THREE.Audio | THREE.PositionalAudio>;

/**
 * Audio configuration union type
 */
export type AudioConfig =
  | BaseAudioConfig
  | PositionalAudioConfig
  | GlobalAudioConfig;
