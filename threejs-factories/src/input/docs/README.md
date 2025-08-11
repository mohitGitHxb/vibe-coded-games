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
- **📱 Mobile Touch Support**: Comprehensive touch and gesture recognition
- **🎯 Multi-touch**: Handle multiple simultaneous touches
- **🖱️ Cross-platform**: Desktop mouse events as touch fallback
- **✨ Gesture Recognition**: Tap, double-tap, long press, swipe, drag, and pinch gestures

## Quick Start

```typescript
import { InputManager } from "./input/manager/InputManager.js";

// Get the singleton instance with touch support
const inputManager = InputManager.getInstance({
  enableTouch: true,
  enableGestures: true,
  callbacks: {
    onTap: (gesture) => console.log("Tap at:", gesture.startPosition),
    onSwipe: (gesture) => console.log("Swiped:", gesture.direction),
  },
});

// Connect event listeners
inputManager.connect();

// Check input state
if (inputManager.isKeyDown("KeyW")) {
  // Move forward
}

if (inputManager.isMouseButtonDown(0) || inputManager.isTouchActive()) {
  // Left mouse button or touch is active
}

// Get movement vector from WASD keys
const movement = inputManager.getMovementVector();

// Check touch state
if (inputManager.isMultiTouch()) {
  const touches = inputManager.getAllTouches();
  console.log(`${touches.length} touches active`);
}

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
├── examples/          # Usage examples and demos
│   └── TouchIntegrationExample.ts
├── docs/              # Documentation
│   └── README.md      # This file
└── index.ts           # Main module exports
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

**📱 Touch Input**

- `isTouchActive(): boolean`: Check if touch is currently active
- `getTouchCount(): number`: Get number of active touches
- `isMultiTouch(): boolean`: Check if multi-touch is active (2+ touches)
- `getTouch(touchId: number): TouchPoint | undefined`: Get specific touch by ID
- `getAllTouches(): TouchPoint[]`: Get all active touch points

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

  // 📱 Touch-specific configuration
  enableTouch?: boolean; // Enable touch event handling (default: true)
  enableGestures?: boolean; // Enable gesture recognition (default: true)
  tapTimeout?: number; // Tap detection timeout in ms (default: 300)
  doubleTapTimeout?: number; // Double tap timeout in ms (default: 300)
  longPressTimeout?: number; // Long press timeout in ms (default: 500)
  swipeThreshold?: number; // Minimum swipe distance in px (default: 50)
  pinchThreshold?: number; // Minimum pinch scale change (default: 0.1)
  preventTouchDefaults?: boolean; // Prevent browser touch behaviors (default: true)
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

## 📱 Mobile Touch & Gesture Support

The input system provides comprehensive touch and gesture recognition for mobile devices with desktop mouse fallback.

### Touch Events

The system handles all touch lifecycle events:

- **touchstart**: When a finger touches the screen
- **touchmove**: When a finger moves while touching
- **touchend**: When a finger is lifted from the screen
- **touchcancel**: When a touch is interrupted

### Gesture Recognition

Six gesture types are automatically detected:

#### 1. **Tap**

Single finger quick touch and release

```typescript
onTap: (gesture) => {
  console.log("Tap at:", gesture.startPosition);
  selectObject(gesture.startPosition);
};
```

#### 2. **Double Tap**

Two quick consecutive taps at same location

```typescript
onDoubleTap: (gesture) => {
  console.log("Double tap detected");
  zoomInAt(gesture.startPosition);
};
```

#### 3. **Long Press**

Touch held for 500ms+ without movement

```typescript
onLongPress: (gesture) => {
  console.log("Long press for", gesture.duration, "ms");
  showContextMenu(gesture.startPosition);
};
```

#### 4. **Swipe**

Quick directional movement and release

```typescript
onSwipe: (gesture) => {
  console.log("Swiped", gesture.direction, "for", gesture.distance, "px");
  switch (gesture.direction) {
    case "left":
      navigatePrevious();
      break;
    case "right":
      navigateNext();
      break;
    case "up":
      showMenu();
      break;
    case "down":
      hideMenu();
      break;
  }
};
```

#### 5. **Drag**

Continuous movement while touching

```typescript
onDrag: (gesture) => {
  console.log("Dragging:", gesture.deltaPosition);
  moveObject(gesture.deltaPosition.x, gesture.deltaPosition.y);
};
```

#### 6. **Pinch**

Two fingers changing distance (zoom/scale)

```typescript
onPinch: (gesture) => {
  console.log("Pinch scale:", gesture.scale);
  scaleScene(gesture.scale);
};
```

### Touch Data Structures

#### TouchPoint

```typescript
interface TouchPoint {
  id: number; // Unique touch identifier
  position: MousePosition; // Position in all coordinate systems
  force?: number; // Touch pressure (if supported)
}
```

#### TouchGesture

```typescript
interface TouchGesture {
  type: TouchGestureType; // Gesture type (tap, swipe, etc.)
  startPosition: MousePosition; // Initial touch position
  currentPosition: MousePosition; // Current/final position
  deltaPosition: { x: number; y: number }; // Movement delta
  distance?: number; // Total movement distance
  direction?: string; // Swipe direction (up/down/left/right)
  scale?: number; // Pinch scale factor
  duration: number; // Gesture duration in ms
  touchCount: number; // Number of touches involved
}
```

### Touch Configuration

```typescript
const inputManager = InputManager.getInstance({
  enableTouch: true, // Enable touch events
  enableGestures: true, // Enable gesture recognition
  preventTouchDefaults: true, // Prevent browser zoom/scroll
  tapTimeout: 300, // Max tap duration
  doubleTapTimeout: 300, // Max time between double taps
  longPressTimeout: 500, // Min long press duration
  swipeThreshold: 50, // Min swipe distance in pixels
  pinchThreshold: 0.1, // Min scale change for pinch

  callbacks: {
    // Touch events
    onTouchStart: (touchPoint, event) => {
      console.log("Touch started:", touchPoint);
    },
    onTouchMove: (touchPoint, event) => {
      console.log("Touch moved:", touchPoint.position);
    },
    onTouchEnd: (touchPoint, event) => {
      console.log("Touch ended:", touchPoint);
    },

    // Gesture events
    onTap: (gesture) => handleTap(gesture),
    onSwipe: (gesture) => handleSwipe(gesture),
    onPinch: (gesture) => handlePinch(gesture),
    // ... other gestures
  },
});
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

### Mobile Touch Camera Controls

```typescript
const inputManager = InputManager.getInstance({
  enableTouch: true,
  enableGestures: true,
  callbacks: {
    onDrag: (gesture) => {
      if (gesture.touchCount === 1) {
        // Single finger - rotate camera
        camera.rotation.y += gesture.deltaPosition.x * 0.01;
        camera.rotation.x += gesture.deltaPosition.y * 0.01;
      }
    },

    onPinch: (gesture) => {
      // Two fingers - zoom camera
      camera.zoom *= gesture.scale!;
      camera.updateProjectionMatrix();
    },

    onDoubleTap: (gesture) => {
      // Double tap - reset camera
      camera.position.set(0, 5, 10);
      camera.lookAt(0, 0, 0);
    },
  },
});
```

### Touch-Based Object Manipulation

```typescript
let selectedObject = null;

const inputManager = InputManager.getInstance({
  enableTouch: true,
  enableGestures: true,
  callbacks: {
    onTap: (gesture) => {
      // Select object at tap position
      selectedObject = getObjectAt(gesture.startPosition);
    },

    onDrag: (gesture) => {
      // Move selected object
      if (selectedObject) {
        selectedObject.position.x += gesture.deltaPosition.x * 0.01;
        selectedObject.position.z += gesture.deltaPosition.y * 0.01;
      }
    },

    onPinch: (gesture) => {
      // Scale selected object
      if (selectedObject && gesture.scale) {
        selectedObject.scale.multiplyScalar(gesture.scale);
      }
    },

    onLongPress: (gesture) => {
      // Show object properties
      if (selectedObject) {
        showObjectMenu(selectedObject, gesture.startPosition);
      }
    },
  },
});
```

### UI Navigation with Gestures

```typescript
const inputManager = InputManager.getInstance({
  enableGestures: true,
  callbacks: {
    onSwipe: (gesture) => {
      switch (gesture.direction) {
        case "left":
          navigateToNextPage();
          break;
        case "right":
          navigateToPreviousPage();
          break;
        case "up":
          showMainMenu();
          break;
        case "down":
          hideUI();
          break;
      }
    },

    onTap: (gesture) => {
      // Handle UI button taps
      const button = getUIElementAt(gesture.startPosition);
      if (button) {
        button.click();
      }
    },

    onLongPress: (gesture) => {
      // Show help/tooltip
      showTooltip(gesture.startPosition);
    },
  },
});
```

### Cross-Platform Input Handling

```typescript
const inputManager = InputManager.getInstance({
  enableTouch: true,
  enableGestures: true,
  callbacks: {
    // Handle both mouse and touch for selection
    onMouseDown: (button, position) => {
      if (button === 0) {
        // Left click
        selectObjectAt(position);
      }
    },

    onTap: (gesture) => {
      // Same selection logic for touch
      selectObjectAt(gesture.startPosition);
    },

    // Handle both mouse drag and touch drag
    onMouseMove: (position) => {
      if (inputManager.isMouseButtonDown(0)) {
        dragSelectedObject(position);
      }
    },

    onDrag: (gesture) => {
      dragSelectedObject(gesture.currentPosition);
    },
  },
});

function selectObjectAt(position: MousePosition) {
  // Unified selection logic for both mouse and touch
  const object = raycastFromScreenPosition(position);
  if (object) {
    setSelectedObject(object);
  }
}

function dragSelectedObject(position: MousePosition) {
  if (selectedObject) {
    // Convert screen position to world coordinates
    const worldPos = screenToWorldPosition(position);
    selectedObject.position.copy(worldPos);
  }
}
```

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
