# World Factory 🌍

A comprehensive world/scene management factory for Three.js applications with cameras, lighting, skyboxes, and object management.

## 📦 Quick Usage

```typescript
import { WorldManager } from "./world";

// Create a world with default settings
const world = new WorldManager();

// Get the core Three.js objects
const scene = world.getScene();
const camera = world.getCamera();
const renderer = world.createRenderer();

// Add to DOM
document.body.appendChild(renderer.domElement);

// Add default lighting
world.addDefaultLighting();

// Start rendering
function animate() {
  world.render();
  requestAnimationFrame(animate);
}
animate();
```

## 🎥 Camera Management

```typescript
// Use different camera types
const perspectiveCamera = world.usePerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight
);
const orthoCamera = world.useOrthographicCamera(-10, 10, 10, -10);

// Custom camera configuration
const customCamera = world.useCamera({
  type: "perspective",
  fov: 60,
  position: [10, 5, 10],
  lookAt: [0, 0, 0],
});

// Animate camera smoothly
await world.animateCameraTo(
  new THREE.Vector3(5, 5, 5),
  new THREE.Vector3(0, 0, 0),
  2000 // 2 seconds
);
```

## 💡 Lighting Presets

```typescript
// Quick lighting setups
world.addDefaultLighting(); // Basic 3-light setup
world.addStudioLighting(); // Professional 4-light setup
world.addOutdoorLighting(); // Sun + sky hemisphere

// Custom lighting
world.addLight("spotlight", {
  type: "spot",
  color: 0xffffff,
  intensity: 1.0,
  position: [10, 10, 0],
  target: [0, 0, 0],
  castShadow: true,
  angle: Math.PI / 4,
  penumbra: 0.1,
});

// Update lighting dynamically
world.updateLightIntensity("spotlight", 0.5);
world.updateLightColor("spotlight", 0xff0000);
```

## 🌅 Skybox & Environment

```typescript
// Synthetic skyboxes
await world.addSkybox({ type: "gradient", colors: ["#87ceeb", "#ffffff"] });
await world.addSkybox({ type: "sunset", intensity: 1.2 });
await world.addSkybox({ type: "space", colors: ["#000011", "#000055"] });
await world.addSkybox({ type: "stars" });

// Custom skybox texture
await world.addSkybox({
  type: "gradient",
  texture: "./textures/sky.hdr",
});

// Environment effects
world.setBackground(0x202020);
world.setFog("linear", 0x404040, 50, 200);
world.setFog("exponential", 0x404040, undefined, undefined, 0.01);
```

## 🏗️ Object Management

```typescript
// Add objects with IDs for easy management
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(),
  new THREE.MeshStandardMaterial()
);

world.addObject("player", cube, {
  type: "player",
  health: 100,
  moveable: true,
});

// Retrieve and manipulate objects
const player = world.getObject("player");
if (player) {
  player.position.set(5, 0, 5);
}

// Clean up
world.removeObject("player");
world.clearObjects(); // Remove all objects
```

## 🔧 Adding New Camera Types

### 1. Define Camera Type

Add to `types/WorldTypes.ts`:

```typescript
export type CameraType = "perspective" | "orthographic" | "stereo" | "array";
```

### 2. Update CameraManager

Add to `core/CameraManager.ts`:

```typescript
// In createCamera method
case 'stereo':
  camera = new THREE.StereoCamera();
  // Configure stereo camera
  break;
```

### 3. Add Configuration

Add to `constants/WorldDefaults.ts`:

```typescript
export const STEREO_CAMERA_CONFIG: CameraConfig = {
  type: "stereo",
  eyeSeparation: 0.064,
  // ... other stereo-specific settings
};
```

## 💡 Adding New Light Types

### 1. Define Light Type

Add to `types/WorldTypes.ts`:

```typescript
export type LightType =
  | "ambient"
  | "directional"
  | "point"
  | "spot"
  | "hemisphere"
  | "area";
```

### 2. Implement in LightManager

Add to `core/LightManager.ts`:

```typescript
case 'area':
  light = new THREE.RectAreaLight(
    config.color || 0xffffff,
    config.intensity || 1.0,
    config.width || 10,
    config.height || 10
  );
  // Configure area light
  break;
```

## 🌟 Adding New Skybox Types

### 1. Define Skybox Type

Add to `types/WorldTypes.ts`:

```typescript
export type SkyboxType =
  | "gradient"
  | "stars"
  | "clouds"
  | "sunset"
  | "night"
  | "space"
  | "aurora";
```

### 2. Implement Generation

Add to `core/SkyboxGenerator.ts`:

```typescript
case 'aurora':
  material = this.createAuroraMaterial(config.colors);
  break;

private createAuroraMaterial(colors?: string[]): THREE.ShaderMaterial {
  // Implement aurora shader with animated northern lights effect
  return new THREE.ShaderMaterial({
    // ... shader implementation
  });
}
```

## 🏗️ Architecture

```
world/
├── constants/          # Default configurations
│   └── WorldDefaults.ts
├── types/             # TypeScript definitions
│   └── WorldTypes.ts
├── core/              # Core managers
│   ├── CameraManager.ts
│   ├── LightManager.ts
│   └── SkyboxGenerator.ts
├── utils/             # Helper utilities
└── manager/           # Main factory
    └── WorldManager.ts
```

## 🎮 Complete Example

```typescript
import { WorldManager } from "./world";
import * as THREE from "three";

// Create world
const world = new WorldManager({
  background: 0x87ceeb,
  fog: { type: "linear", color: 0x87ceeb, near: 100, far: 500 },
  shadows: { enabled: true, mapSize: 2048 },
});

// Setup renderer
const renderer = world.createRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add studio lighting
world.addStudioLighting();

// Add skybox
await world.addSkybox({ type: "sunset" });

// Add some objects
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

for (let i = 0; i < 5; i++) {
  const cube = new THREE.Mesh(geometry, material);
  cube.position.x = (i - 2) * 3;
  cube.castShadow = true;
  cube.receiveShadow = true;

  world.addObject(`cube-${i}`, cube);
}

// Handle window resize
window.addEventListener("resize", () => {
  world.resize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  world.render();
  requestAnimationFrame(animate);
}
animate();
```

## 🎯 Features

- **Multiple Camera Types** - Perspective, orthographic with smooth transitions
- **Lighting Presets** - Default, studio, outdoor, night configurations
- **Synthetic Skyboxes** - Gradient, sunset, space, stars, clouds
- **Object Management** - ID-based object tracking with metadata
- **Environment Effects** - Fog, background colors, shadow management
- **Responsive Design** - Auto-resize handling
- **Memory Management** - Proper disposal of resources

Perfect foundation for any 3D application! 🚀
