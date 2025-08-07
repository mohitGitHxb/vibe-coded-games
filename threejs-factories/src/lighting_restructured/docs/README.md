# Three.js Lighting Factory System

A comprehensive, scalable lighting system for Three.js applications with ready-to-use lighting scenarios.

## 1. How to Use

### Basic Usage

```typescript
import { LightingFactory } from "../LightingFactory";
import { OutdoorSunny, NightTime, IndoorOffice } from "../lighting";

// Create the factory
const factory = new LightingFactory();

// Apply lighting to scene
const sunnySetup = factory.create(new OutdoorSunny(), scene);
const nightSetup = factory.create(new NightTime(), scene);
const officeSetup = factory.create(new IndoorOffice(), scene);
```

### Switching Between Lighting Scenarios

```typescript
// Clear existing lighting
factory.clearLighting(scene);

// Apply new lighting
const dawnSetup = factory.create(new Dawn(), scene);

// Lighting setup includes:
// - All lights automatically added to scene
// - Shadow configuration applied
// - Fog settings (if specified)
```

### Batch Creation

```typescript
// Apply lighting to multiple scenes
const lightingScenes = [new OutdoorSunny(), new NightTime()];
const scenes = [dayScene, nightScene];

const setups = factory.createBatch(lightingScenes, scenes);
```

### Common Patterns

```typescript
// Time of day cycling
function cycleThroughDay(scene: THREE.Scene) {
  const timeScenarios = [
    new Dawn(),
    new OutdoorSunny(),
    new Dusk(),
    new NightTime(),
  ];

  let currentIndex = 0;

  setInterval(() => {
    factory.clearLighting(scene);
    factory.create(timeScenarios[currentIndex], scene);
    currentIndex = (currentIndex + 1) % timeScenarios.length;
  }, 5000);
}

// Environment-specific lighting
function getLightingForEnvironment(environment: string) {
  switch (environment) {
    case "office":
      return new IndoorOffice();
    case "home":
      return new IndoorCozy();
    case "exterior":
      return new OutdoorSunny();
    default:
      return new OutdoorSunny();
  }
}
```

## 2. How to Extend

### Creating a New Lighting Scene

```typescript
// Step 1: Create lighting scene class
// lighting/MyCustomLighting.ts
import * as THREE from "three";
import type { ILightingScene, LightingSetup } from "../types/LightingTypes";

export class MyCustomLighting implements ILightingScene {
  create(scene: THREE.Scene): LightingSetup {
    const lights: THREE.Light[] = [];

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    lights.push(ambientLight);

    // Add main light source
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 10, 5);
    mainLight.target.position.set(0, 0, 0);
    mainLight.castShadow = true;
    lights.push(mainLight);

    return {
      lights,
      fogSettings: {
        color: 0x404040,
        near: 10,
        far: 50,
      },
      shadowSettings: {
        enabled: true,
        mapSize: 2048,
      },
    };
  }
}
```

```typescript
// Step 2: Use with factory
import { MyCustomLighting } from "../lighting/MyCustomLighting";

const setup = factory.create(new MyCustomLighting(), scene);
```

### Advanced Lighting with Multiple Light Types

```typescript
export class CinematicLighting implements ILightingScene {
  create(scene: THREE.Scene): LightingSetup {
    const lights: THREE.Light[] = [];

    // Key light (main)
    const keyLight = new THREE.SpotLight(0xffffff, 2.0, 30, Math.PI / 6, 0.3);
    keyLight.position.set(8, 8, 5);
    keyLight.target.position.set(0, 0, 0);
    keyLight.castShadow = true;
    lights.push(keyLight);

    // Fill light (soften shadows)
    const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.4);
    fillLight.position.set(-5, 3, 2);
    fillLight.target.position.set(0, 0, 0);
    lights.push(fillLight);

    // Rim light (edge lighting)
    const rimLight = new THREE.SpotLight(0xff6b35, 1.5, 20, Math.PI / 8, 0.5);
    rimLight.position.set(-3, 5, -5);
    rimLight.target.position.set(0, 1, 0);
    lights.push(rimLight);

    // Ambient for base illumination
    const ambient = new THREE.AmbientLight(0x1a1a1a, 0.2);
    lights.push(ambient);

    return {
      lights,
      shadowSettings: {
        enabled: true,
        mapSize: 2048,
      },
    };
  }
}
```

### Adding to Registry (Optional)

```typescript
// repository/lighting-registry.ts
import { MyCustomLighting } from "../lighting/MyCustomLighting";

// Add to appropriate category
cinematic: [
  {
    name: "My Custom Lighting",
    className: "MyCustomLighting",
    category: "cinematic",
    description: "Custom lighting setup for specific scene",
    lightingClass: MyCustomLighting,
  },
];
```

## 3. Available Options

### 🏠 Indoor Lighting (2 scenarios)

- **Office** - Bright fluorescent office lighting with window light
- **Cozy** - Warm, intimate lighting with fireplace and lamps

### 🌞 Outdoor Lighting (2 scenarios)

- **Sunny** - Bright sunny day with strong directional sunlight
- **Cloudy** - Overcast day with diffused soft lighting

### 🕐 Time-Based Lighting (3 scenarios)

- **Dawn** - Warm sunrise lighting with low angle sun
- **Dusk** - Golden hour sunset with warm orange tones
- **Night** - Dark night atmosphere with moonlight and street lamps

## System Architecture

```
lighting_restructured/
├── LightingFactory.ts          # Main factory class
├── types/LightingTypes.ts      # Interface definitions
├── lighting/                   # Individual lighting classes (7 total)
├── repository/lighting-registry.ts  # Complete catalog
└── examples/                   # Usage examples
```

## API Reference

### LightingFactory

- `create<T extends ILightingScene>(lightingScene: T, scene: THREE.Scene): LightingSetup` - Apply lighting to scene
- `createBatch<T extends ILightingScene>(lightingScenes: T[], scenes: THREE.Scene[]): LightingSetup[]` - Apply to multiple scenes
- `clearLighting(scene: THREE.Scene): void` - Remove all lighting from scene

### ILightingScene Interface

```typescript
interface ILightingScene {
  create(scene: THREE.Scene): LightingSetup;
}

interface LightingSetup {
  lights: THREE.Light[];
  ambientColor?: number;
  fogSettings?: {
    color: number;
    near: number;
    far: number;
  };
  shadowSettings?: {
    enabled: boolean;
    mapSize: number;
  };
}
```

## Key Features

- ✅ **Simple API**: `factory.create(new LightingScene(), scene)`
- ✅ **Automatic Setup**: Lights, shadows, and fog applied automatically
- ✅ **Scene Management**: Easy switching between lighting scenarios
- ✅ **TypeScript**: Full type safety
- ✅ **Extensible**: Easy to add new lighting scenarios
- ✅ **Categorized**: Organized by environment and time
