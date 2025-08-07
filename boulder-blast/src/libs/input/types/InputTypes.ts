/**
 * Input System Types - Type definitions for input handling
 */

/**
 * Common keyboard keys enum for type safety
 */
export const KeyCode = {
  // Movement keys
  W: "KeyW",
  A: "KeyA",
  S: "KeyS",
  D: "KeyD",

  // Arrow keys
  ArrowUp: "ArrowUp",
  ArrowDown: "ArrowDown",
  ArrowLeft: "ArrowLeft",
  ArrowRight: "ArrowRight",

  // Action keys
  Space: "Space",
  Enter: "Enter",
  Escape: "Escape",
  Tab: "Tab",
  Shift: "ShiftLeft",
  ShiftRight: "ShiftRight",
  Control: "ControlLeft",
  ControlRight: "ControlRight",
  Alt: "AltLeft",
  AltRight: "AltRight",

  // Function keys
  F1: "F1",
  F2: "F2",
  F3: "F3",
  F4: "F4",
  F5: "F5",
  F6: "F6",
  F7: "F7",
  F8: "F8",
  F9: "F9",
  F10: "F10",
  F11: "F11",
  F12: "F12",

  // Number keys
  Digit0: "Digit0",
  Digit1: "Digit1",
  Digit2: "Digit2",
  Digit3: "Digit3",
  Digit4: "Digit4",
  Digit5: "Digit5",
  Digit6: "Digit6",
  Digit7: "Digit7",
  Digit8: "Digit8",
  Digit9: "Digit9",

  // Letter keys
  Q: "KeyQ",
  E: "KeyE",
  R: "KeyR",
  T: "KeyT",
  Y: "KeyY",
  U: "KeyU",
  I: "KeyI",
  O: "KeyO",
  P: "KeyP",
  F: "KeyF",
  G: "KeyG",
  H: "KeyH",
  J: "KeyJ",
  K: "KeyK",
  L: "KeyL",
  Z: "KeyZ",
  X: "KeyX",
  C: "KeyC",
  V: "KeyV",
  B: "KeyB",
  N: "KeyN",
  M: "KeyM",
} as const;

export type KeyCode = (typeof KeyCode)[keyof typeof KeyCode];

/**
 * Mouse button enum
 */
export const MouseButton = {
  Left: 0,
  Middle: 1,
  Right: 2,
  Back: 3,
  Forward: 4,
} as const;

export type MouseButton = (typeof MouseButton)[keyof typeof MouseButton];

/**
 * Mouse position in various coordinate systems
 */
export interface MousePosition {
  /** Screen coordinates (pixels from top-left) */
  screen: { x: number; y: number };
  /** Normalized device coordinates (-1 to 1) */
  normalized: { x: number; y: number };
  /** Canvas-relative coordinates (0 to canvas.width/height) */
  canvas: { x: number; y: number };
}

/**
 * Mouse state interface
 */
export interface MouseState {
  position: MousePosition;
  buttons: Map<MouseButton, boolean>;
  wheel: { deltaX: number; deltaY: number; deltaZ: number };
  isOverCanvas: boolean;
}

/**
 * Keyboard state interface
 */
export interface KeyboardState {
  keys: Map<string, boolean>;
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
  };
}

/**
 * Touch point interface for future touch support
 */
export interface TouchPoint {
  id: number;
  position: MousePosition;
  force?: number;
}

/**
 * Touch state interface for future touch support
 */
export interface TouchState {
  touches: Map<number, TouchPoint>;
  isActive: boolean;
}

/**
 * Input event callbacks
 */
export interface InputEventCallbacks {
  onKeyDown?: (key: string, event: KeyboardEvent) => void;
  onKeyUp?: (key: string, event: KeyboardEvent) => void;
  onMouseDown?: (
    button: MouseButton,
    position: MousePosition,
    event: MouseEvent
  ) => void;
  onMouseUp?: (
    button: MouseButton,
    position: MousePosition,
    event: MouseEvent
  ) => void;
  onMouseMove?: (position: MousePosition, event: MouseEvent) => void;
  onWheel?: (
    delta: { deltaX: number; deltaY: number; deltaZ: number },
    event: WheelEvent
  ) => void;
}

/**
 * Input manager configuration
 */
export interface InputManagerConfig {
  /** Target element to attach listeners to (defaults to document) */
  target?: HTMLElement | Document;
  /** Whether to prevent default behavior for captured events */
  preventDefault?: boolean;
  /** Whether to stop event propagation */
  stopPropagation?: boolean;
  /** Custom event callbacks */
  callbacks?: InputEventCallbacks;
  /** Whether to capture mouse leave/enter events */
  trackMouseLeave?: boolean;
  /** Whether to normalize mouse coordinates */
  normalizeMouseCoords?: boolean;
}

/**
 * Input manager state interface
 */
export interface InputManagerState {
  keyboard: KeyboardState;
  mouse: MouseState;
  touch: TouchState;
  isConnected: boolean;
  frameId?: number;
}

/**
 * Gamepad state interface (for future gamepad support)
 */
export interface GamepadState {
  connected: boolean;
  id: string;
  buttons: Map<number, { pressed: boolean; value: number }>;
  axes: number[];
  timestamp: number;
}

/**
 * Vector2-like interface for 2D input values
 */
export interface Vector2Like {
  x: number;
  y: number;
}

/**
 * Input action mapping for higher-level input handling
 */
export interface InputAction {
  name: string;
  keys?: string[];
  mouseButtons?: MouseButton[];
  description?: string;
}

/**
 * Input binding configuration
 */
export interface InputBinding {
  action: string;
  keys: string[];
  mouseButtons?: MouseButton[];
  modifiers?: {
    shift?: boolean;
    ctrl?: boolean;
    alt?: boolean;
    meta?: boolean;
  };
}
