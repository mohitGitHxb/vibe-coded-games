/**
 * Three.js Factories - Modular, Reusable, Type-Safe Asset Creation
 *
 * This library provides factories for creating Three.js materials and audio
 * with a focus on reusability, type safety, and maintainability.
 *
 * Architecture:
 * - Separation of concerns with modular design
 * - Types in separate files for clarity
 * - Constants externalized for easy configuration
 * - Material/audio creators organized by category
 * - Core utilities abstracted for reuse
 *
 * @example Material Factory Usage
 * ```typescript
 * import { MaterialFactory, MaterialType } from './index.js';
 *
 * const materialFactory = new MaterialFactory('/textures/');
 *
 * // Specific material creation
 * const grass = await materialFactory.createGrass({ color: 0x22cc22 });
 * const metal = await materialFactory.createRustedMetal({ roughness: 0.9 });
 *
 * // Generic creation with enum
 * const asphalt = await materialFactory.createMaterial(MaterialType.Asphalt);
 * ```
 *
 * @example Audio Factory Usage
 * ```typescript
 * import { AudioFactory, SoundType } from './index.js';
 *
 * const listener = new THREE.AudioListener();
 * const audioFactory = new AudioFactory(listener, '/sounds/');
 *
 * // Specific audio creation
 * const engine = await audioFactory.createEngineSound({ volume: 0.8, loop: true });
 * const laser = await audioFactory.createLaserSound({ refDistance: 50 });
 *
 * // Generic creation with enum
 * const explosion = await audioFactory.createSound(SoundType.Explosion, {
 *   volume: 1.0,
 *   maxDistance: 200
 * });
 * ```
 */

// === FACTORY EXPORTS ===
export { MaterialFactory } from "./materials/index.js";
export { AudioFactory } from "./audios/index.js";
export { PhysicsFactory } from "./physics/index.js";
export { InputManager } from "./input/index.js";

// === TYPE EXPORTS ===
export type {
  BaseMaterialConfig,
  PBRMaterialConfig,
  WaterMaterialConfig,
  GlowMaterialConfig,
  MaterialConfig,
} from "./materials/types/MaterialTypes.js";

export type {
  BaseAudioConfig,
  PositionalAudioConfig,
  GlobalAudioConfig,
  CachedAudioData,
  AudioConfig,
} from "./audios/types/AudioTypes.js";

export type {
  MousePosition,
  MouseState,
  KeyboardState,
  TouchState,
  Vector2Like,
  InputManagerConfig,
  InputManagerState,
  InputEventCallbacks,
  InputAction,
  InputBinding,
} from "./input/types/InputTypes.js";

export type {
  Vector3Like,
  PhysicsObject,
  PhysicsFactoryOptions,
  PhysicsBodyOptions,
  PhysicsShapeType,
  PhysicsMaterialType,
  RaycastOptions,
  RaycastResult,
  TriggerZoneOptions,
  PhysicsBodyPresetType,
} from "./physics/types/PhysicsTypes.js";

// === ENUM EXPORTS ===
export { MaterialType } from "./materials/types/MaterialTypes.js";
export { SoundType } from "./audios/types/AudioTypes.js";
export { KeyCode, MouseButton } from "./input/types/InputTypes.js";

// === CONSTANT EXPORTS ===
export {
  MATERIAL_DEFAULTS,
  TEXTURE_DEFAULTS,
  MATERIAL_CACHE_CONFIG,
} from "./materials/constants/MaterialConstants.js";

export {
  AUDIO_DEFAULTS,
  AUDIO_FILES,
  SYNTHETIC_AUDIO_CONFIG,
  AUDIO_CACHE_CONFIG,
} from "./audios/constants/AudioConstants.js";

export {
  MOUSE_SENSITIVITY_PRESETS,
  COMMON_KEY_MAPPINGS,
  INPUT_ACTION_PRESETS,
  DEADZONE_PRESETS,
} from "./input/constants/InputConstants.js";

export {
  PHYSICS_WORLD_DEFAULTS,
  GRAVITY_PRESETS,
  PHYSICS_MATERIALS,
  PHYSICS_BODY_PRESETS,
} from "./physics/constants/PhysicsConstants.js";

// === CORE UTILITY EXPORTS ===
export { MaterialCore } from "./materials/core/MaterialCore.js";
export { AudioCore } from "./audios/core/AudioCore.js";
export {
  PhysicsShapeCreator,
  PhysicsMaterialCreator,
} from "./physics/index.js";
export { InputCore } from "./input/core/InputCore.js";

// === CATEGORY-SPECIFIC EXPORTS ===
export { TerrainMaterials } from "./materials/manager/TerrainMaterials.js";
export { MetallicMaterials } from "./materials/manager/MetallicMaterials.js";
export { SpecialMaterials } from "./materials/manager/SpecialMaterials.js";
export { StylizedMaterials } from "./materials/manager/StylizedMaterials.js";

export { MechanicalSounds } from "./audios/manager/MechanicalSounds.js";
export { CombatSounds } from "./audios/manager/CombatSounds.js";
export { EnvironmentalSounds } from "./audios/manager/EnvironmentalSounds.js";
export { InterfaceSounds } from "./audios/manager/InterfaceSounds.js";
