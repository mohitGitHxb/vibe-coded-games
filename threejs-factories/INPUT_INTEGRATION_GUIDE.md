# 🎮 InputManager Integration Guide

## Overview

The InputManager has been successfully integrated into the Three.js Factories system. This guide explains how everything is organized and how to use it.

## Architecture & Organization

### ✅ Clean Export Structure

- **All factories/managers exported from `src/factories.ts`** (not index.ts)
- **InputManager follows the same pattern** as MaterialFactory, AudioFactory, etc.
- **Modular design** with consistent folder structure

### 📁 File Organization

```
src/
├── factories.ts                    # ✅ Main export file (includes InputManager)
├── input-integration.ts            # ✅ Optional integration helper for main demo
├── input/                          # ✅ Complete InputManager module
│   ├── constants/InputConstants.ts # ✅ All presets and configuration
│   ├── core/InputCore.ts           # ✅ Utility functions
│   ├── manager/InputManager.ts     # ✅ Main singleton class
│   ├── types/InputTypes.ts         # ✅ TypeScript definitions
│   ├── utils/README.md             # ✅ Future utilities documentation
│   ├── index.ts                    # ✅ Module exports
│   └── README.md                   # ✅ Complete documentation
└── main.ts                         # ✅ Ready for optional input integration
```

### 🌐 Demo Pages

```
/                    # Main factory demo (materials, audio, world)
/input-demo.html     # Separate InputManager showcase
```

## Usage Options

### Option 1: Standalone Input Demo

Visit `/input-demo.html` for a complete InputManager demonstration with:

- Real-time input state monitoring
- Interactive canvas with visual feedback
- Comprehensive testing of all input features

### Option 2: Integration with Main Demo

In `src/main.ts`, uncomment the following lines to enable input controls:

```typescript
// Uncomment these imports:
import {
  DemoInputController,
  createInputStatusDisplay,
  updateInputStatusDisplay,
} from "./input-integration.js";

// In init() function, uncomment:
inputController = new DemoInputController();
inputController.enable();
setupInputIntegration();

// At the bottom of the file, uncomment the entire setupInputIntegration function
```

This adds:

- Mouse drag to rotate camera
- Mouse wheel to zoom
- WASD for camera movement
- Space to pause rotation
- R to reset camera
- 1-5 for quick material selection
- Input status display in bottom-left corner

### Option 3: Direct Usage in Your Code

```typescript
import { InputManager, KeyCode, MouseButton } from "./factories.js";

// Get singleton instance
const inputManager = InputManager.getInstance();
inputManager.connect();

// Use in your game loop
function gameLoop() {
  // Check individual keys
  if (inputManager.isKeyDown(KeyCode.W)) {
    player.moveForward();
  }

  // Get movement vector
  const movement = inputManager.getMovementVector();
  player.move(movement.x, movement.y);

  // Check mouse
  if (inputManager.isMouseButtonDown(MouseButton.Left)) {
    player.attack();
  }

  // Get mouse position
  const mousePos = inputManager.getNormalizedMousePosition();
  camera.lookAt(mousePos.x, mousePos.y);
}

// Cleanup
inputManager.disconnect();
```

## Available Exports from factories.ts

### Classes

- `InputManager` - Main singleton input handler
- `InputCore` - Utility functions

### Types

- `KeyCode`, `MouseButton` - Input enums
- `MousePosition`, `MouseState`, `KeyboardState` - State interfaces
- `InputManagerConfig`, `Vector2Like` - Configuration types
- `InputAction`, `InputBinding` - Action mapping types

### Constants

- `MOUSE_SENSITIVITY_PRESETS` - Predefined sensitivity values
- `COMMON_KEY_MAPPINGS` - Standard key mappings for games
- `INPUT_ACTION_PRESETS` - Common input actions
- `DEADZONE_PRESETS` - Deadzone values for analog input

## Key Features

### 🎯 Singleton Pattern

- Single source of truth for input state
- Automatic state management
- Clean connect/disconnect lifecycle

### 🔧 Type Safety

- Full TypeScript support
- Comprehensive type definitions
- IntelliSense support for all APIs

### 🌐 Cross-browser Compatibility

- Automatic event normalization
- Handle browser differences
- Consistent coordinate systems

### ⚡ Performance Optimized

- Event throttling (mouse ~60fps, wheel 50ms)
- Efficient state management
- Minimal memory overhead

### 🎮 Game-Ready Features

- WASD movement vectors
- Normalized mouse coordinates
- Modifier key tracking
- Deadzone support
- Event callbacks

## Integration Benefits

1. **Clean Separation**: Input demo is completely separate from main demo
2. **Optional Integration**: Main demo works perfectly without input code
3. **Consistent Architecture**: Follows same patterns as other factories
4. **Easy to Extend**: Well-documented, modular design
5. **Production Ready**: Comprehensive error handling and validation

## Development Notes

- InputManager is fully tested and builds without errors
- All TypeScript types are properly exported
- Documentation is comprehensive with examples
- Code follows established patterns from existing factories
- Ready for immediate use in game development

## Next Steps

1. **Try the demo**: Visit `/input-demo.html` to see InputManager in action
2. **Integrate optionally**: Uncomment code in `main.ts` for enhanced controls
3. **Use in your project**: Import from `factories.js` and start building
4. **Extend as needed**: Add custom input actions, gestures, or gamepad support

The InputManager is now a first-class citizen in the Three.js Factories ecosystem! 🎉
