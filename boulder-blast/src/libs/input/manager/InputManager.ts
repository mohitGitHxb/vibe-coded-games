/**
 * Input Manager - Singleton class for centralized input handling
 */

import type {
  InputManagerConfig,
  InputManagerState,
  MousePosition,
  MouseButton,
  KeyboardState,
  MouseState,
  TouchState,
  TouchPoint,
  Vector2Like,
} from "../types/InputTypes.js";

import { InputCore } from "../core/InputCore.js";
import {
  INPUT_MANAGER_DEFAULTS,
  EVENT_THROTTLING,
  DEBUG_SETTINGS,
} from "../constants/InputConstants.js";

/**
 * Singleton InputManager class for handling all user input
 */
export class InputManager {
  private static instance: InputManager | null = null;

  private state: InputManagerState;
  private config: InputManagerConfig;
  private eventListeners: Map<string, EventListener> = new Map();
  private canvas: HTMLCanvasElement | null = null;

  // Throttled event handlers
  private throttledMouseMove: (event: MouseEvent) => void;
  private throttledWheel: (event: WheelEvent) => void;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor(config: InputManagerConfig = {}) {
    this.config = { ...INPUT_MANAGER_DEFAULTS, ...config };

    this.state = {
      keyboard: InputCore.createEmptyKeyboardState(),
      mouse: InputCore.createEmptyMouseState(),
      touch: InputCore.createEmptyTouchState(),
      isConnected: false,
    };

    // Create throttled event handlers
    this.throttledMouseMove = InputCore.throttle(
      this.handleMouseMove.bind(this),
      EVENT_THROTTLING.MOUSE_MOVE_THROTTLE_MS
    );

    this.throttledWheel = InputCore.throttle(
      this.handleWheel.bind(this),
      EVENT_THROTTLING.WHEEL_THROTTLE_MS
    );

    this.findCanvas();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(config?: InputManagerConfig): InputManager {
    if (!InputManager.instance) {
      InputManager.instance = new InputManager(config);
    }
    return InputManager.instance;
  }

  /**
   * Destroy the singleton instance
   */
  public static destroyInstance(): void {
    if (InputManager.instance) {
      InputManager.instance.disconnect();
      InputManager.instance = null;
    }
  }

  /**
   * Connect event listeners
   */
  public connect(): void {
    if (this.state.isConnected) {
      console.warn("InputManager is already connected");
      return;
    }

    const target = this.config.target || document;

    // Keyboard events - always attach to window for global keyboard capture
    this.addEventListener(window, "keydown", (e) =>
      this.handleKeyDown(e as KeyboardEvent)
    );
    this.addEventListener(window, "keyup", (e) =>
      this.handleKeyUp(e as KeyboardEvent)
    );

    // Mouse events
    this.addEventListener(target, "mousedown", (e) =>
      this.handleMouseDown(e as MouseEvent)
    );
    this.addEventListener(target, "mouseup", (e) =>
      this.handleMouseUp(e as MouseEvent)
    );
    this.addEventListener(target, "mousemove", (e) =>
      this.throttledMouseMove(e as MouseEvent)
    );
    this.addEventListener(target, "wheel", (e) =>
      this.throttledWheel(e as WheelEvent)
    );

    if (this.config.trackMouseLeave) {
      this.addEventListener(target, "mouseleave", () =>
        this.handleMouseLeave()
      );
      this.addEventListener(target, "mouseenter", () =>
        this.handleMouseEnter()
      );
    }

    // Context menu prevention (optional)
    if (this.config.preventDefault) {
      this.addEventListener(target, "contextmenu", (e) =>
        this.handleContextMenu(e)
      );
    }

    // Touch events
    this.addEventListener(target, "touchstart", (e) =>
      this.handleTouchStart(e as TouchEvent)
    );
    this.addEventListener(target, "touchmove", (e) =>
      this.handleTouchMove(e as TouchEvent)
    );
    this.addEventListener(target, "touchend", (e) =>
      this.handleTouchEnd(e as TouchEvent)
    );
    this.addEventListener(target, "touchcancel", (e) =>
      this.handleTouchCancel(e as TouchEvent)
    );

    // Window focus events to reset state
    this.addEventListener(window, "blur", () => this.handleWindowBlur());
    this.addEventListener(window, "focus", () => this.handleWindowFocus());

    this.state.isConnected = true;

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("InputManager connected");
    }
  }

  /**
   * Disconnect event listeners
   */
  public disconnect(): void {
    if (!this.state.isConnected) {
      return;
    }

    // Remove all event listeners
    this.eventListeners.forEach((listener, eventKey) => {
      const [eventType, targetType] = eventKey.split(":::");
      const target =
        targetType === "window" ? window : this.config.target || document;
      target.removeEventListener(eventType, listener as EventListener);
    });

    this.eventListeners.clear();
    this.resetState();
    this.state.isConnected = false;

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("InputManager disconnected");
    }
  }

  /**
   * Check if a key is currently pressed
   */
  public isKeyDown(key: string): boolean {
    return this.state.keyboard.keys.get(key) || false;
  }

  /**
   * Check if any of the provided keys are pressed
   */
  public isAnyKeyDown(keys: string[]): boolean {
    return keys.some((key) => this.isKeyDown(key));
  }

  /**
   * Check if all of the provided keys are pressed
   */
  public areAllKeysDown(keys: string[]): boolean {
    return keys.every((key) => this.isKeyDown(key));
  }

  /**
   * Check if a mouse button is currently pressed
   */
  public isMouseButtonDown(button: MouseButton): boolean {
    return this.state.mouse.buttons.get(button) || false;
  }

  /**
   * Get current mouse position
   */
  public getMousePosition(): MousePosition {
    return this.state.mouse.position;
  }

  /**
   * Get normalized mouse position (-1 to 1)
   */
  public getNormalizedMousePosition(): Vector2Like {
    return this.state.mouse.position.normalized;
  }

  /**
   * Get mouse wheel delta
   */
  public getMouseWheelDelta(): Vector2Like {
    return {
      x: this.state.mouse.wheel.deltaX,
      y: this.state.mouse.wheel.deltaY,
    };
  }

  /**
   * Get movement vector from WASD or arrow keys
   */
  public getMovementVector(): Vector2Like {
    return InputCore.getMovementVector(this.state.keyboard);
  }

  /**
   * Get movement vector with deadzone applied
   */
  public getMovementVectorWithDeadzone(deadzone: number): Vector2Like {
    const movement = this.getMovementVector();
    return InputCore.applyDeadzone(movement, deadzone);
  }

  /**
   * Check if mouse is over the canvas
   */
  public isMouseOverCanvas(): boolean {
    return this.state.mouse.isOverCanvas;
  }

  /**
   * Get current keyboard state (read-only)
   */
  public getKeyboardState(): Readonly<KeyboardState> {
    return this.state.keyboard;
  }

  /**
   * Get current mouse state (read-only)
   */
  public getMouseState(): Readonly<MouseState> {
    return this.state.mouse;
  }

  /**
   * Get current touch state (read-only)
   */
  public getTouchState(): Readonly<TouchState> {
    return this.state.touch;
  }

  /**
   * Check if there are active touches
   */
  public isTouchActive(): boolean {
    return this.state.touch.isActive && this.state.touch.touches.size > 0;
  }

  /**
   * Get the first (primary) touch point
   */
  public getPrimaryTouch(): TouchPoint | null {
    if (this.state.touch.touches.size === 0) return null;
    return this.state.touch.touches.values().next().value || null;
  }

  /**
   * Get normalized touch movement vector for the primary touch
   * This is useful for controlling spaceship movement
   */
  public getTouchMovementVector(): Vector2Like {
    const primaryTouch = this.getPrimaryTouch();
    if (!primaryTouch) {
      return { x: 0, y: 0 };
    }

    // Convert normalized coordinates to movement vector
    // Touch at center (0,0) = no movement
    // Touch at edges = movement in that direction
    return {
      x: primaryTouch.position.normalized.x,
      y: -primaryTouch.position.normalized.y, // Invert Y for game coordinates
    };
  }

  /**
   * Get touch position relative to canvas center
   * Returns values from -1 to 1 for both x and y
   */
  public getTouchDirection(): Vector2Like {
    const primaryTouch = this.getPrimaryTouch();
    if (!primaryTouch) {
      return { x: 0, y: 0 };
    }

    return {
      x: primaryTouch.position.normalized.x,
      y: primaryTouch.position.normalized.y,
    };
  }

  /**
   * Check if any modifier key is pressed
   */
  public hasModifierPressed(): boolean {
    return InputCore.hasModifierPressed(this.state.keyboard);
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<InputManagerConfig>): void {
    const wasConnected = this.state.isConnected;

    if (wasConnected) {
      this.disconnect();
    }

    this.config = { ...this.config, ...newConfig };

    if (wasConnected) {
      this.connect();
    }
  }

  /**
   * Reset input state
   */
  public resetState(): void {
    this.state.keyboard = InputCore.createEmptyKeyboardState();
    this.state.mouse = InputCore.createEmptyMouseState();
    this.state.touch = InputCore.createEmptyTouchState();
  }

  /**
   * Set canvas reference for coordinate calculations
   */
  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  // === PRIVATE EVENT HANDLERS ===

  private handleKeyDown(event: KeyboardEvent): void {
    if (!event.code) {
      return;
    }

    this.state.keyboard.keys.set(event.code, true);
    InputCore.updateKeyboardModifiers(this.state.keyboard, event);

    if (this.config.preventDefault) {
      event.preventDefault();
    }
    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    this.config.callbacks?.onKeyDown?.(event.code, event);

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Key down:", event.code);
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (!event.code) {
      return;
    }

    this.state.keyboard.keys.set(event.code, false);
    InputCore.updateKeyboardModifiers(this.state.keyboard, event);

    if (this.config.preventDefault) {
      event.preventDefault();
    }
    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    this.config.callbacks?.onKeyUp?.(event.code, event);

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Key up:", event.code);
    }
  }

  private handleMouseDown(event: MouseEvent): void {
    if (!InputCore.isValidMouseButton(event.button)) {
      return;
    }

    this.state.mouse.buttons.set(event.button as MouseButton, true);
    this.updateMousePosition(event);

    if (this.config.preventDefault) {
      event.preventDefault();
    }
    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    this.config.callbacks?.onMouseDown?.(
      event.button as MouseButton,
      this.state.mouse.position,
      event
    );

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Mouse down:", event.button);
    }
  }

  private handleMouseUp(event: MouseEvent): void {
    if (!InputCore.isValidMouseButton(event.button)) {
      return;
    }

    this.state.mouse.buttons.set(event.button as MouseButton, false);
    this.updateMousePosition(event);

    if (this.config.preventDefault) {
      event.preventDefault();
    }
    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    this.config.callbacks?.onMouseUp?.(
      event.button as MouseButton,
      this.state.mouse.position,
      event
    );

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Mouse up:", event.button);
    }
  }

  private handleMouseMove(event: MouseEvent): void {
    this.updateMousePosition(event);

    if (this.config.preventDefault) {
      event.preventDefault();
    }
    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    this.config.callbacks?.onMouseMove?.(this.state.mouse.position, event);
  }

  private handleWheel(event: WheelEvent): void {
    const normalizedDelta = InputCore.normalizeWheelDelta(event);

    this.state.mouse.wheel = {
      deltaX: normalizedDelta.x,
      deltaY: normalizedDelta.y,
      deltaZ: event.deltaZ || 0,
    };

    if (this.config.preventDefault) {
      event.preventDefault();
    }
    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    this.config.callbacks?.onWheel?.(this.state.mouse.wheel, event);

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Wheel:", this.state.mouse.wheel);
    }
  }

  private handleMouseLeave(): void {
    this.state.mouse.isOverCanvas = false;
  }

  private handleMouseEnter(): void {
    this.state.mouse.isOverCanvas = true;
  }

  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length === 0) return;

    this.state.touch.isActive = true;
    this.state.touch.touches.clear();

    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const rect = this.canvas?.getBoundingClientRect() || {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      };

      const touchPoint: TouchPoint = {
        id: touch.identifier,
        position: {
          screen: { x: touch.screenX, y: touch.screenY },
          canvas: { x: touch.clientX - rect.left, y: touch.clientY - rect.top },
          normalized: {
            x: rect.width
              ? ((touch.clientX - rect.left) / rect.width) * 2 - 1
              : 0,
            y: rect.height
              ? -(((touch.clientY - rect.top) / rect.height) * 2 - 1)
              : 0,
          },
        },
        force: (touch as any).force || 1.0,
      };

      this.state.touch.touches.set(touch.identifier, touchPoint);
    }

    if (this.config.preventDefault) {
      event.preventDefault();
    }
    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Touch start:", this.state.touch);
    }
  }

  private handleTouchMove(event: TouchEvent): void {
    if (!this.state.touch.isActive || event.touches.length === 0) return;

    const rect = this.canvas?.getBoundingClientRect() || {
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    };

    for (let i = 0; i < event.touches.length; i++) {
      const touch = event.touches[i];
      const existingTouch = this.state.touch.touches.get(touch.identifier);

      if (existingTouch) {
        const touchPoint: TouchPoint = {
          id: touch.identifier,
          position: {
            screen: { x: touch.screenX, y: touch.screenY },
            canvas: {
              x: touch.clientX - rect.left,
              y: touch.clientY - rect.top,
            },
            normalized: {
              x: rect.width
                ? ((touch.clientX - rect.left) / rect.width) * 2 - 1
                : 0,
              y: rect.height
                ? -(((touch.clientY - rect.top) / rect.height) * 2 - 1)
                : 0,
            },
          },
          force: (touch as any).force || 1.0,
        };

        this.state.touch.touches.set(touch.identifier, touchPoint);
      }
    }

    if (this.config.preventDefault) {
      event.preventDefault();
    }
    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Touch move:", this.state.touch);
    }
  }

  private handleTouchEnd(event: TouchEvent): void {
    // Remove ended touches
    for (let i = 0; i < event.changedTouches.length; i++) {
      const touch = event.changedTouches[i];
      this.state.touch.touches.delete(touch.identifier);
    }

    // Deactivate if no touches remain
    if (this.state.touch.touches.size === 0) {
      this.state.touch.isActive = false;
    }

    if (this.config.preventDefault) {
      event.preventDefault();
    }
    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Touch end:", this.state.touch);
    }
  }

  private handleTouchCancel(event: TouchEvent): void {
    // Same behavior as touch end
    this.handleTouchEnd(event);
  }

  private handleContextMenu(event: Event): void {
    event.preventDefault();
  }

  private handleWindowBlur(): void {
    // Reset all input state when window loses focus
    this.resetState();
  }

  private handleWindowFocus(): void {
    // Optional: could emit a focus regained event
  }

  // === PRIVATE HELPER METHODS ===

  private addEventListener(
    target: EventTarget,
    eventType: string,
    handler: EventListener
  ): void {
    const targetType = target === window ? "window" : "default";
    const key = `${eventType}:::${targetType}`;

    target.addEventListener(eventType, handler);
    this.eventListeners.set(key, handler);
  }

  private updateMousePosition(event: MouseEvent): void {
    this.state.mouse.position = InputCore.createMousePosition(
      event,
      this.canvas || undefined
    );
  }

  private findCanvas(): void {
    if (typeof document !== "undefined") {
      this.canvas = document.querySelector("canvas");
    }
  }
}
