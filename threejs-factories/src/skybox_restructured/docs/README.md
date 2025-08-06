# Three.js Skybox Factory System

A comprehensive, scalable skybox system for Three.js applications with procedurally generated sky environments.

## 1. How to Use

### Basic Usage

```typescript
import { SkyboxFactory } from "../SkyboxFactory";
import { ClearSky, NightSky, SunsetSky } from "../skyboxes";

// Create the factory
const factory = new SkyboxFactory();

// Create and apply skybox
const clearSky = await factory.create(new ClearSky());
factory.applySkyboxToScene(scene, clearSky);

const nightSky = await factory.create(new NightSky());
factory.applySkyboxToScene(scene, nightSky);
```

### Switching Between Skyboxes

```typescript
// Clear existing skybox
factory.clearSkybox(scene);

// Apply new skybox
const sunsetSky = await factory.create(new SunsetSky());
factory.applySkyboxToScene(scene, sunsetSky);
```

### Batch Creation

```typescript
// Create multiple skyboxes
const skyboxClasses = [new ClearSky(), new CloudySky(), new SpaceSky()];
const skyboxes = await factory.createBatch(skyboxClasses);

// Use them as needed
skyboxes.forEach((skybox, index) => {
  // Each skybox ready to apply to different scenes
});
```

### Common Patterns

```typescript
// Weather system
async function updateWeather(weather: string, scene: THREE.Scene) {
  factory.clearSkybox(scene);

  let skybox;
  switch (weather) {
    case "sunny":
      skybox = await factory.create(new ClearSky());
      break;
    case "cloudy":
      skybox = await factory.create(new CloudySky());
      break;
    case "night":
      skybox = await factory.create(new NightSky());
      break;
    default:
      skybox = await factory.create(new ClearSky());
  }

  factory.applySkyboxToScene(scene, skybox);
}

// Time of day progression
async function cycleSkybox(scene: THREE.Scene) {
  const skyboxSequence = [
    new ClearSky(), // Day
    new SunsetSky(), // Evening
    new NightSky(), // Night
    new ClearSky(), // Morning
  ];

  let currentIndex = 0;

  setInterval(async () => {
    factory.clearSkybox(scene);
    const skybox = await factory.create(skyboxSequence[currentIndex]);
    factory.applySkyboxToScene(scene, skybox);
    currentIndex = (currentIndex + 1) % skyboxSequence.length;
  }, 10000);
}
```

## 2. How to Extend

### Creating a New Skybox

```typescript
// Step 1: Create skybox class
// skyboxes/MyCustomSkybox.ts
import * as THREE from "three";
import { ISkybox } from "../types/SkyboxTypes";

export class MyCustomSkybox implements ISkybox {
  async create(): Promise<THREE.Object3D> {
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = this.createCustomMaterial();

    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    skyMesh.material.side = THREE.BackSide;
    skyMesh.userData.skybox = true;

    return skyMesh;
  }

  private createCustomMaterial(): THREE.Material {
    // Create custom material logic here
    return new THREE.MeshBasicMaterial({
      color: 0x87ceeb,
      side: THREE.BackSide,
    });
  }
}
```

```typescript
// Step 2: Use with factory
import { MyCustomSkybox } from "../skyboxes/MyCustomSkybox";

const customSkybox = await factory.create(new MyCustomSkybox());
factory.applySkyboxToScene(scene, customSkybox);
```

### Advanced Skybox with Procedural Generation

```typescript
export class ProcGeometrySky implements ISkybox {
  async create(): Promise<THREE.Object3D> {
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = this.createProceduralMaterial();

    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    skyMesh.material.side = THREE.BackSide;
    skyMesh.userData.skybox = true;

    return skyMesh;
  }

  private createProceduralMaterial(): THREE.MeshBasicMaterial {
    // Generate procedural sky texture
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d")!;

    // Create gradient sky
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#ff6b35"); // Sunrise orange
    gradient.addColorStop(0.3, "#f7931e"); // Orange
    gradient.addColorStop(0.7, "#ffdc00"); // Yellow
    gradient.addColorStop(1, "#87ceeb"); // Sky blue

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add procedural clouds or other elements
    this.addProceduralElements(ctx, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);

    return new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
    });
  }

  private addProceduralElements(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ): void {
    // Add sun disc
    const sunX = width * 0.8;
    const sunY = height * 0.3;
    const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 50);
    sunGradient.addColorStop(0, "#ffff99");
    sunGradient.addColorStop(0.7, "#ffdd44");
    sunGradient.addColorStop(1, "transparent");

    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 50, 0, Math.PI * 2);
    ctx.fill();
  }
}
```

### Shader-Based Skybox

```typescript
export class ShaderSky implements ISkybox {
  async create(): Promise<THREE.Object3D> {
    const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
    const skyMaterial = this.createShaderMaterial();

    const skyMesh = new THREE.Mesh(skyGeometry, skyMaterial);
    skyMesh.material.side = THREE.BackSide;
    skyMesh.userData.skybox = true;

    return skyMesh;
  }

  private createShaderMaterial(): THREE.ShaderMaterial {
    const vertexShader = `
      varying vec3 vWorldPosition;
      
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform float time;
      varying vec3 vWorldPosition;
      
      void main() {
        vec3 direction = normalize(vWorldPosition);
        
        // Create animated sky effect
        float pattern = sin(direction.x * 10.0 + time) * sin(direction.z * 10.0 + time);
        vec3 color = mix(
          vec3(0.5, 0.8, 1.0),  // Sky blue
          vec3(1.0, 0.8, 0.6),  // Warm tone
          pattern * 0.5 + 0.5
        );
        
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    return new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader,
      fragmentShader,
      side: THREE.BackSide,
    });
  }
}
```

### Adding to Registry (Optional)

```typescript
// repository/skybox-registry.ts
import { MyCustomSkybox } from "../skyboxes/MyCustomSkybox";

// Add to appropriate category
abstract: [
  {
    name: "My Custom Sky",
    className: "MyCustomSkybox",
    category: "abstract",
    description: "Custom procedural skybox",
    skyboxClass: MyCustomSkybox,
  },
];
```

## 3. Available Options

### 🌿 Nature Skyboxes (2 skyboxes)

- **Clear Sky** - Beautiful clear blue sky with gradient
- **Cloudy Sky** - Overcast sky with realistic cloud formations

### 🕐 Time-Based Skyboxes (2 skyboxes)

- **Sunset Sky** - Dramatic sunset with orange and purple gradients
- **Night Sky** - Dark night sky filled with twinkling stars

### 🚀 Space Skyboxes (1 skybox)

- **Deep Space** - Deep space environment with stars and nebulae

## System Architecture

```
skybox_restructured/
├── SkyboxFactory.ts            # Main factory class
├── types/SkyboxTypes.ts        # Interface definitions
├── skyboxes/                   # Individual skybox classes (5 total)
├── repository/skybox-registry.ts # Complete catalog
└── examples/                   # Usage examples
```

## API Reference

### SkyboxFactory

- `create<T extends ISkybox>(skybox: T): Promise<THREE.Object3D | THREE.Texture>` - Create skybox
- `createBatch<T extends ISkybox>(skyboxes: T[]): Promise<(THREE.Object3D | THREE.Texture)[]>` - Create multiple skyboxes
- `applySkyboxToScene(scene: THREE.Scene, skybox: THREE.Object3D | THREE.Texture): void` - Apply to scene
- `clearSkybox(scene: THREE.Scene): void` - Remove skybox from scene

### ISkybox Interface

```typescript
interface ISkybox {
  create(): Promise<THREE.Object3D | THREE.Texture>;
}
```

## Key Features

- ✅ **Simple API**: `factory.create(new SkyboxClass())`
- ✅ **Async Support**: Proper handling of texture loading
- ✅ **Procedural Generation**: Canvas-based sky textures
- ✅ **Shader Support**: Custom shader materials for advanced effects
- ✅ **TypeScript**: Full type safety
- ✅ **Extensible**: Easy to add new skybox types
- ✅ **Scene Management**: Automatic application and cleanup
