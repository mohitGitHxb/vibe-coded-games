# Input Module

A comprehensive input management system for Three.js applications, providing centralized handling of keyboard, mouse, and touch input with a clean, type-safe API.

## Features

- **Singleton Pattern**: Single source of truth for input state
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Cross-browser Compatibility**: Handles browser differences automatically
- **Performance Optimized**: Event throttling and efficient state management
- **Modular Design**: Clean separation of concerns with organized folder structure
- **Coordinate Systems**: Support for screen, canvas, and normalized coordinates
- **Event Callbacks**: Optional callback system for custom input handling

## Quick Start

```typescript
import { InputManager } from "./input/manager/InputManager.js";

// Get the singleton instance
const inputManager = InputManager.getInstance();

// Connect event listeners
inputManager.connect();

// Check input state
if (inputManager.isKeyDown("KeyW")) {
  // Move forward
}

if (inputManager.isMouseButtonDown(0)) {
  // Left mouse button is pressed
}

// Get movement vector from WASD keys
const movement = inputManager.getMovementVector();

// Clean up when done
inputManager.disconnect();
```

## Architecture

```
src/input/
├── constants/          # Configuration and preset values
│   └── InputConstants.ts
├── core/              # Core utilities and helper functions
│   └── InputCore.ts
├── manager/           # Main input manager (singleton)
│   └── InputManager.ts
├── types/             # TypeScript type definitions
│   └── InputTypes.ts
├── utils/             # Additional utilities (future expansion)
│   └── README.md
├── index.ts           # Main module exports
└── README.md          # This file
```

## API Reference

### InputManager (Singleton)

#### Static Methods

- `getInstance(config?)`: Get the singleton instance
- `destroyInstance()`: Destroy the singleton instance

#### Instance Methods

**Connection Management**

- `connect()`: Attach event listeners
- `disconnect()`: Remove event listeners and cleanup

**Keyboard Input**

- `isKeyDown(key: string): boolean`: Check if a key is pressed
- `isAnyKeyDown(keys: string[]): boolean`: Check if any key in array is pressed
- `areAllKeysDown(keys: string[]): boolean`: Check if all keys in array are pressed
- `getMovementVector(): Vector2Like`: Get WASD/arrow key movement vector
- `hasModifierPressed(): boolean`: Check if any modifier key is pressed

**Mouse Input**

- `isMouseButtonDown(button: MouseButton): boolean`: Check if mouse button is pressed
- `getMousePosition(): MousePosition`: Get current mouse position in all coordinate systems
- `getNormalizedMousePosition(): Vector2Like`: Get mouse position in NDC (-1 to 1)
- `getMouseWheelDelta(): Vector2Like`: Get mouse wheel delta
- `isMouseOverCanvas(): boolean`: Check if mouse is over the canvas

**State Access**

- `getKeyboardState(): Readonly<KeyboardState>`: Get complete keyboard state
- `getMouseState(): Readonly<MouseState>`: Get complete mouse state
- `getTouchState(): Readonly<TouchState>`: Get complete touch state
- `resetState()`: Reset all input state

**Configuration**

- `updateConfig(config: Partial<InputManagerConfig>)`: Update configuration
- `setCanvas(canvas: HTMLCanvasElement)`: Set canvas for coordinate calculations

## Configuration Options

```typescript
interface InputManagerConfig {
  target?: HTMLElement | Document; // Target element for events (default: document)
  preventDefault?: boolean; // Prevent default event behavior
  stopPropagation?: boolean; // Stop event propagation
  trackMouseLeave?: boolean; // Track mouse enter/leave events
  normalizeMouseCoords?: boolean; // Normalize mouse coordinates
  callbacks?: InputEventCallbacks; // Custom event callbacks
}
```

## Coordinate Systems

The input system supports three coordinate systems:

1. **Screen Coordinates**: Pixels from top-left of screen
2. **Canvas Coordinates**: Pixels from top-left of canvas
3. **Normalized Device Coordinates (NDC)**: -1 to 1 range, center origin

```typescript
const mousePos = inputManager.getMousePosition();
console.log(mousePos.screen); // { x: 1920, y: 1080 }
console.log(mousePos.canvas); // { x: 800, y: 600 }
console.log(mousePos.normalized); // { x: 0.5, y: -0.25 }
```

## Key Codes

Use the predefined `KeyCode` enum for type safety:

```typescript
import { KeyCode } from "./input/types/InputTypes.js";

if (inputManager.isKeyDown(KeyCode.W)) {
  // Move forward
}
```

## Event Callbacks

Optional callbacks for custom input handling:

```typescript
const inputManager = InputManager.getInstance({
  callbacks: {
    onKeyDown: (key, event) => console.log("Key pressed:", key),
    onMouseMove: (position, event) => console.log("Mouse moved:", position),
  },
});
```

## Performance Considerations

- Mouse move events are throttled to ~60fps
- Wheel events are throttled to 50ms intervals
- State is efficiently managed with Maps
- Event listeners are properly cleaned up

## Browser Compatibility

- Modern browsers with ES2020+ support
- Handles browser-specific wheel event differences
- Graceful fallback for missing features

## Examples

### Basic Movement Control

```typescript
const inputManager = InputManager.getInstance();
inputManager.connect();

function gameLoop() {
  const movement = inputManager.getMovementVector();

  if (movement.x !== 0 || movement.y !== 0) {
    player.position.x += movement.x * speed;
    player.position.z += movement.y * speed;
  }

  requestAnimationFrame(gameLoop);
}
```

### Camera Control

```typescript
const inputManager = InputManager.getInstance();
let mouseDown = false;

inputManager.connect();

function gameLoop() {
  if (inputManager.isMouseButtonDown(0)) {
    // Left mouse button
    if (!mouseDown) {
      mouseDown = true;
      // Start camera rotation
    }

    const mousePos = inputManager.getNormalizedMousePosition();
    camera.rotation.y = mousePos.x * Math.PI;
    camera.rotation.x = mousePos.y * Math.PI * 0.5;
  } else {
    mouseDown = false;
  }

  requestAnimationFrame(gameLoop);
}
```

### Action-based Input

```typescript
const inputManager = InputManager.getInstance();

function gameLoop() {
  // Jump
  if (inputManager.isKeyDown("Space")) {
    player.jump();
  }

  // Attack
  if (inputManager.isMouseButtonDown(0)) {
    player.attack();
  }

  // Run modifier
  const isRunning = inputManager.isKeyDown("ShiftLeft");
  const movement = inputManager.getMovementVector();

  if (movement.x !== 0 || movement.y !== 0) {
    const speed = isRunning ? runSpeed : walkSpeed;
    player.move(movement.x * speed, movement.y * speed);
  }

  requestAnimationFrame(gameLoop);
}
```

## Contributing

When extending the input system:

1. Follow the established folder structure
2. Add comprehensive TypeScript types
3. Include JSDoc documentation
4. Add constants for magic numbers
5. Consider performance implications
6. Test across different browsers
7. Update this README with new features
