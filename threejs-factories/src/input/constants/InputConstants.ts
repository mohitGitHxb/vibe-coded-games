/**
 * Input Constants - Predefined values and presets for input handling
 */

import type {
  InputManagerConfig,
  Vector2Like,
  InputAction,
} from "../types/InputTypes.js";

// === INPUT MANAGER DEFAULTS ===
export const INPUT_MANAGER_DEFAULTS: Required<
  Omit<InputManagerConfig, "callbacks" | "target">
> = {
  preventDefault: false,
  stopPropagation: false,
  trackMouseLeave: true,
  normalizeMouseCoords: true,
};

// === MOUSE SENSITIVITY PRESETS ===
export const MOUSE_SENSITIVITY_PRESETS = {
  veryLow: 0.1,
  low: 0.3,
  normal: 0.5,
  high: 0.8,
  veryHigh: 1.2,
  extreme: 2.0,
} as const;

// === COMMON INPUT MAPPINGS ===
export const COMMON_KEY_MAPPINGS = {
  // Movement
  moveForward: ["KeyW", "ArrowUp"],
  moveBackward: ["KeyS", "ArrowDown"],
  moveLeft: ["KeyA", "ArrowLeft"],
  moveRight: ["KeyD", "ArrowRight"],

  // Actions
  jump: ["Space"],
  crouch: ["KeyC", "ControlLeft"],
  run: ["ShiftLeft"],
  interact: ["KeyE", "KeyF"],

  // Combat
  primaryAttack: ["mouse0"], // Left mouse button
  secondaryAttack: ["mouse2"], // Right mouse button
  reload: ["KeyR"],

  // UI
  openMenu: ["Escape"],
  openInventory: ["Tab", "KeyI"],
  openMap: ["KeyM"],

  // Camera
  lookUp: ["ArrowUp"],
  lookDown: ["ArrowDown"],
  lookLeft: ["ArrowLeft"],
  lookRight: ["ArrowRight"],

  // Debug
  toggleDebug: ["F3"],
  toggleFullscreen: ["F11"],
  screenshot: ["F12"],
} as const;

// === INPUT ACTION PRESETS ===
export const INPUT_ACTION_PRESETS: InputAction[] = [
  {
    name: "move_forward",
    keys: ["KeyW", "ArrowUp"],
    description: "Move character forward",
  },
  {
    name: "move_backward",
    keys: ["KeyS", "ArrowDown"],
    description: "Move character backward",
  },
  {
    name: "move_left",
    keys: ["KeyA", "ArrowLeft"],
    description: "Move character left",
  },
  {
    name: "move_right",
    keys: ["KeyD", "ArrowRight"],
    description: "Move character right",
  },
  {
    name: "jump",
    keys: ["Space"],
    description: "Make character jump",
  },
  {
    name: "crouch",
    keys: ["KeyC", "ControlLeft"],
    description: "Make character crouch",
  },
  {
    name: "run",
    keys: ["ShiftLeft"],
    description: "Make character run",
  },
  {
    name: "interact",
    keys: ["KeyE", "KeyF"],
    description: "Interact with objects",
  },
  {
    name: "primary_attack",
    mouseButtons: [0], // Left click
    description: "Primary attack or action",
  },
  {
    name: "secondary_attack",
    mouseButtons: [2], // Right click
    description: "Secondary attack or action",
  },
  {
    name: "camera_look",
    description: "Camera look around (mouse movement)",
  },
];

// === DEADZONE CONSTANTS ===
export const DEADZONE_PRESETS = {
  none: 0.0,
  minimal: 0.05,
  small: 0.1,
  medium: 0.2,
  large: 0.3,
  extreme: 0.5,
} as const;

// === EVENT THROTTLING CONSTANTS ===
export const EVENT_THROTTLING = {
  MOUSE_MOVE_THROTTLE_MS: 16, // ~60fps
  WHEEL_THROTTLE_MS: 50,
  KEY_REPEAT_THROTTLE_MS: 100,
  RESIZE_THROTTLE_MS: 100,
} as const;

// === MOUSE WHEEL CONSTANTS ===
export const MOUSE_WHEEL_SETTINGS = {
  DELTA_MODE_PIXEL: 0,
  DELTA_MODE_LINE: 1,
  DELTA_MODE_PAGE: 2,

  // Normalization factors for different browsers
  WEBKIT_SCALE_FACTOR: 0.1,
  FIREFOX_SCALE_FACTOR: 1.0,
  IE_SCALE_FACTOR: 0.025,

  // Default sensitivity
  DEFAULT_SENSITIVITY: 1.0,
} as const;

// === COORDINATE SYSTEM CONSTANTS ===
export const COORDINATE_SYSTEMS = {
  // Screen space (pixels, top-left origin)
  SCREEN_ORIGIN: { x: 0, y: 0 } as Vector2Like,

  // Normalized device coordinates (-1 to 1, center origin)
  NDC_MIN: { x: -1, y: -1 } as Vector2Like,
  NDC_MAX: { x: 1, y: 1 } as Vector2Like,
  NDC_CENTER: { x: 0, y: 0 } as Vector2Like,

  // Canvas coordinates (0 to width/height, top-left origin)
  CANVAS_ORIGIN: { x: 0, y: 0 } as Vector2Like,
} as const;

// === INPUT POLLING CONSTANTS ===
export const POLLING_SETTINGS = {
  DEFAULT_UPDATE_RATE: 60, // Hz
  HIGH_PRECISION_UPDATE_RATE: 120, // Hz
  LOW_POWER_UPDATE_RATE: 30, // Hz

  // Frame timing
  FRAME_TIME_60FPS: 1000 / 60, // ms
  FRAME_TIME_120FPS: 1000 / 120, // ms
  FRAME_TIME_30FPS: 1000 / 30, // ms
} as const;

// === INPUT VALIDATION CONSTANTS ===
export const INPUT_VALIDATION = {
  MIN_KEY_CODE_LENGTH: 1,
  MAX_KEY_CODE_LENGTH: 20,
  MAX_SIMULTANEOUS_KEYS: 50,
  MAX_MOUSE_BUTTONS: 10,

  // Mouse position bounds
  MIN_NORMALIZED_COORD: -1,
  MAX_NORMALIZED_COORD: 1,
} as const;

// === PERFORMANCE CONSTANTS ===
export const PERFORMANCE_SETTINGS = {
  // How often to clean up unused state
  CLEANUP_INTERVAL_MS: 5000,

  // Maximum number of events to queue
  MAX_EVENT_QUEUE_SIZE: 100,

  // Batch size for event processing
  EVENT_BATCH_SIZE: 10,

  // Memory management
  MAX_CACHED_POSITIONS: 60, // 1 second at 60fps
  MAX_CACHED_EVENTS: 1000,
} as const;

// === BROWSER COMPATIBILITY ===
export const BROWSER_SUPPORT = {
  // Feature detection flags
  SUPPORTS_POINTER_EVENTS:
    typeof window !== "undefined" && "PointerEvent" in window,
  SUPPORTS_TOUCH_EVENTS:
    typeof window !== "undefined" && "TouchEvent" in window,
  SUPPORTS_GAMEPAD_API:
    typeof navigator !== "undefined" && "getGamepads" in navigator,
  SUPPORTS_FULLSCREEN_API:
    typeof document !== "undefined" && "fullscreenEnabled" in document,

  // Event name mappings for different browsers
  FULLSCREEN_EVENTS: {
    request: [
      "requestFullscreen",
      "webkitRequestFullscreen",
      "mozRequestFullScreen",
      "msRequestFullscreen",
    ],
    exit: [
      "exitFullscreen",
      "webkitExitFullscreen",
      "mozCancelFullScreen",
      "msExitFullscreen",
    ],
    change: [
      "fullscreenchange",
      "webkitfullscreenchange",
      "mozfullscreenchange",
      "MSFullscreenChange",
    ],
  },
} as const;

// === DEBUG CONSTANTS ===
export const DEBUG_SETTINGS = {
  LOG_INPUT_EVENTS: false,
  LOG_STATE_CHANGES: false,
  LOG_PERFORMANCE_METRICS: false,
  SHOW_INPUT_OVERLAY: false,

  // Visual debug options
  HIGHLIGHT_ACTIVE_KEYS: false,
  SHOW_MOUSE_TRAIL: false,
  DISPLAY_COORDINATES: false,
} as const;

// === HELPER FUNCTIONS ===

/**
 * Get a preset mouse sensitivity value
 */
export function getMouseSensitivity(
  preset: keyof typeof MOUSE_SENSITIVITY_PRESETS
): number {
  return MOUSE_SENSITIVITY_PRESETS[preset];
}

/**
 * Get a preset deadzone value
 */
export function getDeadzone(preset: keyof typeof DEADZONE_PRESETS): number {
  return DEADZONE_PRESETS[preset];
}

/**
 * Get common key mapping for an action
 */
export function getKeyMapping(
  action: keyof typeof COMMON_KEY_MAPPINGS
): readonly string[] {
  return COMMON_KEY_MAPPINGS[action];
}

/**
 * Check if browser supports a specific input feature
 */
export function supportsInputFeature(
  feature: keyof typeof BROWSER_SUPPORT
): boolean {
  return BROWSER_SUPPORT[feature] as boolean;
}
