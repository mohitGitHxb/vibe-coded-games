/**
 * Touch Integration Example
 * Demonstrates how to use the enhanced InputManager with touch and gesture support
 */

import { InputManager } from "../manager/InputManager.js";
import type { TouchGesture, TouchPoint } from "../types/InputTypes.js";

export class TouchIntegrationExample {
  private inputManager: InputManager;

  constructor(canvas: HTMLCanvasElement) {
    // Initialize InputManager with touch support
    this.inputManager = InputManager.getInstance({
      target: canvas,
      enableTouch: true,
      enableGestures: true,
      preventTouchDefaults: true,
      tapTimeout: 300,
      doubleTapTimeout: 300,
      longPressTimeout: 500,
      swipeThreshold: 50,
      pinchThreshold: 0.1,
      callbacks: {
        // Touch event callbacks
        onTouchStart: (touchPoint: TouchPoint, event: TouchEvent) => {
          this.handleTouchStart(touchPoint, event);
        },
        onTouchEnd: (touchPoint: TouchPoint, event: TouchEvent) => {
          this.handleTouchEnd(touchPoint, event);
        },
        onTouchMove: (touchPoint: TouchPoint, event: TouchEvent) => {
          this.handleTouchMove(touchPoint, event);
        },
        onTouchCancel: (touchPoint: TouchPoint, event: TouchEvent) => {
          this.handleTouchCancel(touchPoint, event);
        },

        // Gesture callbacks
        onTap: (gesture: TouchGesture) => {
          this.handleTap(gesture);
        },
        onDoubleTap: (gesture: TouchGesture) => {
          this.handleDoubleTap(gesture);
        },
        onLongPress: (gesture: TouchGesture) => {
          this.handleLongPress(gesture);
        },
        onSwipe: (gesture: TouchGesture) => {
          this.handleSwipe(gesture);
        },
        onDrag: (gesture: TouchGesture) => {
          this.handleDrag(gesture);
        },
        onPinch: (gesture: TouchGesture) => {
          this.handlePinch(gesture);
        },

        // Mouse callbacks for desktop fallback
        onMouseDown: (button, position, _event) => {
          console.log("Mouse down:", button, position);
        },
        onMouseMove: (_position, _event) => {
          // Handle mouse movement
        },
      },
    });

    this.inputManager.connect();
  }

  // === TOUCH EVENT HANDLERS ===

  private handleTouchStart(touchPoint: TouchPoint, _event: TouchEvent): void {
    console.log("Touch started:", {
      id: touchPoint.id,
      position: touchPoint.position,
      force: touchPoint.force,
      touchCount: this.inputManager.getTouchCount(),
    });

    // Example: Show visual feedback at touch position
    this.showTouchFeedback(
      touchPoint.position.canvas.x,
      touchPoint.position.canvas.y
    );
  }

  private handleTouchEnd(touchPoint: TouchPoint, _event: TouchEvent): void {
    console.log("Touch ended:", {
      id: touchPoint.id,
      remainingTouches: this.inputManager.getTouchCount(),
    });

    // Example: Hide visual feedback
    this.hideTouchFeedback(touchPoint.id);
  }

  private handleTouchMove(touchPoint: TouchPoint, _event: TouchEvent): void {
    // Example: Update object position based on touch movement
    if (this.inputManager.getTouchCount() === 1) {
      this.handleSingleTouchMove(touchPoint);
    } else if (this.inputManager.isMultiTouch()) {
      this.handleMultiTouchMove();
    }
  }

  private handleTouchCancel(touchPoint: TouchPoint, _event: TouchEvent): void {
    console.log("Touch cancelled:", touchPoint.id);
    this.hideTouchFeedback(touchPoint.id);
  }

  // === GESTURE HANDLERS ===

  private handleTap(gesture: TouchGesture): void {
    console.log("Tap gesture:", {
      position: gesture.startPosition,
      touchCount: gesture.touchCount,
    });

    // Example: Select object at tap position
    this.selectObjectAt(
      gesture.startPosition.canvas.x,
      gesture.startPosition.canvas.y
    );
  }

  private handleDoubleTap(gesture: TouchGesture): void {
    console.log("Double tap gesture:", gesture.startPosition);

    // Example: Zoom in at double tap position
    this.zoomInAt(
      gesture.startPosition.canvas.x,
      gesture.startPosition.canvas.y
    );
  }

  private handleLongPress(gesture: TouchGesture): void {
    console.log("Long press gesture:", {
      position: gesture.startPosition,
      duration: gesture.duration,
    });

    // Example: Show context menu
    this.showContextMenu(
      gesture.startPosition.canvas.x,
      gesture.startPosition.canvas.y
    );
  }

  private handleSwipe(gesture: TouchGesture): void {
    console.log("Swipe gesture:", {
      direction: gesture.direction,
      distance: gesture.distance,
      delta: gesture.deltaPosition,
    });

    // Example: Navigate based on swipe direction
    switch (gesture.direction) {
      case "left":
        this.navigateLeft();
        break;
      case "right":
        this.navigateRight();
        break;
      case "up":
        this.navigateUp();
        break;
      case "down":
        this.navigateDown();
        break;
    }
  }

  private handleDrag(gesture: TouchGesture): void {
    console.log("Drag gesture:", {
      start: gesture.startPosition,
      current: gesture.currentPosition,
      delta: gesture.deltaPosition,
      duration: gesture.duration,
    });

    // Example: Move object by drag delta
    this.moveObjectByDelta(gesture.deltaPosition.x, gesture.deltaPosition.y);
  }

  private handlePinch(gesture: TouchGesture): void {
    console.log("Pinch gesture:", {
      scale: gesture.scale,
      touchCount: gesture.touchCount,
    });

    // Example: Scale scene based on pinch
    if (gesture.scale) {
      this.scaleScene(gesture.scale);
    }
  }

  // === UTILITY METHODS ===

  private handleSingleTouchMove(touchPoint: TouchPoint): void {
    // Example: Rotate camera based on touch movement
    const deltaX = touchPoint.position.normalized.x * 10;
    const deltaY = touchPoint.position.normalized.y * 10;

    console.log("Single touch move:", { deltaX, deltaY });
    // Apply camera rotation here
  }

  private handleMultiTouchMove(): void {
    const touches = this.inputManager.getAllTouches();
    if (touches.length >= 2) {
      // Calculate center point and scale for multi-touch gestures
      const centerX =
        touches.reduce((sum, touch) => sum + touch.position.canvas.x, 0) /
        touches.length;
      const centerY =
        touches.reduce((sum, touch) => sum + touch.position.canvas.y, 0) /
        touches.length;

      console.log("Multi-touch center:", { centerX, centerY });
      // Handle multi-touch camera controls here
    }
  }

  // === EXAMPLE GAME ACTIONS ===

  private showTouchFeedback(x: number, y: number): void {
    // Example: Create visual touch indicator
    console.log(`Showing touch feedback at (${x}, ${y})`);
  }

  private hideTouchFeedback(touchId: number): void {
    // Example: Remove visual touch indicator
    console.log(`Hiding touch feedback for touch ${touchId}`);
  }

  private selectObjectAt(x: number, y: number): void {
    // Example: Ray casting to select 3D object
    console.log(`Selecting object at (${x}, ${y})`);
  }

  private zoomInAt(x: number, y: number): void {
    // Example: Zoom camera towards point
    console.log(`Zooming in at (${x}, ${y})`);
  }

  private showContextMenu(x: number, y: number): void {
    // Example: Show context menu
    console.log(`Showing context menu at (${x}, ${y})`);
  }

  private navigateLeft(): void {
    console.log("Navigate left");
    // Example: Move to previous level/screen
  }

  private navigateRight(): void {
    console.log("Navigate right");
    // Example: Move to next level/screen
  }

  private navigateUp(): void {
    console.log("Navigate up");
    // Example: Go to parent menu
  }

  private navigateDown(): void {
    console.log("Navigate down");
    // Example: Go to sub-menu
  }

  private moveObjectByDelta(deltaX: number, deltaY: number): void {
    console.log(`Moving object by (${deltaX}, ${deltaY})`);
    // Example: Move selected object
  }

  private scaleScene(scale: number): void {
    console.log(`Scaling scene by ${scale}`);
    // Example: Zoom scene
  }

  // === PUBLIC API ===

  /**
   * Check if touch is currently active
   */
  public isTouchActive(): boolean {
    return this.inputManager.isTouchActive();
  }

  /**
   * Get current touch count
   */
  public getTouchCount(): number {
    return this.inputManager.getTouchCount();
  }

  /**
   * Check if multi-touch is active
   */
  public isMultiTouch(): boolean {
    return this.inputManager.isMultiTouch();
  }

  /**
   * Get specific touch by ID
   */
  public getTouch(touchId: number): TouchPoint | undefined {
    return this.inputManager.getTouch(touchId);
  }

  /**
   * Get all active touches
   */
  public getAllTouches(): TouchPoint[] {
    return this.inputManager.getAllTouches();
  }

  /**
   * Disconnect input manager
   */
  public destroy(): void {
    this.inputManager.disconnect();
  }
}

// === USAGE EXAMPLE ===

export function createTouchExample(
  canvas: HTMLCanvasElement
): TouchIntegrationExample {
  return new TouchIntegrationExample(canvas);
}

// Example initialization:
/*
const canvas = document.querySelector('canvas')!;
const touchExample = createTouchExample(canvas);

// Use the touch system
console.log('Touch active:', touchExample.isTouchActive());
console.log('Touch count:', touchExample.getTouchCount());
console.log('Multi-touch:', touchExample.isMultiTouch());

// Clean up when done
// touchExample.destroy();
*/
