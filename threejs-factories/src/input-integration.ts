/**
 * Input Integration for Main Demo - Clean integration with existing camera controls
 */

import { InputManager, KeyCode, MouseButton } from "./factories.js";

/**
 * Simple input controller that integrates with the main demo
 */
export class DemoInputController {
  private inputManager: InputManager;
  private isEnabled = false;

  // Camera control settings
  private mouseSensitivity = 0.002;
  private cameraSpeed = 0.1;
  private zoomSpeed = 0.5;

  // State tracking
  private lastMousePosition = { x: 0, y: 0 };
  private mouseDown = false;

  constructor() {
    this.inputManager = InputManager.getInstance({
      preventDefault: false,
      trackMouseLeave: true,
      callbacks: {
        onKeyDown: (key) => this.handleKeyDown(key),
        onMouseDown: (button, position) =>
          this.handleMouseDown(button, position),
        onMouseUp: (button) => this.handleMouseUp(button),
        onMouseMove: (position) => this.handleMouseMove(position),
        onWheel: (delta) => this.handleWheel(delta),
      },
    });
  }

  /**
   * Enable input handling
   */
  public enable(): void {
    if (this.isEnabled) return;

    this.inputManager.connect();
    this.isEnabled = true;
    console.log("🎮 Input controls enabled:");
    console.log("  - Mouse drag: Rotate camera");
    console.log("  - Mouse wheel: Zoom in/out");
    console.log("  - WASD: Move camera");
    console.log("  - Space: Pause/Resume rotation");
    console.log("  - R: Reset camera");
    console.log("  - 1-5: Quick material selection");
  }

  /**
   * Disable input handling
   */
  public disable(): void {
    if (!this.isEnabled) return;

    this.inputManager.disconnect();
    this.isEnabled = false;
    console.log("🎮 Input controls disabled");
  }

  /**
   * Get camera control values (for integration with main demo)
   */
  public getCameraControls() {
    if (!this.isEnabled) {
      return {
        angleOffset: 0,
        radiusOffset: 0,
        heightOffset: 0,
        shouldPause: false,
        shouldReset: false,
      };
    }

    // Calculate offsets based on input
    const movement = this.inputManager.getMovementVector();

    return {
      angleOffset: movement.x * this.cameraSpeed,
      radiusOffset: 0, // Will be handled by wheel
      heightOffset: movement.y * this.cameraSpeed,
      shouldPause: false, // Handled by key events
      shouldReset: false, // Handled by key events
    };
  }

  /**
   * Get current input state for display
   */
  public getInputState() {
    if (!this.isEnabled) {
      return {
        keysPressed: [],
        mouseButtons: [],
        mousePosition: { x: 0, y: 0 },
        movementVector: { x: 0, y: 0 },
      };
    }

    const keyboardState = this.inputManager.getKeyboardState();
    const mouseState = this.inputManager.getMouseState();

    const keysPressed = [];
    for (const [key, pressed] of keyboardState.keys) {
      if (pressed) keysPressed.push(key);
    }

    const mouseButtons = [];
    for (const [button, pressed] of mouseState.buttons) {
      if (pressed) mouseButtons.push(button);
    }

    return {
      keysPressed,
      mouseButtons,
      mousePosition: this.inputManager.getNormalizedMousePosition(),
      movementVector: this.inputManager.getMovementVector(),
    };
  }

  // === EVENT HANDLERS ===

  private handleKeyDown(key: string): void {
    // These events can be listened to by the main demo
    const event = new CustomEvent("demoInputAction", {
      detail: { type: "keydown", key },
    });
    window.dispatchEvent(event);

    switch (key) {
      case KeyCode.Space:
        this.dispatchCameraAction("togglePause");
        break;
      case KeyCode.R:
        this.dispatchCameraAction("reset");
        break;
      case KeyCode.Digit1:
        this.dispatchMaterialAction("grass");
        break;
      case KeyCode.Digit2:
        this.dispatchMaterialAction("metal");
        break;
      case KeyCode.Digit3:
        this.dispatchMaterialAction("wood");
        break;
      case KeyCode.Digit4:
        this.dispatchMaterialAction("water");
        break;
      case KeyCode.Digit5:
        this.dispatchMaterialAction("glass");
        break;
    }
  }

  private handleMouseDown(button: MouseButton, position: any): void {
    if (button === MouseButton.Left) {
      this.mouseDown = true;
      this.lastMousePosition = position.normalized;
    }

    const event = new CustomEvent("demoInputAction", {
      detail: { type: "mousedown", button, position },
    });
    window.dispatchEvent(event);
  }

  private handleMouseUp(button: MouseButton): void {
    if (button === MouseButton.Left) {
      this.mouseDown = false;
    }

    const event = new CustomEvent("demoInputAction", {
      detail: { type: "mouseup", button },
    });
    window.dispatchEvent(event);
  }

  private handleMouseMove(position: any): void {
    if (this.mouseDown) {
      const deltaX = position.normalized.x - this.lastMousePosition.x;
      const deltaY = position.normalized.y - this.lastMousePosition.y;

      this.dispatchCameraAction("rotate", {
        deltaX: deltaX * this.mouseSensitivity,
        deltaY: deltaY * this.mouseSensitivity,
      });

      this.lastMousePosition = position.normalized;
    }
  }

  private handleWheel(delta: any): void {
    this.dispatchCameraAction("zoom", {
      delta: -delta.deltaY * this.zoomSpeed * 0.01,
    });
  }

  // === HELPER METHODS ===

  private dispatchCameraAction(action: string, data?: any): void {
    const event = new CustomEvent("demoCameraAction", {
      detail: { action, ...data },
    });
    window.dispatchEvent(event);
  }

  private dispatchMaterialAction(materialType: string): void {
    const event = new CustomEvent("demoMaterialAction", {
      detail: { materialType },
    });
    window.dispatchEvent(event);
  }
}

/**
 * Simple input state display for the demo UI
 */
export function createInputStatusDisplay(): HTMLElement {
  const container = document.createElement("div");
  container.id = "input-status";
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 15px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    border: 1px solid rgba(79, 195, 247, 0.3);
    min-width: 200px;
    display: none;
  `;

  container.innerHTML = `
    <div style="color: #4fc3f7; font-weight: bold; margin-bottom: 8px;">🎮 Input Controls</div>
    <div>Keys: <span id="keys-display">None</span></div>
    <div>Mouse: <span id="mouse-display">Not clicked</span></div>
    <div>Position: <span id="position-display">(0, 0)</span></div>
    <div style="margin-top: 8px; font-size: 10px; color: #888;">
      WASD: Camera | Mouse: Rotate | Wheel: Zoom | Space: Pause | R: Reset | 1-5: Materials
    </div>
  `;

  return container;
}

/**
 * Update the input status display
 */
export function updateInputStatusDisplay(
  inputController: DemoInputController
): void {
  const container = document.getElementById("input-status");
  if (!container) return;

  const state = inputController.getInputState();

  // Update keys display
  const keysDisplay = document.getElementById("keys-display");
  if (keysDisplay) {
    const keyNames = state.keysPressed.map((key) => {
      const shortNames: Record<string, string> = {
        KeyW: "W",
        KeyA: "A",
        KeyS: "S",
        KeyD: "D",
        Space: "Space",
        KeyR: "R",
        Digit1: "1",
        Digit2: "2",
        Digit3: "3",
        Digit4: "4",
        Digit5: "5",
      };
      return shortNames[key] || key;
    });
    keysDisplay.textContent =
      keyNames.length > 0 ? keyNames.join(", ") : "None";
  }

  // Update mouse display
  const mouseDisplay = document.getElementById("mouse-display");
  if (mouseDisplay) {
    const buttonNames = state.mouseButtons.map((button) => {
      const names: Record<number, string> = {
        0: "Left",
        1: "Middle",
        2: "Right",
      };
      return names[button] || `Button ${button}`;
    });
    mouseDisplay.textContent =
      buttonNames.length > 0 ? buttonNames.join(", ") : "Not clicked";
  }

  // Update position display
  const positionDisplay = document.getElementById("position-display");
  if (positionDisplay) {
    const pos = state.mousePosition;
    positionDisplay.textContent = `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`;
  }
}
