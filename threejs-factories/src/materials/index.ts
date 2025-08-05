// Materials Module - Main Export
export { MaterialFactory } from "./manager/MaterialFactory.js";

// Re-export types for convenience
export type {
  MaterialType,
  MaterialConfig,
  BaseMaterialConfig,
  PBRMaterialConfig,
  WaterMaterialConfig,
  GlowMaterialConfig,
} from "./types/MaterialTypes.js";

// Re-export constants
export { MATERIAL_DEFAULTS } from "./constants/MaterialConstants.js";

// Core utilities (for advanced usage)
export { MaterialCore } from "./core/MaterialCore.js";
