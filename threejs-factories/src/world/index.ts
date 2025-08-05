// Export main WorldManager
export { WorldManager } from "./manager/WorldManager";

// Export types
export type {
  CameraType,
  LightType,
  SkyboxType,
  CameraConfig,
  LightConfig,
  SkyboxConfig,
  WorldConfig,
  WorldState,
  SceneObject,
} from "./types/WorldTypes";

// Export core utilities
export { CameraManager } from "./core/CameraManager";
export { LightManager } from "./core/LightManager";
export { SkyboxGenerator } from "./core/SkyboxGenerator";

// Export constants
export {
  DEFAULT_CAMERA_CONFIG,
  DEFAULT_ORTHOGRAPHIC_CAMERA,
  DEFAULT_LIGHTING_SETUP,
  STUDIO_LIGHTING_SETUP,
  OUTDOOR_LIGHTING_SETUP,
  DEFAULT_WORLD_CONFIG,
  SKYBOX_PRESETS,
  RENDERER_DEFAULTS,
} from "./constants/WorldDefaults";
