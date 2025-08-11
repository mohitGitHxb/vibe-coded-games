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

  // Gesture tracking properties
  private gestureState: {
    lastTapTime: number;
    lastTapPosition: { x: number; y: number } | null;
    longPressTimer: number | null;
    dragStart: { position: MousePosition; time: number } | null;
    pinchStart: {
      distance: number;
      scale: number;
      center: { x: number; y: number };
    } | null;
  } = {
    lastTapTime: 0,
    lastTapPosition: null,
    longPressTimer: null,
    dragStart: null,
    pinchStart: null,
  };

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

    // Touch events (if enabled)
    if (this.config.enableTouch) {
      this.addEventListener(target, "touchstart", (e) =>
        this.handleTouchStart(e as TouchEvent)
      );
      this.addEventListener(target, "touchend", (e) =>
        this.handleTouchEnd(e as TouchEvent)
      );
      this.addEventListener(target, "touchmove", (e) =>
        this.handleTouchMove(e as TouchEvent)
      );
      this.addEventListener(target, "touchcancel", (e) =>
        this.handleTouchCancel(e as TouchEvent)
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
   * Check if touch is currently active
   */
  public isTouchActive(): boolean {
    return this.state.touch.isActive;
  }

  /**
   * Get number of active touches
   */
  public getTouchCount(): number {
    return this.state.touch.touches.size;
  }

  /**
   * Get a specific touch by ID
   */
  public getTouch(touchId: number): TouchPoint | undefined {
    return this.state.touch.touches.get(touchId);
  }

  /**
   * Get all active touch points
   */
  public getAllTouches(): TouchPoint[] {
    return Array.from(this.state.touch.touches.values());
  }

  /**
   * Check if multi-touch is active (2+ touches)
   */
  public isMultiTouch(): boolean {
    return this.state.touch.touches.size >= 2;
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

  // === TOUCH EVENT HANDLERS ===

  /**
   * Handle touch start events
   */
  private handleTouchStart(event: TouchEvent): void {
    if (this.config.preventTouchDefaults) {
      event.preventDefault();
    }

    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    const touch = event.changedTouches[0];
    const touchPoint = InputCore.createTouchPoint(
      touch,
      this.canvas || undefined
    );

    // Update touch state
    this.state.touch.touches.set(touch.identifier, touchPoint);
    this.state.touch.isActive = true;

    // Handle gestures if enabled
    if (this.config.enableGestures) {
      this.handleGestureStart(event, touchPoint);
    }

    // Fire callback
    if (this.config.callbacks?.onTouchStart) {
      this.config.callbacks.onTouchStart(touchPoint, event);
    }

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Touch start:", touchPoint);
    }
  }

  /**
   * Handle touch end events
   */
  private handleTouchEnd(event: TouchEvent): void {
    if (this.config.preventTouchDefaults) {
      event.preventDefault();
    }

    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    const touch = event.changedTouches[0];
    const touchPoint = this.state.touch.touches.get(touch.identifier);

    if (touchPoint) {
      // Handle gestures if enabled
      if (this.config.enableGestures) {
        this.handleGestureEnd(event, touchPoint);
      }

      // Fire callback
      if (this.config.callbacks?.onTouchEnd) {
        this.config.callbacks.onTouchEnd(touchPoint, event);
      }

      // Remove from touch state
      this.state.touch.touches.delete(touch.identifier);
    }

    // Update touch state
    if (this.state.touch.touches.size === 0) {
      this.state.touch.isActive = false;
    }

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Touch end:", touchPoint);
    }
  }

  /**
   * Handle touch move events
   */
  private handleTouchMove(event: TouchEvent): void {
    if (this.config.preventTouchDefaults) {
      event.preventDefault();
    }

    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    const touch = event.changedTouches[0];
    const touchPoint = InputCore.createTouchPoint(
      touch,
      this.canvas || undefined
    );

    // Update touch state
    this.state.touch.touches.set(touch.identifier, touchPoint);

    // Handle gestures if enabled
    if (this.config.enableGestures) {
      this.handleGestureMove(event, touchPoint);
    }

    // Fire callback
    if (this.config.callbacks?.onTouchMove) {
      this.config.callbacks.onTouchMove(touchPoint, event);
    }

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Touch move:", touchPoint);
    }
  }

  /**
   * Handle touch cancel events
   */
  private handleTouchCancel(event: TouchEvent): void {
    if (this.config.preventTouchDefaults) {
      event.preventDefault();
    }

    if (this.config.stopPropagation) {
      event.stopPropagation();
    }

    const touch = event.changedTouches[0];
    const touchPoint = this.state.touch.touches.get(touch.identifier);

    if (touchPoint) {
      // Clean up gesture state
      this.cleanupGestureState();

      // Fire callback
      if (this.config.callbacks?.onTouchCancel) {
        this.config.callbacks.onTouchCancel(touchPoint, event);
      }

      // Remove from touch state
      this.state.touch.touches.delete(touch.identifier);
    }

    // Update touch state
    if (this.state.touch.touches.size === 0) {
      this.state.touch.isActive = false;
    }

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Touch cancel:", touchPoint);
    }
  }

  // === GESTURE HANDLING ===

  /**
   * Handle gesture start
   */
  private handleGestureStart(event: TouchEvent, touchPoint: TouchPoint): void {
    const now = Date.now();

    // Check for long press
    this.gestureState.longPressTimer = window.setTimeout(() => {
      this.fireLongPressGesture(touchPoint);
    }, this.config.longPressTimeout || 500);

    // Set drag start
    this.gestureState.dragStart = {
      position: touchPoint.position,
      time: now,
    };

    // Handle pinch start (if multi-touch)
    if (event.touches.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = InputCore.getTouchDistance(touch1, touch2);
      const center = InputCore.getTouchCenter(touch1, touch2);

      this.gestureState.pinchStart = {
        distance,
        scale: 1,
        center,
      };
    }
  }

  /**
   * Handle gesture move
   */
  private handleGestureMove(event: TouchEvent, touchPoint: TouchPoint): void {
    // Clear long press if moving
    if (this.gestureState.longPressTimer) {
      clearTimeout(this.gestureState.longPressTimer);
      this.gestureState.longPressTimer = null;
    }

    // Handle drag
    if (this.gestureState.dragStart) {
      const deltaX =
        touchPoint.position.canvas.x -
        this.gestureState.dragStart.position.canvas.x;
      const deltaY =
        touchPoint.position.canvas.y -
        this.gestureState.dragStart.position.canvas.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > (this.config.swipeThreshold || 50) * 0.1) {
        this.fireDragGesture(touchPoint, this.gestureState.dragStart);
      }
    }

    // Handle pinch
    if (event.touches.length === 2 && this.gestureState.pinchStart) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const distance = InputCore.getTouchDistance(touch1, touch2);
      const scale = distance / this.gestureState.pinchStart.distance;

      if (
        Math.abs(scale - this.gestureState.pinchStart.scale) >
        (this.config.pinchThreshold || 0.1)
      ) {
        this.firePinchGesture(touchPoint, scale);
        this.gestureState.pinchStart.scale = scale;
      }
    }
  }

  /**
   * Handle gesture end
   */
  private handleGestureEnd(_event: TouchEvent, touchPoint: TouchPoint): void {
    const now = Date.now();

    // Clear long press timer
    if (this.gestureState.longPressTimer) {
      clearTimeout(this.gestureState.longPressTimer);
      this.gestureState.longPressTimer = null;
    }

    // Handle tap/double tap
    if (this.gestureState.dragStart) {
      const deltaX =
        touchPoint.position.canvas.x -
        this.gestureState.dragStart.position.canvas.x;
      const deltaY =
        touchPoint.position.canvas.y -
        this.gestureState.dragStart.position.canvas.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const duration = now - this.gestureState.dragStart.time;

      if (distance < 10 && duration < (this.config.tapTimeout || 300)) {
        // Check for double tap
        if (
          this.gestureState.lastTapTime &&
          now - this.gestureState.lastTapTime <
            (this.config.doubleTapTimeout || 300) &&
          this.gestureState.lastTapPosition
        ) {
          const tapDistance = Math.sqrt(
            Math.pow(
              touchPoint.position.canvas.x -
                this.gestureState.lastTapPosition.x,
              2
            ) +
              Math.pow(
                touchPoint.position.canvas.y -
                  this.gestureState.lastTapPosition.y,
                2
              )
          );

          if (tapDistance < 50) {
            this.fireDoubleTapGesture(touchPoint);
            this.gestureState.lastTapTime = 0; // Reset to prevent triple tap
            return;
          }
        }

        // Single tap
        this.fireTapGesture(touchPoint);
        this.gestureState.lastTapTime = now;
        this.gestureState.lastTapPosition = {
          x: touchPoint.position.canvas.x,
          y: touchPoint.position.canvas.y,
        };
      } else if (distance > (this.config.swipeThreshold || 50)) {
        // Swipe gesture
        const velocity = InputCore.calculateVelocity(distance, duration);
        this.fireSwipeGesture(
          touchPoint,
          this.gestureState.dragStart,
          velocity
        );
      }
    }

    // Clean up gesture state
    this.cleanupGestureState();
  }

  /**
   * Clean up gesture state
   */
  private cleanupGestureState(): void {
    if (this.gestureState.longPressTimer) {
      clearTimeout(this.gestureState.longPressTimer);
      this.gestureState.longPressTimer = null;
    }
    this.gestureState.dragStart = null;
    this.gestureState.pinchStart = null;
  }

  // === GESTURE FIRE METHODS ===

  private fireTapGesture(touchPoint: TouchPoint): void {
    const gesture = {
      type: "tap" as const,
      startPosition: touchPoint.position,
      currentPosition: touchPoint.position,
      deltaPosition: { x: 0, y: 0 },
      duration: 0,
      touchCount: 1,
    };

    if (this.config.callbacks?.onTap) {
      this.config.callbacks.onTap(gesture);
    }

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Tap gesture:", gesture);
    }
  }

  private fireDoubleTapGesture(touchPoint: TouchPoint): void {
    const gesture = {
      type: "doubleTap" as const,
      startPosition: touchPoint.position,
      currentPosition: touchPoint.position,
      deltaPosition: { x: 0, y: 0 },
      duration: 0,
      touchCount: 1,
    };

    if (this.config.callbacks?.onDoubleTap) {
      this.config.callbacks.onDoubleTap(gesture);
    }

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Double tap gesture:", gesture);
    }
  }

  private fireLongPressGesture(touchPoint: TouchPoint): void {
    const gesture = {
      type: "longPress" as const,
      startPosition: touchPoint.position,
      currentPosition: touchPoint.position,
      deltaPosition: { x: 0, y: 0 },
      duration: this.config.longPressTimeout || 500,
      touchCount: 1,
    };

    if (this.config.callbacks?.onLongPress) {
      this.config.callbacks.onLongPress(gesture);
    }

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Long press gesture:", gesture);
    }
  }

  private fireDragGesture(
    touchPoint: TouchPoint,
    dragStart: { position: MousePosition; time: number }
  ): void {
    const deltaX = touchPoint.position.canvas.x - dragStart.position.canvas.x;
    const deltaY = touchPoint.position.canvas.y - dragStart.position.canvas.y;

    const gesture = {
      type: "drag" as const,
      startPosition: dragStart.position,
      currentPosition: touchPoint.position,
      deltaPosition: { x: deltaX, y: deltaY },
      duration: Date.now() - dragStart.time,
      touchCount: 1,
    };

    if (this.config.callbacks?.onDrag) {
      this.config.callbacks.onDrag(gesture);
    }

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Drag gesture:", gesture);
    }
  }

  private fireSwipeGesture(
    touchPoint: TouchPoint,
    dragStart: { position: MousePosition; time: number },
    velocity: number
  ): void {
    const deltaX = touchPoint.position.canvas.x - dragStart.position.canvas.x;
    const deltaY = touchPoint.position.canvas.y - dragStart.position.canvas.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const direction = InputCore.getSwipeDirection(deltaX, deltaY);

    const gesture = {
      type: "swipe" as const,
      startPosition: dragStart.position,
      currentPosition: touchPoint.position,
      deltaPosition: { x: deltaX, y: deltaY },
      distance,
      direction,
      duration: Date.now() - dragStart.time,
      touchCount: 1,
    };

    if (this.config.callbacks?.onSwipe) {
      this.config.callbacks.onSwipe(gesture);
    }

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Swipe gesture:", gesture, "velocity:", velocity);
    }
  }

  private firePinchGesture(touchPoint: TouchPoint, scale: number): void {
    const gesture = {
      type: "pinch" as const,
      startPosition: touchPoint.position,
      currentPosition: touchPoint.position,
      deltaPosition: { x: 0, y: 0 },
      scale,
      duration: 0,
      touchCount: 2,
    };

    if (this.config.callbacks?.onPinch) {
      this.config.callbacks.onPinch(gesture);
    }

    if (DEBUG_SETTINGS.LOG_INPUT_EVENTS) {
      console.log("Pinch gesture:", gesture);
    }
  }
}
