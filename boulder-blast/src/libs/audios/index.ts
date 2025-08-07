// Audios Module - Main Export
export { AudioFactory } from "./manager/AudioFactory.js";

// Re-export types for convenience
export type {
  SoundType,
  PositionalAudioConfig,
  GlobalAudioConfig,
  BaseAudioConfig,
  AudioConfig,
} from "./types/AudioTypes.js";

// Re-export constants (will be available once AudioConstants is moved)

// Core utilities (for advanced usage)
export { AudioCore } from "./core/AudioCore.js";
