/**
 * Input Core - Core utilities and helper functions for input handling
 */

import type {
  MousePosition,
  Vector2Like,
  KeyboardState,
  MouseState,
  TouchState,
} from "../types/InputTypes.js";

import {
  COORDINATE_SYSTEMS,
  MOUSE_WHEEL_SETTINGS,
  INPUT_VALIDATION,
} from "../constants/InputConstants.js";

/**
 * Core input utility class with static methods
 */
export class InputCore {
  /**
   * Convert screen coordinates to normalized device coordinates
   */
  static screenToNormalizedCoordinates(
    screenX: number,
    screenY: number,
    canvasWidth: number,
    canvasHeight: number
  ): Vector2Like {
    const x = (screenX / canvasWidth) * 2 - 1;
    const y = -(screenY / canvasHeight) * 2 + 1; // Flip Y axis

    return {
      x: Math.max(
        INPUT_VALIDATION.MIN_NORMALIZED_COORD,
        Math.min(INPUT_VALIDATION.MAX_NORMALIZED_COORD, x)
      ),
      y: Math.max(
        INPUT_VALIDATION.MIN_NORMALIZED_COORD,
        Math.min(INPUT_VALIDATION.MAX_NORMALIZED_COORD, y)
      ),
    };
  }

  /**
   * Convert normalized device coordinates to screen coordinates
   */
  static normalizedToScreenCoordinates(
    normalizedX: number,
    normalizedY: number,
    canvasWidth: number,
    canvasHeight: number
  ): Vector2Like {
    const x = (normalizedX + 1) * canvasWidth * 0.5;
    const y = (-normalizedY + 1) * canvasHeight * 0.5; // Flip Y axis

    return {
      x: Math.max(0, Math.min(canvasWidth, x)),
      y: Math.max(0, Math.min(canvasHeight, y)),
    };
  }

  /**
   * Get mouse position relative to a canvas element
   */
  static getCanvasRelativePosition(
    event: MouseEvent,
    canvas: HTMLCanvasElement
  ): Vector2Like {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  /**
   * Create a complete mouse position object from a mouse event
   */
  static createMousePosition(
    event: MouseEvent,
    canvas?: HTMLCanvasElement
  ): MousePosition {
    const canvasElement = canvas || this.findCanvasElement();
    const canvasWidth = canvasElement?.width || window.innerWidth;
    const canvasHeight = canvasElement?.height || window.innerHeight;

    let canvasPos: Vector2Like;
    if (canvasElement) {
      canvasPos = this.getCanvasRelativePosition(event, canvasElement);
    } else {
      canvasPos = { x: event.clientX, y: event.clientY };
    }

    const screenPos = { x: event.screenX, y: event.screenY };
    const normalizedPos = this.screenToNormalizedCoordinates(
      canvasPos.x,
      canvasPos.y,
      canvasWidth,
      canvasHeight
    );

    return {
      screen: screenPos,
      normalized: normalizedPos,
      canvas: canvasPos,
    };
  }

  /**
   * Normalize mouse wheel delta values across different browsers
   */
  static normalizeWheelDelta(event: WheelEvent): Vector2Like {
    let deltaX = event.deltaX;
    let deltaY = event.deltaY;

    // Handle different delta modes
    switch (event.deltaMode) {
      case MOUSE_WHEEL_SETTINGS.DELTA_MODE_LINE:
        deltaX *= 16; // Approximate pixels per line
        deltaY *= 16;
        break;
      case MOUSE_WHEEL_SETTINGS.DELTA_MODE_PAGE:
        deltaX *= window.innerWidth;
        deltaY *= window.innerHeight;
        break;
      // DELTA_MODE_PIXEL is default, no scaling needed
    }

    // Apply browser-specific scaling
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes("webkit") && !userAgent.includes("edge")) {
      deltaX *= MOUSE_WHEEL_SETTINGS.WEBKIT_SCALE_FACTOR;
      deltaY *= MOUSE_WHEEL_SETTINGS.WEBKIT_SCALE_FACTOR;
    } else if (userAgent.includes("firefox")) {
      deltaX *= MOUSE_WHEEL_SETTINGS.FIREFOX_SCALE_FACTOR;
      deltaY *= MOUSE_WHEEL_SETTINGS.FIREFOX_SCALE_FACTOR;
    }

    return { x: deltaX, y: deltaY };
  }

  /**
   * Check if a key code is valid
   */
  static isValidKeyCode(keyCode: string): boolean {
    return (
      keyCode.length >= INPUT_VALIDATION.MIN_KEY_CODE_LENGTH &&
      keyCode.length <= INPUT_VALIDATION.MAX_KEY_CODE_LENGTH &&
      /^[a-zA-Z0-9]+$/.test(keyCode)
    );
  }

  /**
   * Check if a mouse button is valid
   */
  static isValidMouseButton(button: number): boolean {
    return (
      Number.isInteger(button) &&
      button >= 0 &&
      button < INPUT_VALIDATION.MAX_MOUSE_BUTTONS
    );
  }

  /**
   * Create an empty keyboard state
   */
  static createEmptyKeyboardState(): KeyboardState {
    return {
      keys: new Map(),
      modifiers: {
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
      },
    };
  }

  /**
   * Create an empty mouse state
   */
  static createEmptyMouseState(): MouseState {
    return {
      position: {
        screen: COORDINATE_SYSTEMS.SCREEN_ORIGIN,
        normalized: COORDINATE_SYSTEMS.NDC_CENTER,
        canvas: COORDINATE_SYSTEMS.CANVAS_ORIGIN,
      },
      buttons: new Map(),
      wheel: { deltaX: 0, deltaY: 0, deltaZ: 0 },
      isOverCanvas: false,
    };
  }

  /**
   * Create an empty touch state
   */
  static createEmptyTouchState(): TouchState {
    return {
      touches: new Map(),
      isActive: false,
    };
  }

  /**
   * Update keyboard modifiers from event
   */
  static updateKeyboardModifiers(
    state: KeyboardState,
    event: KeyboardEvent
  ): void {
    state.modifiers.shift = event.shiftKey;
    state.modifiers.ctrl = event.ctrlKey;
    state.modifiers.alt = event.altKey;
    state.modifiers.meta = event.metaKey;
  }

  /**
   * Check if any modifier key is pressed
   */
  static hasModifierPressed(state: KeyboardState): boolean {
    return (
      state.modifiers.shift ||
      state.modifiers.ctrl ||
      state.modifiers.alt ||
      state.modifiers.meta
    );
  }

  /**
   * Get movement vector from WASD or arrow keys
   */
  static getMovementVector(state: KeyboardState): Vector2Like {
    const movement = { x: 0, y: 0 };

    // Forward/Backward (Y axis)
    if (state.keys.get("KeyW") || state.keys.get("ArrowUp")) {
      movement.y += 1;
    }
    if (state.keys.get("KeyS") || state.keys.get("ArrowDown")) {
      movement.y -= 1;
    }

    // Left/Right (X axis)
    if (state.keys.get("KeyA") || state.keys.get("ArrowLeft")) {
      movement.x -= 1;
    }
    if (state.keys.get("KeyD") || state.keys.get("ArrowRight")) {
      movement.x += 1;
    }

    // Normalize diagonal movement
    if (movement.x !== 0 && movement.y !== 0) {
      const length = Math.sqrt(
        movement.x * movement.x + movement.y * movement.y
      );
      movement.x /= length;
      movement.y /= length;
    }

    return movement;
  }

  /**
   * Apply deadzone to a vector
   */
  static applyDeadzone(vector: Vector2Like, deadzone: number): Vector2Like {
    const magnitude = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

    if (magnitude < deadzone) {
      return { x: 0, y: 0 };
    }

    // Scale to remove deadzone effect
    const scale = (magnitude - deadzone) / (1 - deadzone);
    const normalizedMagnitude = Math.min(scale, 1);

    return {
      x: (vector.x / magnitude) * normalizedMagnitude,
      y: (vector.y / magnitude) * normalizedMagnitude,
    };
  }

  /**
   * Throttle function execution
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let lastExecution = 0;
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastExecution >= delay) {
        lastExecution = now;
        func(...args);
      }
    };
  }

  /**
   * Debounce function execution
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: number | undefined;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Find the first canvas element in the document
   */
  private static findCanvasElement(): HTMLCanvasElement | null {
    return document.querySelector("canvas");
  }

  /**
   * Clamp a value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Linear interpolation between two values
   */
  static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * this.clamp(t, 0, 1);
  }

  /**
   * Convert degrees to radians
   */
  static degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  static radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Calculate distance between two points
   */
  static distance(a: Vector2Like, b: Vector2Like): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate angle between two points
   */
  static angle(from: Vector2Like, to: Vector2Like): number {
    return Math.atan2(to.y - from.y, to.x - from.x);
  }
}
