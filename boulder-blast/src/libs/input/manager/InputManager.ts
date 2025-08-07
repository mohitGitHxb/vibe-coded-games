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
