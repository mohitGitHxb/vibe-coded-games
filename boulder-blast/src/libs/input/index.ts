// Input Module - Main Export
export { InputManager } from "./manager/InputManager.js";

// Re-export types and constants for convenience
export {
  // Key code and mouse button constants
  KeyCode,
  MouseButton,
} from "./types/InputTypes.js";

export type {
  // Core types
  KeyCode as KeyCodeType,
  MouseButton as MouseButtonType,
  MousePosition,
  MouseState,
  KeyboardState,
  TouchState,
  Vector2Like,

  // Configuration types
  InputManagerConfig,
  InputManagerState,
  InputEventCallbacks,
  InputAction,
  InputBinding,

  // Touch support (future)
  TouchPoint,

  // Gamepad support (future)
  GamepadState,
} from "./types/InputTypes.js";

// Re-export constants for convenience
export {
  // Preset values
  MOUSE_SENSITIVITY_PRESETS,
  COMMON_KEY_MAPPINGS,
  INPUT_ACTION_PRESETS,
  DEADZONE_PRESETS,

  // Helper functions
  getMouseSensitivity,
  getDeadzone,
  getKeyMapping,
  supportsInputFeature,
} from "./constants/InputConstants.js";

// Core utilities (for advanced usage)
export { InputCore } from "./core/InputCore.js";
