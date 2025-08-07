# Three.js Game Development Best Practices (TypeScript)

## Table of Contents

1. [Project Structure](#project-structure)
2. [Architecture Patterns](#architecture-patterns)
3. [TypeScript Best Practices](#typescript-best-practices)
4. [Three.js Performance Optimization](#threejs-performance-optimization)
5. [Asset Management](#asset-management)
6. [Game State Management](#game-state-management)
7. [Input Handling](#input-handling)
8. [Audio Management](#audio-management)
9. [Testing Strategy](#testing-strategy)
10. [Build and Deployment](#build-and-deployment)
11. [Code Quality and Standards](#code-quality-and-standards)

---

## Project Structure

### Recommended Folder Structure

```
src/
├── core/                    # Core game engine and systems
│   ├── Engine.ts           # Main game engine
│   ├── Scene.ts            # Scene management
│   ├── Renderer.ts         # WebGL renderer wrapper
│   └── GameLoop.ts         # Game loop and timing
├── entities/               # Game objects and entities
│   ├── GameObject.ts       # Base game object class
│   ├── Player.ts           # Player entity
│   ├── Enemy.ts            # Enemy entities
│   └── World.ts            # World/environment objects
├── components/             # Reusable components
│   ├── Transform.ts        # Position, rotation, scale
│   ├── Mesh.ts             # 3D mesh components
│   ├── Collider.ts         # Collision detection
│   └── Audio.ts            # Audio components
├── systems/                # Game systems
│   ├── PhysicsSystem.ts    # Physics simulation
│   ├── InputSystem.ts      # Input handling
│   ├── AudioSystem.ts      # Audio management
│   └── UISystem.ts         # User interface
├── managers/               # Resource and state managers
│   ├── AssetManager.ts     # Asset loading and caching
│   ├── SceneManager.ts     # Scene transitions
│   ├── StateManager.ts     # Game state management
│   └── EventManager.ts     # Event system
├── utils/                  # Utility functions and helpers
│   ├── MathUtils.ts        # Math utilities
│   ├── ThreeUtils.ts       # Three.js utilities
│   └── Constants.ts        # Game constants
├── types/                  # TypeScript type definitions
│   ├── GameTypes.ts        # Core game types
│   ├── EntityTypes.ts      # Entity type definitions
│   └── EventTypes.ts       # Event type definitions
├── assets/                 # Game assets
│   ├── models/             # 3D models
│   ├── textures/           # Textures and materials
│   ├── audio/              # Audio files
│   └── shaders/            # Custom shaders
└── ui/                     # User interface components
    ├── HUD.ts              # Heads-up display
    ├── Menu.ts             # Menu systems
    └── UIComponents.ts     # Reusable UI components
```

### File Naming Conventions

- Use PascalCase for classes and interfaces: `PlayerController.ts`
- Use camelCase for utilities and functions: `mathUtils.ts`
- Use kebab-case for assets: `player-model.glb`
- Use UPPER_SNAKE_CASE for constants: `GAME_CONSTANTS.ts`

---

## Architecture Patterns

### 1. Entity-Component-System (ECS)

```typescript
// Base Entity class
abstract class Entity {
  protected id: string;
  protected components: Map<string, Component> = new Map();

  addComponent<T extends Component>(component: T): void {
    this.components.set(component.constructor.name, component);
  }

  getComponent<T extends Component>(type: new () => T): T | null {
    return (this.components.get(type.name) as T) || null;
  }
}

// Base Component class
abstract class Component {
  public entity?: Entity;

  onAttach(entity: Entity): void {
    this.entity = entity;
  }

  abstract update(deltaTime: number): void;
}

// System for processing components
abstract class System {
  abstract update(entities: Entity[], deltaTime: number): void;
}
```

### 2. Game Engine Architecture

```typescript
class GameEngine {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private systems: System[] = [];
  private entities: Entity[] = [];
  private gameLoop: GameLoop;

  constructor() {
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.gameLoop = new GameLoop(this.update.bind(this));
  }

  addSystem(system: System): void {
    this.systems.push(system);
  }

  addEntity(entity: Entity): void {
    this.entities.push(entity);
  }

  private update(deltaTime: number): void {
    // Update all systems
    this.systems.forEach((system) => {
      system.update(this.entities, deltaTime);
    });

    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }
}
```

### 3. Event-Driven Architecture

```typescript
class EventManager {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((callback) => callback(data));
  }
}
```

---

## TypeScript Best Practices

### 1. Strong Typing

```typescript
// Define strict interfaces for game objects
interface GameObject {
  id: string;
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
  mesh?: THREE.Mesh;
  collider?: Collider;
}

// Use enums for game states
enum GameState {
  LOADING = "loading",
  MENU = "menu",
  PLAYING = "playing",
  PAUSED = "paused",
  GAME_OVER = "game_over",
}

// Type-safe event system
interface GameEvents {
  "player:move": { position: THREE.Vector3 };
  "player:jump": { velocity: THREE.Vector3 };
  "enemy:spawn": { enemy: Enemy };
  "game:state-change": { from: GameState; to: GameState };
}
```

### 2. Generic Components

```typescript
class Component<T = any> {
  protected data: T;

  constructor(data: T) {
    this.data = data;
  }

  getData(): T {
    return this.data;
  }
}

// Usage
class TransformComponent extends Component<{
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}> {
  constructor(
    position: THREE.Vector3,
    rotation: THREE.Euler,
    scale: THREE.Vector3
  ) {
    super({ position, rotation, scale });
  }
}
```

### 3. Dependency Injection

```typescript
class ServiceContainer {
  private services: Map<string, any> = new Map();

  register<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found`);
    }
    return service as T;
  }
}
```

---

## Three.js Performance Optimization

### 1. Object Pooling

```typescript
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;

  constructor(createFn: () => T, resetFn: (obj: T) => void) {
    this.createFn = createFn;
    this.resetFn = resetFn;
  }

  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  release(obj: T): void {
    this.resetFn(obj);
    this.pool.push(obj);
  }
}

// Usage for bullets
const bulletPool = new ObjectPool<THREE.Mesh>(
  () => new THREE.Mesh(bulletGeometry, bulletMaterial),
  (bullet) => {
    bullet.position.set(0, 0, 0);
    bullet.visible = false;
  }
);
```

### 2. Frustum Culling

```typescript
class FrustumCuller {
  private frustum: THREE.Frustum = new THREE.Frustum();
  private camera: THREE.Camera;

  constructor(camera: THREE.Camera) {
    this.camera = camera;
  }

  update(): void {
    this.frustum.setFromProjectionMatrix(
      new THREE.Matrix4().multiplyMatrices(
        this.camera.projectionMatrix,
        this.camera.matrixWorldInverse
      )
    );
  }

  isVisible(object: THREE.Object3D): boolean {
    const sphere = new THREE.Sphere();
    object.updateMatrixWorld();
    object.geometry?.computeBoundingSphere();

    if (object.geometry?.boundingSphere) {
      sphere.copy(object.geometry.boundingSphere);
      sphere.applyMatrix4(object.matrixWorld);
      return this.frustum.intersectsSphere(sphere);
    }

    return true;
  }
}
```

### 3. Level of Detail (LOD)

```typescript
class LODManager {
  private lodLevels: Map<string, THREE.LOD> = new Map();

  createLOD(id: string, distances: number[], meshes: THREE.Mesh[]): void {
    const lod = new THREE.LOD();

    distances.forEach((distance, index) => {
      if (meshes[index]) {
        lod.addLevel(meshes[index], distance);
      }
    });

    this.lodLevels.set(id, lod);
  }

  updateLOD(camera: THREE.Camera): void {
    this.lodLevels.forEach((lod) => {
      lod.update(camera);
    });
  }
}
```

### 4. Instanced Rendering

```typescript
class InstancedRenderer {
  private instancedMesh: THREE.InstancedMesh;
  private matrix: THREE.Matrix4 = new THREE.Matrix4();
  private count: number = 0;

  constructor(
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    maxCount: number
  ) {
    this.instancedMesh = new THREE.InstancedMesh(geometry, material, maxCount);
  }

  addInstance(
    position: THREE.Vector3,
    rotation: THREE.Euler,
    scale: THREE.Vector3
  ): void {
    this.matrix.compose(
      position,
      new THREE.Quaternion().setFromEuler(rotation),
      scale
    );
    this.instancedMesh.setMatrixAt(this.count, this.matrix);
    this.count++;
  }

  update(): void {
    this.instancedMesh.count = this.count;
    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  reset(): void {
    this.count = 0;
  }
}
```

---

## Asset Management

### Procedural Low-Poly Asset Generation

Instead of loading external 3D models and textures, generate low-poly assets procedurally using code. This approach ensures visual consistency, reduces asset dependencies, and allows for dynamic asset generation based on design requirements.

### 1. Low-Poly Geometry Generator

```typescript
class LowPolyGeometryGenerator {
  // Generate low-poly cube with custom dimensions
  generateCube(
    width: number,
    height: number,
    depth: number,
    segments: number = 1
  ): THREE.BufferGeometry {
    const geometry = new THREE.BoxGeometry(
      width,
      height,
      depth,
      segments,
      segments,
      segments
    );

    // Simplify geometry for low-poly look
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
  }

  // Generate low-poly sphere
  generateSphere(radius: number, segments: number = 8): THREE.BufferGeometry {
    const geometry = new THREE.SphereGeometry(radius, segments, segments);

    // Ensure low-poly appearance
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
  }

  // Generate low-poly cylinder
  generateCylinder(
    radius: number,
    height: number,
    segments: number = 8
  ): THREE.BufferGeometry {
    const geometry = new THREE.CylinderGeometry(
      radius,
      radius,
      height,
      segments
    );

    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
  }

  // Generate low-poly cone
  generateCone(
    radius: number,
    height: number,
    segments: number = 8
  ): THREE.BufferGeometry {
    const geometry = new THREE.ConeGeometry(radius, height, segments);

    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
  }

  // Generate low-poly plane
  generatePlane(
    width: number,
    height: number,
    segments: number = 1
  ): THREE.BufferGeometry {
    const geometry = new THREE.PlaneGeometry(width, height, segments, segments);

    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
  }

  // Generate low-poly terrain
  generateTerrain(
    width: number,
    height: number,
    depth: number,
    segments: number = 16
  ): THREE.BufferGeometry {
    const geometry = new THREE.PlaneGeometry(width, height, segments, segments);
    const vertices = geometry.attributes.position.array as Float32Array;

    // Add height variation for terrain
    for (let i = 0; i < vertices.length; i += 3) {
      const x = vertices[i];
      const z = vertices[i + 2];

      // Simple noise function for terrain height
      const noise = Math.sin(x * 0.1) * Math.cos(z * 0.1) * depth;
      vertices[i + 1] = noise;
    }

    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();

    return geometry;
  }

  // Generate low-poly tree
  generateTree(
    trunkHeight: number,
    trunkRadius: number,
    foliageRadius: number
  ): THREE.Group {
    const group = new THREE.Group();

    // Trunk (cylinder)
    const trunkGeometry = this.generateCylinder(trunkRadius, trunkHeight, 6);
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = trunkHeight / 2;
    group.add(trunk);

    // Foliage (sphere)
    const foliageGeometry = this.generateSphere(foliageRadius, 8);
    const foliageMaterial = new THREE.MeshLambertMaterial({ color: 0x228b22 });
    const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
    foliage.position.y = trunkHeight + foliageRadius * 0.7;
    group.add(foliage);

    return group;
  }

  // Generate low-poly building
  generateBuilding(
    width: number,
    height: number,
    depth: number,
    floors: number = 1
  ): THREE.Group {
    const group = new THREE.Group();

    // Main building structure
    const buildingGeometry = this.generateCube(width, height, depth, 1);
    const buildingMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
    const building = new THREE.Mesh(buildingGeometry, buildingMaterial);
    building.position.y = height / 2;
    group.add(building);

    // Add windows
    const windowGeometry = this.generatePlane(width * 0.1, height * 0.2, 1);
    const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x87ceeb });

    for (let i = 0; i < floors; i++) {
      for (let j = 0; j < 3; j++) {
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(
          (j - 1) * width * 0.3,
          height * (0.3 + i * 0.4),
          depth / 2 + 0.01
        );
        group.add(window);
      }
    }

    return group;
  }

  // Generate low-poly character
  generateCharacter(height: number = 2): THREE.Group {
    const group = new THREE.Group();

    // Head
    const headGeometry = this.generateSphere(height * 0.15, 8);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xffe4c4 });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = height * 0.85;
    group.add(head);

    // Body
    const bodyGeometry = this.generateCube(
      height * 0.3,
      height * 0.5,
      height * 0.2,
      1
    );
    const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0x4169e1 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = height * 0.5;
    group.add(body);

    // Arms
    const armGeometry = this.generateCylinder(height * 0.05, height * 0.4, 6);
    const armMaterial = new THREE.MeshLambertMaterial({ color: 0xffe4c4 });

    const leftArm = new THREE.Mesh(armGeometry, armMaterial);
    leftArm.position.set(-height * 0.25, height * 0.5, 0);
    leftArm.rotation.z = Math.PI / 4;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(armGeometry, armMaterial);
    rightArm.position.set(height * 0.25, height * 0.5, 0);
    rightArm.rotation.z = -Math.PI / 4;
    group.add(rightArm);

    // Legs
    const legGeometry = this.generateCylinder(height * 0.08, height * 0.4, 6);
    const legMaterial = new THREE.MeshLambertMaterial({ color: 0x000080 });

    const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
    leftLeg.position.set(-height * 0.1, height * 0.2, 0);
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
    rightLeg.position.set(height * 0.1, height * 0.2, 0);
    group.add(rightLeg);

    return group;
  }
}
```

### 2. Procedural Material Generator

```typescript
class ProceduralMaterialGenerator {
  // Generate procedural textures using Canvas
  private generateCanvasTexture(
    width: number,
    height: number,
    generator: (ctx: CanvasRenderingContext2D) => void
  ): THREE.Texture {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    generator(ctx);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.generateMipmaps = true;

    return texture;
  }

  // Generate solid color material
  generateSolidMaterial(
    color: string | number,
    opacity: number = 1.0
  ): THREE.Material {
    return new THREE.MeshLambertMaterial({
      color: color,
      transparent: opacity < 1.0,
      opacity: opacity,
    });
  }

  // Generate procedural wood texture
  generateWoodMaterial(color: string = "#8B4513"): THREE.Material {
    const texture = this.generateCanvasTexture(256, 256, (ctx) => {
      // Create wood grain effect
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 256, 256);

      for (let i = 0; i < 50; i++) {
        ctx.strokeStyle = `rgba(139, 69, 19, ${Math.random() * 0.3})`;
        ctx.lineWidth = Math.random() * 3 + 1;
        ctx.beginPath();
        ctx.moveTo(Math.random() * 256, 0);
        ctx.lineTo(Math.random() * 256, 256);
        ctx.stroke();
      }
    });

    return new THREE.MeshLambertMaterial({ map: texture });
  }

  // Generate procedural stone texture
  generateStoneMaterial(color: string = "#808080"): THREE.Material {
    const texture = this.generateCanvasTexture(256, 256, (ctx) => {
      // Create stone effect
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 256, 256);

      for (let i = 0; i < 100; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const radius = Math.random() * 20 + 5;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${Math.random() * 0.3})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    return new THREE.MeshLambertMaterial({ map: texture });
  }

  // Generate procedural grass texture
  generateGrassMaterial(color: string = "#228B22"): THREE.Material {
    const texture = this.generateCanvasTexture(256, 256, (ctx) => {
      // Create grass effect
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 256, 256);

      for (let i = 0; i < 200; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const height = Math.random() * 20 + 5;

        ctx.strokeStyle = `rgba(34, 139, 34, ${Math.random() * 0.5 + 0.5})`;
        ctx.lineWidth = Math.random() * 2 + 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.random() * 10 - 5, y - height);
        ctx.stroke();
      }
    });

    return new THREE.MeshLambertMaterial({ map: texture });
  }

  // Generate procedural metal texture
  generateMetalMaterial(color: string = "#C0C0C0"): THREE.Material {
    const texture = this.generateCanvasTexture(256, 256, (ctx) => {
      // Create metal effect
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 256, 256);

      // Add metallic highlights
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const width = Math.random() * 50 + 10;
        const height = Math.random() * 10 + 2;

        const gradient = ctx.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(x, y, width, height);
      }
    });

    return new THREE.MeshLambertMaterial({ map: texture });
  }

  // Generate procedural water texture
  generateWaterMaterial(color: string = "#4169E1"): THREE.Material {
    const texture = this.generateCanvasTexture(256, 256, (ctx) => {
      // Create water effect
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 256, 256);

      // Add wave patterns
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * 256;
        const y = Math.random() * 256;
        const radius = Math.random() * 30 + 10;

        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.3})`;
        ctx.lineWidth = Math.random() * 2 + 1;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    return new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
      opacity: 0.8,
    });
  }
}
```

### 3. Procedural Asset Manager

```typescript
class ProceduralAssetManager {
  private geometryGenerator: LowPolyGeometryGenerator;
  private materialGenerator: ProceduralMaterialGenerator;
  private cache: Map<string, THREE.Object3D> = new Map();
  private designSystem: VisualDesignSystem;

  constructor(designSystem: VisualDesignSystem) {
    this.geometryGenerator = new LowPolyGeometryGenerator();
    this.materialGenerator = new ProceduralMaterialGenerator();
    this.designSystem = designSystem;
  }

  // Generate environment assets
  generateEnvironmentAssets(): Map<string, THREE.Object3D> {
    const assets = new Map<string, THREE.Object3D>();

    // Generate terrain
    const terrainGeometry = this.geometryGenerator.generateTerrain(
      100,
      100,
      10,
      32
    );
    const terrainMaterial = this.materialGenerator.generateGrassMaterial(
      this.designSystem.colors.terrain
    );
    const terrain = new THREE.Mesh(terrainGeometry, terrainMaterial);
    assets.set("terrain", terrain);

    // Generate trees
    for (let i = 0; i < 20; i++) {
      const tree = this.geometryGenerator.generateTree(3, 0.3, 1.5);
      tree.position.set(
        (Math.random() - 0.5) * 80,
        0,
        (Math.random() - 0.5) * 80
      );
      assets.set(`tree_${i}`, tree);
    }

    // Generate buildings
    for (let i = 0; i < 10; i++) {
      const building = this.geometryGenerator.generateBuilding(
        Math.random() * 5 + 3,
        Math.random() * 10 + 5,
        Math.random() * 5 + 3,
        Math.floor(Math.random() * 3) + 1
      );
      building.position.set(
        (Math.random() - 0.5) * 60,
        0,
        (Math.random() - 0.5) * 60
      );
      assets.set(`building_${i}`, building);
    }

    return assets;
  }

  // Generate character assets
  generateCharacterAssets(): Map<string, THREE.Object3D> {
    const assets = new Map<string, THREE.Object3D>();

    // Generate player character
    const player = this.geometryGenerator.generateCharacter(2);
    const playerMaterial = this.materialGenerator.generateSolidMaterial(
      this.designSystem.colors.player
    );
    player.children.forEach((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = playerMaterial;
      }
    });
    assets.set("player", player);

    // Generate NPCs
    for (let i = 0; i < 5; i++) {
      const npc = this.geometryGenerator.generateCharacter(1.8);
      const npcMaterial = this.materialGenerator.generateSolidMaterial(
        this.designSystem.colors.npc
      );
      npc.children.forEach((child) => {
        if (child instanceof THREE.Mesh) {
          child.material = npcMaterial;
        }
      });
      assets.set(`npc_${i}`, npc);
    }

    return assets;
  }

  // Generate UI assets
  generateUIAssets(): Map<string, THREE.Object3D> {
    const assets = new Map<string, THREE.Object3D>();

    // Generate button geometry
    const buttonGeometry = this.geometryGenerator.generateCube(2, 0.5, 0.1, 1);
    const buttonMaterial = this.materialGenerator.generateSolidMaterial(
      this.designSystem.colors.ui.primary
    );
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    assets.set("ui_button", button);

    // Generate panel geometry
    const panelGeometry = this.geometryGenerator.generatePlane(10, 6, 1);
    const panelMaterial = this.materialGenerator.generateSolidMaterial(
      this.designSystem.colors.ui.background,
      0.9
    );
    const panel = new THREE.Mesh(panelGeometry, panelMaterial);
    assets.set("ui_panel", panel);

    return assets;
  }

  // Generate dynamic asset based on parameters
  generateDynamicAsset(type: string, parameters: any): THREE.Object3D {
    switch (type) {
      case "weapon":
        return this.generateWeapon(parameters);
      case "vehicle":
        return this.generateVehicle(parameters);
      case "building":
        return this.generateBuilding(parameters);
      case "character":
        return this.generateCharacter(parameters);
      default:
        return this.generateCube(1, 1, 1);
    }
  }

  private generateWeapon(parameters: any): THREE.Object3D {
    const group = new THREE.Group();

    // Weapon handle
    const handleGeometry = this.geometryGenerator.generateCylinder(0.1, 0.5, 6);
    const handleMaterial = this.materialGenerator.generateWoodMaterial();
    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    group.add(handle);

    // Weapon barrel
    const barrelGeometry = this.geometryGenerator.generateCylinder(
      0.05,
      1.0,
      6
    );
    const barrelMaterial = this.materialGenerator.generateMetalMaterial();
    const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial);
    barrel.position.y = 0.75;
    group.add(barrel);

    return group;
  }

  private generateVehicle(parameters: any): THREE.Object3D {
    const group = new THREE.Group();

    // Vehicle body
    const bodyGeometry = this.geometryGenerator.generateCube(3, 1, 2, 1);
    const bodyMaterial = this.materialGenerator.generateSolidMaterial(
      parameters.color || 0xff0000
    );
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    group.add(body);

    // Wheels
    const wheelGeometry = this.geometryGenerator.generateCylinder(0.4, 0.2, 8);
    const wheelMaterial =
      this.materialGenerator.generateSolidMaterial(0x000000);

    for (let i = 0; i < 4; i++) {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(
        (i % 2 === 0 ? -1 : 1) * 1.2,
        -0.5,
        i < 2 ? -0.8 : 0.8
      );
      group.add(wheel);
    }

    return group;
  }

  // Get cached asset or generate new one
  getAsset(name: string, parameters?: any): THREE.Object3D {
    if (this.cache.has(name)) {
      return this.cache.get(name)!.clone();
    }

    const asset = this.generateDynamicAsset(name, parameters || {});
    this.cache.set(name, asset);
    return asset.clone();
  }

  // Clear cache to free memory
  clearCache(): void {
    this.cache.clear();
  }
}
```

### 4. Visual Design System

```typescript
class VisualDesignSystem {
  colors: {
    primary: number;
    secondary: number;
    accent: number;
    terrain: number;
    player: number;
    npc: number;
    ui: {
      primary: number;
      secondary: number;
      background: number;
      text: number;
    };
  };

  geometry: {
    maxSegments: number;
    minSegments: number;
    useSmoothShading: boolean;
  };

  materials: {
    useTextures: boolean;
    useShadows: boolean;
    useTransparency: boolean;
  };

  constructor(designConfig: any) {
    this.colors = designConfig.colors;
    this.geometry = designConfig.geometry;
    this.materials = designConfig.materials;
  }

  // Validate asset against design system
  validateAsset(asset: THREE.Object3D): boolean {
    // Check if asset follows design guidelines
    return true;
  }

  // Apply design system to asset
  applyDesignSystem(asset: THREE.Object3D): THREE.Object3D {
    // Apply consistent styling
    return asset;
  }
}
```

### 5. Usage Examples

```typescript
// Define visual design system
const designSystem = new VisualDesignSystem({
  colors: {
    primary: 0x4169e1,
    secondary: 0x228b22,
    accent: 0xffd700,
    terrain: 0x228b22,
    player: 0x4169e1,
    npc: 0x808080,
    ui: {
      primary: 0x4169e1,
      secondary: 0x228b22,
      background: 0xffffff,
      text: 0x000000,
    },
  },
  geometry: {
    maxSegments: 8,
    minSegments: 4,
    useSmoothShading: false,
  },
  materials: {
    useTextures: true,
    useShadows: true,
    useTransparency: true,
  },
});

// Initialize asset manager
const assetManager = new ProceduralAssetManager(designSystem);

// Generate assets
const environmentAssets = assetManager.generateEnvironmentAssets();
const characterAssets = assetManager.generateCharacterAssets();
const uiAssets = assetManager.generateUIAssets();

// Generate dynamic assets
const weapon = assetManager.generateDynamicAsset("weapon", { type: "sword" });
const vehicle = assetManager.generateDynamicAsset("vehicle", {
  type: "car",
  color: 0xff0000,
});

// Get cached assets
const player = assetManager.getAsset("player");
const tree = assetManager.getAsset("tree_0");
```

### 6. Benefits of Procedural Asset Generation

1. **Design Consistency**: All assets follow the same visual design system
2. **No External Dependencies**: Eliminates need for 3D modeling software and external assets
3. **Dynamic Generation**: Create assets based on game parameters and design requirements
4. **Performance**: Optimized low-poly geometry for better performance
5. **Memory Efficient**: Generate on-demand and cache for reuse
6. **Scalable**: Easy to create variations and new asset types
7. **Version Control Friendly**: All assets are code-based
8. **Cross-platform**: Consistent appearance across all platforms

---

## Procedural Level Generation

### Algorithmic Level Design

Instead of manually designing levels, use algorithms to generate infinite, varied, and balanced game levels programmatically. This approach provides endless content, reduces development time, and ensures consistent gameplay quality.

### 1. Level Generation Framework

```typescript
class LevelGenerator {
  private seed: number;
  private random: (min: number, max: number) => number;
  private designRules: LevelDesignRules;
  private assetManager: ProceduralAssetManager;

  constructor(
    seed: number,
    designRules: LevelDesignRules,
    assetManager: ProceduralAssetManager
  ) {
    this.seed = seed;
    this.designRules = designRules;
    this.assetManager = assetManager;

    // Initialize seeded random number generator
    this.random = this.createSeededRandom(seed);
  }

  private createSeededRandom(
    seed: number
  ): (min: number, max: number) => number {
    let state = seed;
    return (min: number, max: number) => {
      state = (state * 9301 + 49297) % 233280;
      const random = state / 233280;
      return min + random * (max - min);
    };
  }

  // Generate complete level
  generateLevel(levelNumber: number, difficulty: number): Level {
    const level = new Level(levelNumber, difficulty);

    // Generate level layout
    const layout = this.generateLayout(difficulty);
    level.setLayout(layout);

    // Generate terrain
    const terrain = this.generateTerrain(layout, difficulty);
    level.setTerrain(terrain);

    // Generate obstacles and challenges
    const obstacles = this.generateObstacles(layout, difficulty);
    level.setObstacles(obstacles);

    // Generate collectibles and rewards
    const collectibles = this.generateCollectibles(layout, difficulty);
    level.setCollectibles(collectibles);

    // Generate enemies and AI
    const enemies = this.generateEnemies(layout, difficulty);
    level.setEnemies(enemies);

    // Generate lighting and atmosphere
    const lighting = this.generateLighting(difficulty);
    level.setLighting(lighting);

    return level;
  }

  // Generate level layout using various algorithms
  private generateLayout(difficulty: number): LevelLayout {
    const algorithm = this.selectLayoutAlgorithm(difficulty);

    switch (algorithm) {
      case "grid":
        return this.generateGridLayout(difficulty);
      case "maze":
        return this.generateMazeLayout(difficulty);
      case "open":
        return this.generateOpenLayout(difficulty);
      case "procedural":
        return this.generateProceduralLayout(difficulty);
      default:
        return this.generateGridLayout(difficulty);
    }
  }

  private selectLayoutAlgorithm(difficulty: number): string {
    const algorithms = ["grid", "maze", "open", "procedural"];
    const weights = [0.3, 0.2, 0.2, 0.3];

    let random = this.random(0, 1);
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) return algorithms[i];
    }
    return algorithms[0];
  }
}
```

### 2. Grid-Based Level Generation

```typescript
class GridLevelGenerator {
  private grid: number[][];
  private width: number;
  private height: number;
  private random: (min: number, max: number) => number;

  constructor(
    width: number,
    height: number,
    random: (min: number, max: number) => number
  ) {
    this.width = width;
    this.height = height;
    this.random = random;
    this.grid = Array(height)
      .fill(null)
      .map(() => Array(width).fill(0));
  }

  generateGridLayout(difficulty: number): LevelLayout {
    // Initialize grid with walls
    this.initializeGrid();

    // Generate rooms
    const rooms = this.generateRooms(difficulty);

    // Connect rooms with corridors
    this.connectRooms(rooms);

    // Add special areas
    this.addSpecialAreas(difficulty);

    return new LevelLayout(this.grid, rooms);
  }

  private initializeGrid(): void {
    // Fill grid with walls
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = 1; // Wall
      }
    }
  }

  private generateRooms(difficulty: number): Room[] {
    const rooms: Room[] = [];
    const numRooms = Math.floor(this.random(3, 8) + difficulty * 2);

    for (let i = 0; i < numRooms; i++) {
      const room = this.generateRoom();
      if (this.canPlaceRoom(room)) {
        this.placeRoom(room);
        rooms.push(room);
      }
    }

    return rooms;
  }

  private generateRoom(): Room {
    const minSize = 3;
    const maxSize = 8;

    const width = Math.floor(this.random(minSize, maxSize));
    const height = Math.floor(this.random(minSize, maxSize));
    const x = Math.floor(this.random(1, this.width - width - 1));
    const y = Math.floor(this.random(1, this.height - height - 1));

    return new Room(x, y, width, height);
  }

  private canPlaceRoom(room: Room): boolean {
    // Check if room overlaps with existing rooms
    for (let y = room.y - 1; y <= room.y + room.height; y++) {
      for (let x = room.x - 1; x <= room.x + room.width; x++) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return false;
        if (this.grid[y][x] === 0) return false; // Already a room
      }
    }
    return true;
  }

  private placeRoom(room: Room): void {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        this.grid[y][x] = 0; // Floor
      }
    }
  }

  private connectRooms(rooms: Room[]): void {
    for (let i = 0; i < rooms.length - 1; i++) {
      const room1 = rooms[i];
      const room2 = rooms[i + 1];
      this.createCorridor(room1, room2);
    }
  }

  private createCorridor(room1: Room, room2: Room): void {
    const center1 = room1.getCenter();
    const center2 = room2.getCenter();

    // Create L-shaped corridor
    if (this.random(0, 1) < 0.5) {
      // Horizontal then vertical
      this.createHorizontalCorridor(center1.x, center2.x, center1.y);
      this.createVerticalCorridor(center1.y, center2.y, center2.x);
    } else {
      // Vertical then horizontal
      this.createVerticalCorridor(center1.y, center2.y, center1.x);
      this.createHorizontalCorridor(center1.x, center2.x, center2.y);
    }
  }

  private createHorizontalCorridor(x1: number, x2: number, y: number): void {
    const start = Math.min(x1, x2);
    const end = Math.max(x1, x2);

    for (let x = start; x <= end; x++) {
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        this.grid[y][x] = 0; // Floor
      }
    }
  }

  private createVerticalCorridor(y1: number, y2: number, x: number): void {
    const start = Math.min(y1, y2);
    const end = Math.max(y1, y2);

    for (let y = start; y <= end; y++) {
      if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
        this.grid[y][x] = 0; // Floor
      }
    }
  }
}

class Room {
  constructor(
    public x: number,
    public y: number,
    public width: number,
    public height: number
  ) {}

  getCenter(): { x: number; y: number } {
    return {
      x: Math.floor(this.x + this.width / 2),
      y: Math.floor(this.y + this.height / 2),
    };
  }
}
```

### 3. Maze Generation Algorithms

```typescript
class MazeGenerator {
  private grid: number[][];
  private width: number;
  private height: number;
  private random: (min: number, max: number) => number;

  constructor(
    width: number,
    height: number,
    random: (min: number, max: number) => number
  ) {
    this.width = width;
    this.height = height;
    this.random = random;
    this.grid = Array(height)
      .fill(null)
      .map(() => Array(width).fill(1));
  }

  generateMaze(): number[][] {
    // Initialize with walls
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.grid[y][x] = 1;
      }
    }

    // Start from center
    const startX = Math.floor(this.width / 2);
    const startY = Math.floor(this.height / 2);

    this.recursiveBacktrack(startX, startY);

    // Set start and end points
    this.grid[1][1] = 2; // Start
    this.grid[this.height - 2][this.width - 2] = 3; // End

    return this.grid;
  }

  private recursiveBacktrack(x: number, y: number): void {
    this.grid[y][x] = 0; // Mark as path

    const directions = [
      [0, -2], // North
      [2, 0], // East
      [0, 2], // South
      [-2, 0], // West
    ];

    // Shuffle directions
    for (let i = directions.length - 1; i > 0; i--) {
      const j = Math.floor(this.random(0, i + 1));
      [directions[i], directions[j]] = [directions[j], directions[i]];
    }

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;

      if (this.isValid(newX, newY) && this.grid[newY][newX] === 1) {
        // Carve path
        this.grid[y + dy / 2][x + dx / 2] = 0;
        this.recursiveBacktrack(newX, newY);
      }
    }
  }

  private isValid(x: number, y: number): boolean {
    return x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1;
  }
}
```

### 4. Open World Generation

```typescript
class OpenWorldGenerator {
  private width: number;
  private height: number;
  private random: (min: number, max: number) => number;
  private noise: NoiseGenerator;

  constructor(
    width: number,
    height: number,
    random: (min: number, max: number) => number
  ) {
    this.width = width;
    this.height = height;
    this.random = random;
    this.noise = new NoiseGenerator();
  }

  generateOpenLayout(difficulty: number): LevelLayout {
    const layout = new LevelLayout([], []);

    // Generate terrain using Perlin noise
    const terrain = this.generateTerrain();
    layout.setTerrain(terrain);

    // Generate biomes
    const biomes = this.generateBiomes();
    layout.setBiomes(biomes);

    // Generate points of interest
    const poi = this.generatePointsOfInterest(difficulty);
    layout.setPointsOfInterest(poi);

    // Generate paths and roads
    const paths = this.generatePaths(poi);
    layout.setPaths(paths);

    return layout;
  }

  private generateTerrain(): number[][] {
    const terrain = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(0));

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = x / this.width;
        const ny = y / this.height;

        // Combine multiple noise layers
        const elevation =
          this.noise.perlin2(nx * 4, ny * 4) * 0.5 +
          this.noise.perlin2(nx * 8, ny * 8) * 0.25 +
          this.noise.perlin2(nx * 16, ny * 16) * 0.125;

        terrain[y][x] = elevation;
      }
    }

    return terrain;
  }

  private generateBiomes(): Biome[][] {
    const biomes = Array(this.height)
      .fill(null)
      .map(() => Array(this.width).fill(Biome.PLAINS));

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const nx = x / this.width;
        const ny = y / this.height;

        const temperature = this.noise.perlin2(nx * 2, ny * 2);
        const moisture = this.noise.perlin2(nx * 2 + 1000, ny * 2 + 1000);

        biomes[y][x] = this.getBiome(temperature, moisture);
      }
    }

    return biomes;
  }

  private getBiome(temperature: number, moisture: number): Biome {
    if (temperature > 0.5) {
      if (moisture > 0.5) return Biome.FOREST;
      else return Biome.DESERT;
    } else {
      if (moisture > 0.5) return Biome.SWAMP;
      else return Biome.TUNDRA;
    }
  }

  private generatePointsOfInterest(difficulty: number): PointOfInterest[] {
    const poi: PointOfInterest[] = [];
    const numPOI = Math.floor(this.random(5, 15) + difficulty * 3);

    for (let i = 0; i < numPOI; i++) {
      const x = Math.floor(this.random(0, this.width));
      const y = Math.floor(this.random(0, this.height));
      const type = this.selectPOIType(difficulty);

      poi.push(new PointOfInterest(x, y, type));
    }

    return poi;
  }

  private selectPOIType(difficulty: number): POIType {
    const types = [
      POIType.VILLAGE,
      POIType.DUNGEON,
      POIType.TREASURE,
      POIType.BOSS,
    ];
    const weights = [0.4, 0.3, 0.2, 0.1];

    // Adjust weights based on difficulty
    weights[3] += difficulty * 0.1; // More bosses at higher difficulty

    let random = this.random(0, 1);
    for (let i = 0; i < weights.length; i++) {
      random -= weights[i];
      if (random <= 0) return types[i];
    }
    return types[0];
  }
}

enum Biome {
  PLAINS,
  FOREST,
  DESERT,
  SWAMP,
  TUNDRA,
}

enum POIType {
  VILLAGE,
  DUNGEON,
  TREASURE,
  BOSS,
}

class PointOfInterest {
  constructor(public x: number, public y: number, public type: POIType) {}
}
```

### 5. Procedural Terrain Generation

```typescript
class TerrainGenerator {
  private noise: NoiseGenerator;
  private random: (min: number, max: number) => number;

  constructor(random: (min: number, max: number) => number) {
    this.noise = new NoiseGenerator();
    this.random = random;
  }

  generateTerrain(
    width: number,
    height: number,
    difficulty: number
  ): TerrainData {
    const elevation = this.generateElevation(width, height);
    const moisture = this.generateMoisture(width, height);
    const temperature = this.generateTemperature(width, height);

    return new TerrainData(elevation, moisture, temperature);
  }

  private generateElevation(width: number, height: number): number[][] {
    const elevation = Array(height)
      .fill(null)
      .map(() => Array(width).fill(0));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nx = x / width;
        const ny = y / height;

        // Multi-octave noise for realistic terrain
        let value = 0;
        let amplitude = 1;
        let frequency = 1;

        for (let i = 0; i < 4; i++) {
          value +=
            this.noise.perlin2(nx * frequency, ny * frequency) * amplitude;
          amplitude *= 0.5;
          frequency *= 2;
        }

        elevation[y][x] = value;
      }
    }

    return elevation;
  }

  private generateMoisture(width: number, height: number): number[][] {
    const moisture = Array(height)
      .fill(null)
      .map(() => Array(width).fill(0));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nx = x / width;
        const ny = y / height;

        moisture[y][x] = this.noise.perlin2(nx * 3 + 1000, ny * 3 + 1000);
      }
    }

    return moisture;
  }

  private generateTemperature(width: number, height: number): number[][] {
    const temperature = Array(height)
      .fill(null)
      .map(() => Array(width).fill(0));

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const nx = x / width;
        const ny = y / height;

        // Temperature varies with latitude (y position)
        const latitude = ny;
        const noise = this.noise.perlin2(nx * 2 + 2000, ny * 2 + 2000) * 0.3;

        temperature[y][x] = 1 - latitude + noise;
      }
    }

    return temperature;
  }
}

class TerrainData {
  constructor(
    public elevation: number[][],
    public moisture: number[][],
    public temperature: number[][]
  ) {}
}
```

### 6. Level Difficulty Scaling

```typescript
class DifficultyScaler {
  private baseDifficulty: number;
  private playerLevel: number;
  private levelNumber: number;

  constructor(baseDifficulty: number = 1.0) {
    this.baseDifficulty = baseDifficulty;
    this.playerLevel = 1;
    this.levelNumber = 1;
  }

  calculateDifficulty(): number {
    // Base difficulty increases with level number
    let difficulty = this.baseDifficulty + (this.levelNumber - 1) * 0.2;

    // Adjust for player level (catch-up mechanism)
    const levelDifference = this.playerLevel - this.levelNumber;
    if (levelDifference > 0) {
      difficulty *= 1 + levelDifference * 0.1;
    }

    // Add some randomness
    difficulty += (Math.random() - 0.5) * 0.1;

    return Math.max(0.1, Math.min(5.0, difficulty));
  }

  scaleEnemyCount(difficulty: number): number {
    return Math.floor(3 + difficulty * 2);
  }

  scaleEnemyHealth(difficulty: number): number {
    return 100 + difficulty * 50;
  }

  scaleEnemyDamage(difficulty: number): number {
    return 10 + difficulty * 5;
  }

  scaleRewardValue(difficulty: number): number {
    return 100 + difficulty * 25;
  }

  updatePlayerLevel(level: number): void {
    this.playerLevel = level;
  }

  nextLevel(): void {
    this.levelNumber++;
  }
}
```

### 7. Level Validation and Balancing

```typescript
class LevelValidator {
  validateLevel(level: Level): ValidationResult {
    const result = new ValidationResult();

    // Check if level is completable
    if (!this.isCompletable(level)) {
      result.addError("Level is not completable");
    }

    // Check difficulty balance
    if (!this.isBalanced(level)) {
      result.addWarning("Level difficulty may be unbalanced");
    }

    // Check for required elements
    if (!this.hasRequiredElements(level)) {
      result.addError("Level missing required elements");
    }

    // Check performance
    if (!this.isPerformant(level)) {
      result.addWarning("Level may have performance issues");
    }

    return result;
  }

  private isCompletable(level: Level): boolean {
    // Check if there's a path from start to end
    const layout = level.getLayout();
    const start = this.findStart(layout);
    const end = this.findEnd(layout);

    if (!start || !end) return false;

    return this.pathExists(layout, start, end);
  }

  private isBalanced(level: Level): boolean {
    const difficulty = level.getDifficulty();
    const enemies = level.getEnemies();
    const rewards = level.getCollectibles();

    // Check enemy-to-reward ratio
    const enemyValue = enemies.reduce(
      (sum, enemy) => sum + enemy.getThreatValue(),
      0
    );
    const rewardValue = rewards.reduce(
      (sum, reward) => sum + reward.getValue(),
      0
    );

    const ratio = rewardValue / enemyValue;
    return ratio >= 0.5 && ratio <= 2.0;
  }

  private hasRequiredElements(level: Level): boolean {
    const layout = level.getLayout();
    const enemies = level.getEnemies();
    const rewards = level.getCollectibles();

    return (
      layout.hasStart() &&
      layout.hasEnd() &&
      enemies.length > 0 &&
      rewards.length > 0
    );
  }

  private isPerformant(level: Level): boolean {
    const enemies = level.getEnemies();
    const obstacles = level.getObstacles();
    const collectibles = level.getCollectibles();

    const totalObjects =
      enemies.length + obstacles.length + collectibles.length;
    return totalObjects <= 100; // Arbitrary limit
  }
}

class ValidationResult {
  private errors: string[] = [];
  private warnings: string[] = [];

  addError(error: string): void {
    this.errors.push(error);
  }

  addWarning(warning: string): void {
    this.warnings.push(warning);
  }

  isValid(): boolean {
    return this.errors.length === 0;
  }

  getErrors(): string[] {
    return this.errors;
  }

  getWarnings(): string[] {
    return this.warnings;
  }
}
```

### 8. Usage Examples

```typescript
// Initialize level generation system
const designRules = new LevelDesignRules({
  minRoomSize: 3,
  maxRoomSize: 8,
  minRooms: 3,
  maxRooms: 8,
  difficultyScaling: 0.2,
});

const assetManager = new ProceduralAssetManager(designSystem);
const levelGenerator = new LevelGenerator(
  Date.now(),
  designRules,
  assetManager
);

// Generate levels
for (let i = 1; i <= 10; i++) {
  const difficulty = 1 + (i - 1) * 0.2;
  const level = levelGenerator.generateLevel(i, difficulty);

  // Validate level
  const validator = new LevelValidator();
  const validation = validator.validateLevel(level);

  if (validation.isValid()) {
    console.log(`Level ${i} generated successfully`);
    // Add level to game
  } else {
    console.error(`Level ${i} validation failed:`, validation.getErrors());
    // Regenerate or fix level
  }
}

// Generate infinite levels
let currentLevel = 1;
function generateNextLevel() {
  const difficulty = 1 + (currentLevel - 1) * 0.1;
  const level = levelGenerator.generateLevel(currentLevel, difficulty);

  // Use level in game
  game.loadLevel(level);
  currentLevel++;
}
```

### 9. Benefits of Procedural Level Generation

1. **Infinite Content**: Generate unlimited levels without manual design
2. **Consistent Quality**: Algorithmic generation ensures balanced gameplay
3. **Scalable Difficulty**: Automatic difficulty scaling based on player progress
4. **Reduced Development Time**: No need to manually design each level
5. **Dynamic Adaptation**: Adjust generation based on player behavior and preferences
6. **Memory Efficient**: Generate levels on-demand and dispose when not needed
7. **Variety**: Each level is unique while maintaining design consistency
8. **Testing**: Easy to generate test levels for gameplay validation

---

## Game State Management

### 1. State Machine

```typescript
class StateMachine<T extends string> {
  private currentState: T;
  private states: Map<T, State<T>> = new Map();
  private transitions: Map<string, T> = new Map();

  constructor(initialState: T) {
    this.currentState = initialState;
  }

  addState(state: T, stateHandler: State<T>): void {
    this.states.set(state, stateHandler);
  }

  addTransition(from: T, to: T, condition: () => boolean): void {
    const key = `${from}->${to}`;
    this.transitions.set(key, to);
  }

  update(deltaTime: number): void {
    const currentStateHandler = this.states.get(this.currentState);
    if (currentStateHandler) {
      currentStateHandler.update(deltaTime);
    }

    // Check transitions
    this.checkTransitions();
  }

  private checkTransitions(): void {
    this.transitions.forEach((toState, key) => {
      const [fromState] = key.split("->");
      if (fromState === this.currentState) {
        // Check transition condition here
        // For simplicity, we'll assume immediate transition
        this.changeState(toState);
      }
    });
  }

  changeState(newState: T): void {
    const currentStateHandler = this.states.get(this.currentState);
    const newStateHandler = this.states.get(newState);

    if (currentStateHandler?.exit) {
      currentStateHandler.exit();
    }

    this.currentState = newState;

    if (newStateHandler?.enter) {
      newStateHandler.enter();
    }
  }
}

interface State<T> {
  enter?: () => void;
  update?: (deltaTime: number) => void;
  exit?: () => void;
}
```

### 2. Game State Management

```typescript
class GameStateManager {
  private currentState: GameState = GameState.LOADING;
  private stateHandlers: Map<GameState, StateHandler> = new Map();

  constructor() {
    this.initializeStateHandlers();
  }

  private initializeStateHandlers(): void {
    this.stateHandlers.set(GameState.LOADING, {
      enter: () => this.startLoading(),
      update: (deltaTime) => this.updateLoading(deltaTime),
      exit: () => this.finishLoading(),
    });

    this.stateHandlers.set(GameState.PLAYING, {
      enter: () => this.startGame(),
      update: (deltaTime) => this.updateGame(deltaTime),
      exit: () => this.pauseGame(),
    });

    // Add other state handlers...
  }

  changeState(newState: GameState): void {
    const currentHandler = this.stateHandlers.get(this.currentState);
    const newHandler = this.stateHandlers.get(newState);

    currentHandler?.exit?.();
    this.currentState = newState;
    newHandler?.enter?.();
  }

  update(deltaTime: number): void {
    const currentHandler = this.stateHandlers.get(this.currentState);
    currentHandler?.update?.(deltaTime);
  }
}

interface StateHandler {
  enter?: () => void;
  update?: (deltaTime: number) => void;
  exit?: () => void;
}
```

---

## Input Handling

### 1. Input System

```typescript
class InputSystem {
  private keys: Map<string, boolean> = new Map();
  private mousePosition: THREE.Vector2 = new THREE.Vector2();
  private mouseButtons: Map<number, boolean> = new Map();
  private eventManager: EventManager;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener("keydown", (event) => {
      this.keys.set(event.code, true);
      this.eventManager.emit("input:keydown", { code: event.code });
    });

    document.addEventListener("keyup", (event) => {
      this.keys.set(event.code, false);
      this.eventManager.emit("input:keyup", { code: event.code });
    });

    // Mouse events
    document.addEventListener("mousemove", (event) => {
      this.mousePosition.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mousePosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
      this.eventManager.emit("input:mousemove", {
        position: this.mousePosition,
      });
    });

    document.addEventListener("mousedown", (event) => {
      this.mouseButtons.set(event.button, true);
      this.eventManager.emit("input:mousedown", { button: event.button });
    });

    document.addEventListener("mouseup", (event) => {
      this.mouseButtons.set(event.button, false);
      this.eventManager.emit("input:mouseup", { button: event.button });
    });
  }

  isKeyPressed(keyCode: string): boolean {
    return this.keys.get(keyCode) || false;
  }

  isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.get(button) || false;
  }

  getMousePosition(): THREE.Vector2 {
    return this.mousePosition.clone();
  }
}
```

### 2. Input Mapping

```typescript
class InputMapper {
  private mappings: Map<string, string[]> = new Map();
  private inputSystem: InputSystem;

  constructor(inputSystem: InputSystem) {
    this.inputSystem = inputSystem;
  }

  addMapping(action: string, keys: string[]): void {
    this.mappings.set(action, keys);
  }

  isActionPressed(action: string): boolean {
    const keys = this.mappings.get(action);
    if (!keys) return false;

    return keys.some((key) => this.inputSystem.isKeyPressed(key));
  }

  getActionValue(action: string): number {
    const keys = this.mappings.get(action);
    if (!keys) return 0;

    // For continuous actions (like movement)
    let value = 0;
    keys.forEach((key) => {
      if (this.inputSystem.isKeyPressed(key)) {
        value += 1;
      }
    });

    return value;
  }
}

// Usage
const inputMapper = new InputMapper(inputSystem);
inputMapper.addMapping("move_forward", ["KeyW", "ArrowUp"]);
inputMapper.addMapping("move_backward", ["KeyS", "ArrowDown"]);
inputMapper.addMapping("move_left", ["KeyA", "ArrowLeft"]);
inputMapper.addMapping("move_right", ["KeyD", "ArrowRight"]);
inputMapper.addMapping("jump", ["Space"]);
```

---

## Audio Management

### Procedural Audio Generation from Waveforms

Instead of loading external audio assets, generate audio procedurally using Web Audio API and mathematical waveforms. This approach reduces asset dependencies, enables dynamic audio generation, and provides better performance.

### 1. Waveform Generator

```typescript
class WaveformGenerator {
  private audioContext: AudioContext;
  private sampleRate: number;

  constructor() {
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    this.sampleRate = this.audioContext.sampleRate;
  }

  // Generate sine wave
  generateSineWave(
    frequency: number,
    duration: number,
    amplitude: number = 0.5
  ): AudioBuffer {
    const buffer = this.audioContext.createBuffer(
      1,
      this.sampleRate * duration,
      this.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      data[i] =
        amplitude * Math.sin((2 * Math.PI * frequency * i) / this.sampleRate);
    }

    return buffer;
  }

  // Generate square wave
  generateSquareWave(
    frequency: number,
    duration: number,
    amplitude: number = 0.5
  ): AudioBuffer {
    const buffer = this.audioContext.createBuffer(
      1,
      this.sampleRate * duration,
      this.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const phase = ((frequency * i) / this.sampleRate) % 1;
      data[i] = amplitude * (phase < 0.5 ? 1 : -1);
    }

    return buffer;
  }

  // Generate sawtooth wave
  generateSawtoothWave(
    frequency: number,
    duration: number,
    amplitude: number = 0.5
  ): AudioBuffer {
    const buffer = this.audioContext.createBuffer(
      1,
      this.sampleRate * duration,
      this.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const phase = ((frequency * i) / this.sampleRate) % 1;
      data[i] = amplitude * (2 * phase - 1);
    }

    return buffer;
  }

  // Generate triangle wave
  generateTriangleWave(
    frequency: number,
    duration: number,
    amplitude: number = 0.5
  ): AudioBuffer {
    const buffer = this.audioContext.createBuffer(
      1,
      this.sampleRate * duration,
      this.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const phase = ((frequency * i) / this.sampleRate) % 1;
      data[i] = amplitude * (phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase);
    }

    return buffer;
  }

  // Generate noise
  generateNoise(duration: number, amplitude: number = 0.5): AudioBuffer {
    const buffer = this.audioContext.createBuffer(
      1,
      this.sampleRate * duration,
      this.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      data[i] = amplitude * (Math.random() * 2 - 1);
    }

    return buffer;
  }

  // Generate complex waveform with harmonics
  generateHarmonicWave(
    baseFrequency: number,
    duration: number,
    harmonics: Array<{ frequency: number; amplitude: number }>,
    amplitude: number = 0.5
  ): AudioBuffer {
    const buffer = this.audioContext.createBuffer(
      1,
      this.sampleRate * duration,
      this.sampleRate
    );
    const data = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      let sample = 0;
      harmonics.forEach((harmonic) => {
        const freq = baseFrequency * harmonic.frequency;
        sample +=
          harmonic.amplitude *
          Math.sin((2 * Math.PI * freq * i) / this.sampleRate);
      });
      data[i] = amplitude * sample;
    }

    return buffer;
  }

  // Apply envelope (ADSR)
  applyEnvelope(
    buffer: AudioBuffer,
    attack: number,
    decay: number,
    sustain: number,
    release: number
  ): AudioBuffer {
    const newBuffer = this.audioContext.createBuffer(
      buffer.numberOfChannels,
      buffer.length,
      buffer.sampleRate
    );

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const inputData = buffer.getChannelData(channel);
      const outputData = newBuffer.getChannelData(channel);

      const attackSamples = Math.floor(attack * this.sampleRate);
      const decaySamples = Math.floor(decay * this.sampleRate);
      const releaseSamples = Math.floor(release * this.sampleRate);
      const sustainStart = attackSamples + decaySamples;
      const releaseStart = buffer.length - releaseSamples;

      for (let i = 0; i < buffer.length; i++) {
        let envelope = 0;

        if (i < attackSamples) {
          // Attack phase
          envelope = i / attackSamples;
        } else if (i < sustainStart) {
          // Decay phase
          envelope = 1 - ((1 - sustain) * (i - attackSamples)) / decaySamples;
        } else if (i < releaseStart) {
          // Sustain phase
          envelope = sustain;
        } else {
          // Release phase
          envelope = sustain * (1 - (i - releaseStart) / releaseSamples);
        }

        outputData[i] = inputData[i] * envelope;
      }
    }

    return newBuffer;
  }
}
```

### 2. Procedural Audio System

```typescript
class ProceduralAudioSystem {
  private audioContext: AudioContext;
  private waveformGenerator: WaveformGenerator;
  private sounds: Map<string, AudioBuffer> = new Map();
  private music: Map<string, AudioBuffer> = new Map();
  private masterGain: GainNode;
  private sfxGain: GainNode;
  private musicGain: GainNode;
  private masterVolume: number = 1.0;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 1.0;

  constructor() {
    this.audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    this.waveformGenerator = new WaveformGenerator();

    // Create gain nodes for volume control
    this.masterGain = this.audioContext.createGain();
    this.sfxGain = this.audioContext.createGain();
    this.musicGain = this.audioContext.createGain();

    // Connect gain nodes
    this.sfxGain.connect(this.masterGain);
    this.musicGain.connect(this.masterGain);
    this.masterGain.connect(this.audioContext.destination);

    this.updateVolumes();
  }

  // Generate common game sounds
  generateGameSounds(): void {
    // Jump sound (ascending sine wave)
    const jumpSound = this.waveformGenerator.generateSineWave(440, 0.2, 0.3);
    this.sounds.set("jump", jumpSound);

    // Collect sound (ascending triangle wave)
    const collectSound = this.waveformGenerator.generateTriangleWave(
      800,
      0.1,
      0.4
    );
    this.sounds.set("collect", collectSound);

    // Explosion sound (noise with envelope)
    const explosionNoise = this.waveformGenerator.generateNoise(0.5, 0.8);
    const explosionSound = this.waveformGenerator.applyEnvelope(
      explosionNoise,
      0.01,
      0.1,
      0.3,
      0.4
    );
    this.sounds.set("explosion", explosionSound);

    // Laser sound (square wave with harmonics)
    const laserHarmonics = [
      { frequency: 1, amplitude: 1.0 },
      { frequency: 2, amplitude: 0.5 },
      { frequency: 3, amplitude: 0.3 },
    ];
    const laserSound = this.waveformGenerator.generateHarmonicWave(
      200,
      0.3,
      laserHarmonics,
      0.4
    );
    this.sounds.set("laser", laserSound);

    // Footstep sound (filtered noise)
    const footstepNoise = this.waveformGenerator.generateNoise(0.1, 0.2);
    this.sounds.set("footstep", footstepNoise);

    // UI click sound (short sine wave)
    const clickSound = this.waveformGenerator.generateSineWave(1000, 0.05, 0.3);
    this.sounds.set("click", clickSound);
  }

  // Generate procedural music
  generateProceduralMusic(): void {
    // Generate different music patterns
    this.generateAmbientMusic();
    this.generateActionMusic();
    this.generateVictoryMusic();
  }

  private generateAmbientMusic(): void {
    // Create ambient music using multiple sine waves
    const ambientBuffer = this.audioContext.createBuffer(
      1,
      this.audioContext.sampleRate * 10,
      this.audioContext.sampleRate
    );
    const data = ambientBuffer.getChannelData(0);

    const frequencies = [220, 330, 440, 550]; // A major chord
    const amplitudes = [0.1, 0.08, 0.06, 0.04];

    for (let i = 0; i < ambientBuffer.length; i++) {
      let sample = 0;
      frequencies.forEach((freq, index) => {
        sample +=
          amplitudes[index] *
          Math.sin((2 * Math.PI * freq * i) / this.audioContext.sampleRate);
      });
      data[i] = sample;
    }

    this.music.set("ambient", ambientBuffer);
  }

  private generateActionMusic(): void {
    // Create action music with faster tempo and more harmonics
    const actionBuffer = this.audioContext.createBuffer(
      1,
      this.audioContext.sampleRate * 8,
      this.audioContext.sampleRate
    );
    const data = actionBuffer.getChannelData(0);

    const baseFreq = 110; // A2
    const harmonics = [
      { frequency: 1, amplitude: 0.3 },
      { frequency: 2, amplitude: 0.2 },
      { frequency: 3, amplitude: 0.15 },
      { frequency: 5, amplitude: 0.1 },
    ];

    for (let i = 0; i < actionBuffer.length; i++) {
      let sample = 0;
      harmonics.forEach((harmonic) => {
        const freq = baseFreq * harmonic.frequency;
        sample +=
          harmonic.amplitude *
          Math.sin((2 * Math.PI * freq * i) / this.audioContext.sampleRate);
      });
      data[i] = sample;
    }

    this.music.set("action", actionBuffer);
  }

  private generateVictoryMusic(): void {
    // Create victory fanfare
    const victoryBuffer = this.audioContext.createBuffer(
      1,
      this.audioContext.sampleRate * 3,
      this.audioContext.sampleRate
    );
    const data = victoryBuffer.getChannelData(0);

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const noteDuration = 0.5; // 0.5 seconds per note
    const samplesPerNote = Math.floor(
      this.audioContext.sampleRate * noteDuration
    );

    for (let i = 0; i < victoryBuffer.length; i++) {
      const noteIndex = Math.floor(i / samplesPerNote);
      if (noteIndex < notes.length) {
        const freq = notes[noteIndex];
        const noteStart = noteIndex * samplesPerNote;
        const notePosition = i - noteStart;
        data[i] =
          0.3 *
          Math.sin(
            (2 * Math.PI * freq * notePosition) / this.audioContext.sampleRate
          );
      }
    }

    this.music.set("victory", victoryBuffer);
  }

  // Play generated sounds
  playSound(name: string, position?: THREE.Vector3): void {
    const buffer = this.sounds.get(name);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    if (position) {
      // 3D spatial audio
      const panner = this.audioContext.createPanner();
      panner.setPosition(position.x, position.y, position.z);
      source.connect(panner);
      panner.connect(this.sfxGain);
    } else {
      source.connect(this.sfxGain);
    }

    source.start();
  }

  // Play music with looping
  playMusic(name: string): void {
    this.stopAllMusic();

    const buffer = this.music.get(name);
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(this.musicGain);
    source.start();

    // Store reference to stop later
    this.currentMusic = source;
  }

  stopAllMusic(): void {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  // Volume controls
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateVolumes();
  }

  private updateVolumes(): void {
    this.masterGain.gain.value = this.masterVolume;
    this.sfxGain.gain.value = this.sfxVolume;
    this.musicGain.gain.value = this.musicVolume;
  }

  // Dynamic sound generation based on game events
  generateDynamicSound(event: string, parameters: any): AudioBuffer {
    switch (event) {
      case "collision":
        return this.generateCollisionSound(
          parameters.velocity,
          parameters.material
        );
      case "explosion":
        return this.generateExplosionSound(
          parameters.size,
          parameters.distance
        );
      case "footstep":
        return this.generateFootstepSound(
          parameters.surface,
          parameters.weight
        );
      default:
        return this.waveformGenerator.generateSineWave(440, 0.1, 0.3);
    }
  }

  private generateCollisionSound(
    velocity: number,
    material: string
  ): AudioBuffer {
    const frequency = Math.min(800, 200 + velocity * 10);
    const duration = Math.min(0.5, 0.1 + velocity * 0.01);
    const amplitude = Math.min(0.8, 0.2 + velocity * 0.01);

    let buffer: AudioBuffer;
    switch (material) {
      case "metal":
        buffer = this.waveformGenerator.generateSquareWave(
          frequency,
          duration,
          amplitude
        );
        break;
      case "wood":
        buffer = this.waveformGenerator.generateTriangleWave(
          frequency,
          duration,
          amplitude
        );
        break;
      default:
        buffer = this.waveformGenerator.generateSineWave(
          frequency,
          duration,
          amplitude
        );
    }

    return this.waveformGenerator.applyEnvelope(buffer, 0.01, 0.1, 0.2, 0.3);
  }

  private generateExplosionSound(size: number, distance: number): AudioBuffer {
    const baseFreq = 50 + size * 20;
    const duration = 0.5 + size * 0.5;
    const amplitude = Math.max(0.1, 0.8 - distance * 0.1);

    const explosionNoise = this.waveformGenerator.generateNoise(
      duration,
      amplitude
    );
    return this.waveformGenerator.applyEnvelope(
      explosionNoise,
      0.01,
      0.2,
      0.4,
      0.8
    );
  }

  private generateFootstepSound(surface: string, weight: number): AudioBuffer {
    const frequency = 200 + weight * 50;
    const duration = 0.1 + weight * 0.05;
    const amplitude = 0.2 + weight * 0.1;

    let buffer: AudioBuffer;
    switch (surface) {
      case "grass":
        buffer = this.waveformGenerator.generateNoise(
          duration,
          amplitude * 0.5
        );
        break;
      case "stone":
        buffer = this.waveformGenerator.generateSquareWave(
          frequency,
          duration,
          amplitude
        );
        break;
      case "wood":
        buffer = this.waveformGenerator.generateTriangleWave(
          frequency,
          duration,
          amplitude
        );
        break;
      default:
        buffer = this.waveformGenerator.generateSineWave(
          frequency,
          duration,
          amplitude
        );
    }

    return this.waveformGenerator.applyEnvelope(buffer, 0.01, 0.05, 0.1, 0.2);
  }
}
```

### 3. Usage Examples

```typescript
// Initialize audio system
const audioSystem = new ProceduralAudioSystem();

// Generate all game sounds
audioSystem.generateGameSounds();
audioSystem.generateProceduralMusic();

// Play sounds
audioSystem.playSound("jump");
audioSystem.playSound("collect");
audioSystem.playSound("explosion");

// Play music
audioSystem.playMusic("ambient");

// Generate dynamic sounds based on game events
const collisionSound = audioSystem.generateDynamicSound("collision", {
  velocity: 10,
  material: "metal",
});

// 3D spatial audio
const explosionPosition = new THREE.Vector3(10, 0, 5);
audioSystem.playSound("explosion", explosionPosition);
```

### 4. Benefits of Procedural Audio

1. **No External Assets**: Reduces bundle size and loading times
2. **Dynamic Generation**: Sounds can be created based on game events and parameters
3. **Infinite Variety**: Generate unique sounds for each interaction
4. **Performance**: No file I/O or network requests for audio
5. **Real-time Adaptation**: Adjust audio based on game state, player actions, or environment
6. **Memory Efficient**: Generate sounds on-demand and dispose when not needed
7. **Cross-platform**: Works consistently across all platforms without asset compatibility issues

---

## Testing Strategy

### 1. Unit Testing Setup

```typescript
// Example test structure
describe("GameEngine", () => {
  let engine: GameEngine;

  beforeEach(() => {
    engine = new GameEngine();
  });

  afterEach(() => {
    engine.dispose();
  });

  it("should initialize with default scene", () => {
    expect(engine.getScene()).toBeDefined();
    expect(engine.getRenderer()).toBeDefined();
  });

  it("should add entities correctly", () => {
    const entity = new MockEntity();
    engine.addEntity(entity);
    expect(engine.getEntities()).toContain(entity);
  });
});

// Mock classes for testing
class MockEntity extends Entity {
  update(deltaTime: number): void {
    // Mock implementation
  }
}
```

### 2. Performance Testing

```typescript
class PerformanceMonitor {
  private frameTimes: number[] = [];
  private maxSamples: number = 60;

  updateFrameTime(frameTime: number): void {
    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > this.maxSamples) {
      this.frameTimes.shift();
    }
  }

  getAverageFPS(): number {
    if (this.frameTimes.length === 0) return 0;
    const averageFrameTime =
      this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    return 1000 / averageFrameTime;
  }

  getMinFPS(): number {
    if (this.frameTimes.length === 0) return 0;
    const maxFrameTime = Math.max(...this.frameTimes);
    return 1000 / maxFrameTime;
  }

  getMaxFPS(): number {
    if (this.frameTimes.length === 0) return 0;
    const minFrameTime = Math.min(...this.frameTimes);
    return 1000 / minFrameTime;
  }
}
```

---

## Build and Deployment

### 1. Build Configuration (Vite)

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    target: "es2020",
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        manualChunks: {
          three: ["three"],
          vendor: ["lodash", "uuid"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["three"],
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

### 2. Environment Configuration

```typescript
// config/environment.ts
interface Environment {
  isDevelopment: boolean;
  isProduction: boolean;
  apiUrl: string;
  assetUrl: string;
  debugMode: boolean;
}

const environment: Environment = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000",
  assetUrl: import.meta.env.VITE_ASSET_URL || "/assets",
  debugMode: import.meta.env.VITE_DEBUG_MODE === "true",
};

export default environment;
```

### 3. Asset Optimization

```typescript
// utils/assetOptimizer.ts
class AssetOptimizer {
  static optimizeTexture(texture: THREE.Texture): void {
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.flipY = false; // For better performance
  }

  static optimizeGeometry(geometry: THREE.BufferGeometry): void {
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    geometry.computeVertexNormals();
  }

  static optimizeMaterial(material: THREE.Material): void {
    material.side = THREE.FrontSide; // Only render front faces
    material.transparent = false; // Disable transparency if not needed
    material.depthWrite = true;
    material.depthTest = true;
  }
}
```

---

## Code Quality and Standards

### 1. ESLint Configuration

```json
{
  "extends": ["@typescript-eslint/recommended", "eslint:recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

### 2. Prettier Configuration

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 3. Git Hooks (Husky)

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

### 4. Documentation Standards

````typescript
/**
 * Represents a game object in the 3D world.
 *
 * @example
 * ```typescript
 * const player = new GameObject('player');
 * player.addComponent(new TransformComponent());
 * player.addComponent(new MeshComponent(geometry, material));
 * ```
 */
class GameObject {
  /**
   * Creates a new game object.
   *
   * @param id - Unique identifier for the game object
   * @param position - Initial position in 3D space
   * @param rotation - Initial rotation
   * @param scale - Initial scale
   */
  constructor(
    public readonly id: string,
    position: THREE.Vector3 = new THREE.Vector3(),
    rotation: THREE.Euler = new THREE.Euler(),
    scale: THREE.Vector3 = new THREE.Vector3(1, 1, 1)
  ) {
    // Implementation
  }

  /**
   * Updates the game object for the current frame.
   *
   * @param deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime: number): void {
    // Implementation
  }
}
````

---

## Performance Monitoring and Debugging

### 1. Debug UI

```typescript
class DebugUI {
  private stats: Stats;
  private debugInfo: HTMLElement;

  constructor() {
    this.stats = new Stats();
    this.stats.dom.style.position = "absolute";
    this.stats.dom.style.top = "0px";
    this.stats.dom.style.left = "0px";
    document.body.appendChild(this.stats.dom);

    this.debugInfo = document.createElement("div");
    this.debugInfo.style.position = "absolute";
    this.debugInfo.style.top = "60px";
    this.debugInfo.style.left = "10px";
    this.debugInfo.style.color = "white";
    this.debugInfo.style.fontFamily = "monospace";
    document.body.appendChild(this.debugInfo);
  }

  update(engine: GameEngine, performanceMonitor: PerformanceMonitor): void {
    this.stats.update();

    const fps = performanceMonitor.getAverageFPS();
    const entityCount = engine.getEntities().length;
    const drawCalls = engine.getRenderer().info.render.calls;

    this.debugInfo.innerHTML = `
      FPS: ${fps.toFixed(1)}<br>
      Entities: ${entityCount}<br>
      Draw Calls: ${drawCalls}<br>
      Triangles: ${engine.getRenderer().info.render.triangles}<br>
      Memory: ${
        engine.getRenderer().info.memory.geometries +
        engine.getRenderer().info.memory.textures
      } objects
    `;
  }
}
```

### 2. Memory Management

```typescript
class MemoryManager {
  private disposedObjects: Set<THREE.Object3D> = new Set();

  disposeObject(object: THREE.Object3D): void {
    if (this.disposedObjects.has(object)) return;

    // Dispose geometry
    if (object instanceof THREE.Mesh && object.geometry) {
      object.geometry.dispose();
    }

    // Dispose materials
    if (object instanceof THREE.Mesh && object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach((material) => material.dispose());
      } else {
        object.material.dispose();
      }
    }

    // Dispose textures
    if (object.material) {
      const materials = Array.isArray(object.material)
        ? object.material
        : [object.material];
      materials.forEach((material) => {
        Object.values(material).forEach((value) => {
          if (value instanceof THREE.Texture) {
            value.dispose();
          }
        });
      });
    }

    this.disposedObjects.add(object);
  }

  clearDisposedObjects(): void {
    this.disposedObjects.clear();
  }
}
```

---

## Game Type-Specific Strategies and Libraries

### Game Complexity Assessment Framework

Before choosing your architecture and libraries, assess your game's complexity using these factors:

1. **Visual Complexity**: Number of objects, shader complexity, lighting requirements
2. **Gameplay Complexity**: AI, physics, networking, real-time interactions
3. **Asset Requirements**: 3D models, textures, audio, animations
4. **Performance Targets**: Target platforms, frame rate requirements
5. **Development Timeline**: Team size, experience level, time constraints

### Game Type Recommendations

#### 1. Simple 3D Games (Puzzle, Casual, Educational)

**Examples**: 3D puzzles, simple exploration games, educational simulations

**Recommended Architecture**:

- **Complexity Level**: Low to Medium
- **Architecture**: Simple component-based (no full ECS needed)
- **State Management**: Basic state machine or simple event system
- **Physics**: Three.js built-in or simple custom physics

**Libraries**:

```typescript
// Core dependencies
{
  "three": "^0.160.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0"
}

// Optional for simple games
{
  "zustand": "^4.4.0",        // Simple state management
  "gsap": "^3.12.0",          // Simple animations
  "cannon-es": "^0.20.0"      // Basic physics (if needed)
}
```

**Project Structure**:

```
src/
├── core/
│   ├── Game.ts              # Simple game class
│   └── Scene.ts             # Basic scene management
├── objects/                 # Game objects (not full ECS)
├── utils/
└── assets/
```

**Performance Strategies**:

- Basic frustum culling
- Simple LOD (2-3 levels max)
- Texture atlasing
- Minimal post-processing

#### 2. Action/Adventure Games

**Examples**: Third-person adventures, action RPGs, exploration games

**Recommended Architecture**:

- **Complexity Level**: Medium to High
- **Architecture**: Full ECS with component systems
- **State Management**: Complex state machine with substates
- **Physics**: Advanced physics engine with collision detection

**Libraries**:

```typescript
// Core dependencies
{
  "three": "^0.160.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0"
}

// Essential for action games
{
  "cannon-es": "^0.20.0",           // Physics engine
  "three-mesh-bvh": "^0.6.0",       // Collision optimization
  "zustand": "^4.4.0",              // State management
  "gsap": "^3.12.0",                // Animations
  "three-stdlib": "^2.29.0",        // Three.js utilities
  "stats.js": "^0.17.0"             // Performance monitoring
}

// Optional advanced features
{
  "ammo.js": "^0.0.10",             // Advanced physics
  "three-mesh-bvh": "^0.6.0",       // Spatial partitioning
  "postprocessing": "^6.33.0"       // Post-processing effects
}
```

**Project Structure**:

```
src/
├── core/                    # Full ECS implementation
├── entities/               # Game entities
├── components/             # ECS components
├── systems/                # ECS systems
├── managers/               # Resource managers
├── ai/                     # AI systems
├── combat/                 # Combat systems
└── ui/                     # HUD and menus
```

**Performance Strategies**:

- Advanced LOD with distance-based switching
- Spatial partitioning (octree/quadtree)
- Object pooling for projectiles/effects
- Shader optimization
- Texture streaming

#### 3. First-Person Games (FPS, Exploration)

**Examples**: First-person shooters, VR experiences, exploration games

**Recommended Architecture**:

- **Complexity Level**: High
- **Architecture**: Full ECS with advanced systems
- **State Management**: Complex state machine with networking considerations
- **Physics**: Advanced physics with networking synchronization

**Libraries**:

```typescript
// Core dependencies
{
  "three": "^0.160.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0"
}

// Essential for FPS games
{
  "cannon-es": "^0.20.0",           // Physics
  "three-mesh-bvh": "^0.6.0",       // Collision detection
  "zustand": "^4.4.0",              // State management
  "gsap": "^3.12.0",                // Animations
  "three-stdlib": "^2.29.0",        // Utilities
  "stats.js": "^0.17.0",            // Performance monitoring
  "postprocessing": "^6.33.0"       // Post-processing
}

// Networking (if multiplayer)
{
  "socket.io-client": "^4.7.0",     // Real-time networking
  "colyseus.js": "^0.15.0"          // Game server framework
}

// Advanced features
{
  "ammo.js": "^0.0.10",             // Advanced physics
  "three-mesh-bvh": "^0.6.0",       // Spatial partitioning
  "three-gpu-pathtracer": "^0.0.0"  // Ray tracing (experimental)
}
```

**Project Structure**:

```
src/
├── core/                    # Advanced ECS
├── entities/
├── components/
├── systems/
│   ├── PhysicsSystem.ts
│   ├── InputSystem.ts
│   ├── AudioSystem.ts
│   ├── NetworkSystem.ts     # For multiplayer
│   └── VRSystem.ts          # For VR
├── networking/              # Network code
├── vr/                      # VR-specific code
└── postprocessing/          # Post-processing effects
```

**Performance Strategies**:

- Aggressive LOD with multiple levels
- Occlusion culling
- Shader instancing for repeated objects
- Texture streaming and compression
- Network optimization for multiplayer

#### 4. Strategy/Simulation Games

**Examples**: RTS games, city builders, simulation games

**Recommended Architecture**:

- **Complexity Level**: High
- **Architecture**: Data-oriented design with ECS
- **State Management**: Complex state with undo/redo
- **Physics**: Minimal physics, focus on simulation logic

**Libraries**:

```typescript
// Core dependencies
{
  "three": "^0.160.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0"
}

// Essential for strategy games
{
  "zustand": "^4.4.0",              // State management
  "immer": "^10.0.0",               // Immutable state updates
  "three-stdlib": "^2.29.0",        // Utilities
  "stats.js": "^0.17.0",            // Performance monitoring
  "gsap": "^3.12.0"                 // UI animations
}

// Optional for advanced features
{
  "three-mesh-bvh": "^0.6.0",       // Spatial queries
  "postprocessing": "^6.33.0",      // Visual effects
  "three-gpu-pathtracer": "^0.0.0"  // High-quality rendering
}
```

**Project Structure**:

```
src/
├── core/
├── simulation/              # Simulation logic
├── ai/                      # AI systems
├── ui/                      # Complex UI systems
├── data/                    # Game data structures
├── systems/
│   ├── SimulationSystem.ts
│   ├── AISystem.ts
│   └── UISystem.ts
└── utils/
    ├── Pathfinding.ts
    └── Algorithms.ts
```

**Performance Strategies**:

- Data-oriented design for large entity counts
- Efficient spatial queries
- UI optimization for complex interfaces
- Memory management for large datasets

#### 5. Mobile/Web Games

**Examples**: Mobile 3D games, web-based 3D experiences

**Recommended Architecture**:

- **Complexity Level**: Low to Medium
- **Architecture**: Simplified component-based
- **State Management**: Simple state management
- **Physics**: Minimal physics, touch-friendly controls

**Libraries**:

```typescript
// Core dependencies
{
  "three": "^0.160.0",
  "typescript": "^5.0.0",
  "vite": "^5.0.0"
}

// Essential for mobile/web
{
  "zustand": "^4.4.0",              // Lightweight state management
  "gsap": "^3.12.0",                // Touch-friendly animations
  "hammer.js": "^2.0.8",            // Touch gestures
  "stats.js": "^0.17.0"             // Performance monitoring
}

// Optional
{
  "three-mesh-bvh": "^0.6.0",       // If collision needed
  "postprocessing": "^6.33.0"       // Light post-processing
}
```

**Project Structure**:

```
src/
├── core/                    # Simplified architecture
├── objects/                 # Game objects
├── touch/                   # Touch controls
├── ui/                      # Mobile-friendly UI
└── utils/
```

**Performance Strategies**:

- Aggressive optimization for mobile GPUs
- Texture compression and size optimization
- Simplified shaders
- Touch-friendly UI design

### Library Selection Decision Matrix

| Game Type        | Physics           | Networking | Post-Processing | State Management | Animation |
| ---------------- | ----------------- | ---------- | --------------- | ---------------- | --------- |
| Simple 3D        | Optional          | None       | None            | Simple           | GSAP      |
| Action/Adventure | Cannon-es         | Optional   | Postprocessing  | Zustand          | GSAP      |
| FPS              | Cannon-es/Ammo.js | Socket.io  | Postprocessing  | Zustand          | GSAP      |
| Strategy         | Minimal           | Optional   | Optional        | Zustand+Immer    | GSAP      |
| Mobile/Web       | Optional          | None       | Minimal         | Zustand          | GSAP      |

### Performance Budget Guidelines

#### Low-End Devices (Mobile, Web)

- **Target FPS**: 30-60 FPS
- **Draw Calls**: < 100
- **Triangle Count**: < 50,000
- **Texture Memory**: < 256MB
- **Post-Processing**: Minimal or none

#### Mid-Range Devices (Desktop, High-end Mobile)

- **Target FPS**: 60 FPS
- **Draw Calls**: < 500
- **Triangle Count**: < 200,000
- **Texture Memory**: < 1GB
- **Post-Processing**: Moderate

#### High-End Devices (Gaming PC, VR)

- **Target FPS**: 60-90 FPS (VR: 90+)
- **Draw Calls**: < 2000
- **Triangle Count**: < 1,000,000
- **Texture Memory**: < 4GB
- **Post-Processing**: Full suite

### Development Timeline Considerations

#### Prototype Phase (1-2 months)

- Use simple architecture
- Focus on core gameplay
- Minimal optimization
- Basic assets

#### Alpha Phase (3-6 months)

- Implement full architecture
- Add performance optimizations
- Comprehensive asset pipeline
- Basic testing

#### Beta Phase (6-12 months)

- Polish and optimization
- Advanced features
- Comprehensive testing
- Performance tuning

#### Release Phase (12+ months)

- Final optimization
- Platform-specific tuning
- Extensive testing
- Documentation

### Team Size Considerations

#### Solo Developer (1 person)

- **Recommended**: Simple 3D, Mobile/Web games
- **Architecture**: Component-based, minimal ECS
- **Libraries**: Core Three.js + essential utilities
- **Timeline**: 6-12 months for simple games

#### Small Team (2-5 people)

- **Recommended**: Action/Adventure, Strategy games
- **Architecture**: Full ECS implementation
- **Libraries**: Comprehensive library stack
- **Timeline**: 12-24 months

#### Large Team (5+ people)

- **Recommended**: Complex FPS, AAA-style games
- **Architecture**: Advanced ECS with custom systems
- **Libraries**: Full library stack + custom solutions
- **Timeline**: 24+ months

### Technology Stack Recommendations by Game Type

#### Minimal Stack (Simple Games)

```typescript
// package.json
{
  "dependencies": {
    "three": "^0.160.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0"
  },
  "devDependencies": {
    "@types/three": "^0.160.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0"
  }
}
```

#### Standard Stack (Most Games)

```typescript
// package.json
{
  "dependencies": {
    "three": "^0.160.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "cannon-es": "^0.20.0",
    "zustand": "^4.4.0",
    "gsap": "^3.12.0",
    "three-stdlib": "^2.29.0",
    "stats.js": "^0.17.0"
  },
  "devDependencies": {
    "@types/three": "^0.160.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "vitest": "^1.0.0"
  }
}
```

#### Advanced Stack (Complex Games)

```typescript
// package.json
{
  "dependencies": {
    "three": "^0.160.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "cannon-es": "^0.20.0",
    "ammo.js": "^0.0.10",
    "zustand": "^4.4.0",
    "immer": "^10.0.0",
    "gsap": "^3.12.0",
    "three-stdlib": "^2.29.0",
    "three-mesh-bvh": "^0.6.0",
    "postprocessing": "^6.33.0",
    "stats.js": "^0.17.0",
    "socket.io-client": "^4.7.0"
  },
  "devDependencies": {
    "@types/three": "^0.160.0",
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "vitest": "^1.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

---

## Design Patterns and Architecture by Complexity Level

### Basic Games (Simple 3D, Mobile/Web, Educational)

#### Folder Structure

```
src/
├── main.ts                  # Entry point
├── game/
│   ├── Game.ts             # Main game class
│   ├── Scene.ts            # Scene management
│   └── Camera.ts           # Camera controller
├── objects/                # Game objects (simple classes)
│   ├── GameObject.ts       # Base game object
│   ├── Player.ts           # Player object
│   ├── Collectible.ts      # Collectible items
│   └── Obstacle.ts         # Obstacles
├── utils/
│   ├── MathUtils.ts        # Math helpers
│   ├── ThreeUtils.ts       # Three.js helpers
│   └── Constants.ts        # Game constants
├── assets/
│   ├── models/
│   ├── textures/
│   └── audio/
└── ui/
    ├── HUD.ts              # Simple HUD
    └── Menu.ts             # Basic menu
```

#### Design Patterns

**1. Simple Component Pattern**

```typescript
// Simple component-based approach (not full ECS)
class GameObject {
  private components: Map<string, any> = new Map();

  addComponent(name: string, component: any): void {
    this.components.set(name, component);
  }

  getComponent<T>(name: string): T | null {
    return this.components.get(name) || null;
  }

  update(deltaTime: number): void {
    this.components.forEach((component) => {
      if (component.update) {
        component.update(deltaTime);
      }
    });
  }
}

// Usage
class Player extends GameObject {
  constructor() {
    super();
    this.addComponent("transform", new TransformComponent());
    this.addComponent("mesh", new MeshComponent());
    this.addComponent("input", new InputComponent());
  }
}
```

**2. Simple State Machine**

```typescript
class SimpleStateMachine {
  private currentState: string = "idle";
  private states: Map<string, () => void> = new Map();

  addState(name: string, updateFn: () => void): void {
    this.states.set(name, updateFn);
  }

  changeState(newState: string): void {
    this.currentState = newState;
  }

  update(): void {
    const stateFn = this.states.get(this.currentState);
    if (stateFn) {
      stateFn();
    }
  }
}

// Usage
const playerState = new SimpleStateMachine();
playerState.addState("idle", () => {
  // Idle animation and logic
});
playerState.addState("walking", () => {
  // Walking animation and logic
});
```

**3. Simple Event System**

```typescript
class SimpleEventEmitter {
  private listeners: Map<string, Function[]> = new Map();

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach((callback) => callback(data));
  }
}

// Usage
const gameEvents = new SimpleEventEmitter();
gameEvents.on("collect", (item) => {
  console.log("Collected:", item);
});
```

**4. Simple Asset Manager**

```typescript
class SimpleAssetManager {
  private cache: Map<string, any> = new Map();
  private loader: THREE.GLTFLoader;

  constructor() {
    this.loader = new THREE.GLTFLoader();
  }

  async loadModel(url: string): Promise<THREE.Group> {
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    return new Promise((resolve, reject) => {
      this.loader.load(
        url,
        (gltf) => {
          this.cache.set(url, gltf.scene);
          resolve(gltf.scene);
        },
        undefined,
        reject
      );
    });
  }
}
```

### Medium Complexity Games (Action/Adventure, Strategy)

#### Folder Structure

```
src/
├── main.ts                  # Entry point
├── core/                    # Core engine systems
│   ├── Engine.ts           # Main game engine
│   ├── Scene.ts            # Scene management
│   ├── Renderer.ts         # Renderer wrapper
│   └── GameLoop.ts         # Game loop
├── ecs/                     # Entity-Component-System
│   ├── Entity.ts           # Base entity
│   ├── Component.ts        # Base component
│   ├── System.ts           # Base system
│   └── World.ts            # ECS world
├── entities/                # Game entities
│   ├── Player.ts           # Player entity
│   ├── Enemy.ts            # Enemy entity
│   ├── Item.ts             # Item entity
│   └── World.ts            # World entity
├── components/              # ECS components
│   ├── Transform.ts        # Position, rotation, scale
│   ├── Mesh.ts             # 3D mesh component
│   ├── Collider.ts         # Collision component
│   ├── Health.ts           # Health component
│   ├── Input.ts            # Input component
│   └── AI.ts               # AI component
├── systems/                 # ECS systems
│   ├── PhysicsSystem.ts    # Physics simulation
│   ├── InputSystem.ts      # Input handling
│   ├── AISystem.ts         # AI processing
│   ├── CombatSystem.ts     # Combat logic
│   └── RenderSystem.ts     # Rendering
├── managers/                # Resource managers
│   ├── AssetManager.ts     # Asset loading
│   ├── StateManager.ts     # Game state
│   ├── EventManager.ts     # Event system
│   └── AudioManager.ts     # Audio management
├── utils/
│   ├── MathUtils.ts
│   ├── ThreeUtils.ts
│   └── Constants.ts
├── types/                   # TypeScript types
│   ├── GameTypes.ts
│   ├── EntityTypes.ts
│   └── EventTypes.ts
├── assets/
│   ├── models/
│   ├── textures/
│   ├── audio/
│   └── shaders/
└── ui/
    ├── HUD.ts
    ├── Menu.ts
    └── UIComponents.ts
```

#### Design Patterns

**1. Full ECS Pattern**

```typescript
// Entity
class Entity {
  private id: string;
  private components: Map<string, Component> = new Map();
  private world: World;

  constructor(world: World) {
    this.id = crypto.randomUUID();
    this.world = world;
  }

  addComponent<T extends Component>(component: T): T {
    component.entity = this;
    this.components.set(component.constructor.name, component);
    this.world.componentAdded(this, component);
    return component;
  }

  getComponent<T extends Component>(type: new () => T): T | null {
    return (this.components.get(type.name) as T) || null;
  }

  removeComponent<T extends Component>(type: new () => T): void {
    const component = this.components.get(type.name);
    if (component) {
      this.world.componentRemoved(this, component);
      this.components.delete(type.name);
    }
  }
}

// Component
abstract class Component {
  public entity?: Entity;

  onAttach(entity: Entity): void {
    this.entity = entity;
  }

  onDetach(): void {
    this.entity = undefined;
  }

  abstract update(deltaTime: number): void;
}

// System
abstract class System {
  protected world: World;

  constructor(world: World) {
    this.world = world;
  }

  abstract update(deltaTime: number): void;

  protected getEntitiesWithComponents<T extends Component[]>(
    ...componentTypes: T
  ): Entity[] {
    return this.world.getEntitiesWithComponents(...componentTypes);
  }
}

// World
class World {
  private entities: Map<string, Entity> = new Map();
  private systems: System[] = [];
  private componentQueries: Map<string, Set<Entity>> = new Map();

  createEntity(): Entity {
    const entity = new Entity(this);
    this.entities.set(entity.id, entity);
    return entity;
  }

  addSystem(system: System): void {
    this.systems.push(system);
  }

  update(deltaTime: number): void {
    this.systems.forEach((system) => system.update(deltaTime));
  }

  componentAdded(entity: Entity, component: Component): void {
    const componentName = component.constructor.name;
    if (!this.componentQueries.has(componentName)) {
      this.componentQueries.set(componentName, new Set());
    }
    this.componentQueries.get(componentName)!.add(entity);
  }

  getEntitiesWithComponents<T extends Component[]>(
    ...componentTypes: T
  ): Entity[] {
    // Implementation for component queries
    return [];
  }
}
```

**2. Advanced State Machine**

```typescript
class StateMachine<T extends string> {
  private currentState: T;
  private states: Map<T, State<T>> = new Map();
  private transitions: Map<string, Transition<T>> = new Map();

  constructor(initialState: T) {
    this.currentState = initialState;
  }

  addState(state: T, stateHandler: State<T>): void {
    this.states.set(state, stateHandler);
  }

  addTransition(
    from: T,
    to: T,
    condition: () => boolean,
    onTransition?: () => void
  ): void {
    const key = `${from}->${to}`;
    this.transitions.set(key, { from, to, condition, onTransition });
  }

  update(deltaTime: number): void {
    // Check transitions
    this.checkTransitions();

    // Update current state
    const currentStateHandler = this.states.get(this.currentState);
    if (currentStateHandler?.update) {
      currentStateHandler.update(deltaTime);
    }
  }

  private checkTransitions(): void {
    this.transitions.forEach((transition, key) => {
      if (transition.from === this.currentState && transition.condition()) {
        this.changeState(transition.to, transition.onTransition);
      }
    });
  }

  private changeState(newState: T, onTransition?: () => void): void {
    const currentStateHandler = this.states.get(this.currentState);
    const newStateHandler = this.states.get(newState);

    currentStateHandler?.exit?.();
    onTransition?.();
    this.currentState = newState;
    newStateHandler?.enter?.();
  }
}

interface State<T> {
  enter?: () => void;
  update?: (deltaTime: number) => void;
  exit?: () => void;
}

interface Transition<T> {
  from: T;
  to: T;
  condition: () => boolean;
  onTransition?: () => void;
}
```

**3. Advanced Event System**

```typescript
class EventManager {
  private listeners: Map<string, EventListener[]> = new Map();
  private eventQueue: Event[] = [];
  private isProcessing = false;

  on<T = any>(event: string, callback: (data: T) => void, priority = 0): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push({ callback, priority });
    this.listeners.get(event)!.sort((a, b) => b.priority - a.priority);
  }

  emit<T = any>(event: string, data?: T): void {
    this.eventQueue.push({ event, data });

    if (!this.isProcessing) {
      this.processEventQueue();
    }
  }

  private processEventQueue(): void {
    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const { event, data } = this.eventQueue.shift()!;
      const callbacks = this.listeners.get(event) || [];

      callbacks.forEach(({ callback }) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event ${event}:`, error);
        }
      });
    }

    this.isProcessing = false;
  }
}

interface EventListener {
  callback: Function;
  priority: number;
}

interface Event {
  event: string;
  data?: any;
}
```

**4. Advanced Asset Manager**

```typescript
class AssetManager {
  private loaders: Map<string, THREE.Loader> = new Map();
  private cache: Map<string, any> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private eventManager: EventManager;

  constructor(eventManager: EventManager) {
    this.eventManager = eventManager;
    this.initializeLoaders();
  }

  private initializeLoaders(): void {
    this.loaders.set("gltf", new THREE.GLTFLoader());
    this.loaders.set("texture", new THREE.TextureLoader());
    this.loaders.set("audio", new THREE.AudioLoader());
    this.loaders.set("fbx", new THREE.FBXLoader());
  }

  async loadAsset<T>(type: string, url: string, options?: any): Promise<T> {
    const cacheKey = `${type}:${url}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    // Load asset
    const promise = this.loadAssetInternal<T>(type, url, options);
    this.loadingPromises.set(cacheKey, promise);

    try {
      const asset = await promise;
      this.cache.set(cacheKey, asset);
      this.loadingPromises.delete(cacheKey);
      this.eventManager.emit("asset:loaded", { type, url, asset });
      return asset;
    } catch (error) {
      this.loadingPromises.delete(cacheKey);
      this.eventManager.emit("asset:error", { type, url, error });
      throw error;
    }
  }

  private async loadAssetInternal<T>(
    type: string,
    url: string,
    options?: any
  ): Promise<T> {
    const loader = this.loaders.get(type);
    if (!loader) {
      throw new Error(`No loader found for type: ${type}`);
    }

    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }

  preloadAssets(assets: Array<{ type: string; url: string }>): Promise<void[]> {
    return Promise.all(
      assets.map((asset) => this.loadAsset(asset.type, asset.url))
    );
  }
}
```

### Complex Games (FPS, AAA-style, Multiplayer)

#### Folder Structure

```
src/
├── main.ts                  # Entry point
├── core/                    # Advanced core systems
│   ├── Engine.ts           # Main engine with advanced features
│   ├── Scene.ts            # Multi-scene management
│   ├── Renderer.ts         # Advanced renderer with post-processing
│   ├── GameLoop.ts         # Advanced game loop with fixed timestep
│   └── Config.ts           # Engine configuration
├── ecs/                     # Advanced ECS
│   ├── Entity.ts           # Advanced entity with lifecycle
│   ├── Component.ts        # Advanced component with serialization
│   ├── System.ts           # Advanced system with priorities
│   ├── World.ts            # Advanced world with spatial partitioning
│   ├── Query.ts            # Advanced component queries
│   └── Archetype.ts        # Archetype-based storage
├── entities/                # Complex game entities
│   ├── Player.ts           # Advanced player with networking
│   ├── Enemy.ts            # AI-driven enemies
│   ├── Weapon.ts           # Weapon system
│   ├── Vehicle.ts          # Vehicle system
│   └── Interactive.ts      # Interactive objects
├── components/              # Advanced components
│   ├── Transform.ts        # Advanced transform with interpolation
│   ├── Mesh.ts             # Advanced mesh with LOD
│   ├── Collider.ts         # Advanced collision with physics
│   ├── Health.ts           # Advanced health with damage types
│   ├── Input.ts            # Advanced input with rebinding
│   ├── AI.ts               # Advanced AI with behavior trees
│   ├── Network.ts          # Network synchronization
│   ├── Audio.ts            # 3D audio with spatialization
│   └── Effects.ts          # Visual effects
├── systems/                 # Advanced systems
│   ├── PhysicsSystem.ts    # Advanced physics with constraints
│   ├── InputSystem.ts      # Advanced input with multiple devices
│   ├── AISystem.ts         # Advanced AI with pathfinding
│   ├── CombatSystem.ts     # Advanced combat with hit detection
│   ├── NetworkSystem.ts    # Network synchronization
│   ├── AudioSystem.ts      # Advanced audio with 3D positioning
│   ├── EffectsSystem.ts    # Particle and visual effects
│   ├── UISystem.ts         # Advanced UI with layers
│   └── DebugSystem.ts      # Debug and profiling
├── managers/                # Advanced managers
│   ├── AssetManager.ts     # Advanced asset management
│   ├── StateManager.ts     # Advanced state with persistence
│   ├── EventManager.ts     # Advanced event system
│   ├── AudioManager.ts     # Advanced audio management
│   ├── NetworkManager.ts   # Network management
│   ├── SaveManager.ts      # Save/load system
│   └── AnalyticsManager.ts # Analytics and telemetry
├── networking/              # Network code
│   ├── NetworkManager.ts   # Network connection management
│   ├── SyncManager.ts      # State synchronization
│   ├── Protocol.ts         # Network protocol
│   └── Prediction.ts       # Client-side prediction
├── ai/                      # AI systems
│   ├── BehaviorTree.ts     # Behavior tree implementation
│   ├── Pathfinding.ts      # A* pathfinding
│   ├── Steering.ts         # Steering behaviors
│   └── DecisionMaking.ts   # AI decision making
├── physics/                 # Physics systems
│   ├── PhysicsWorld.ts     # Physics world management
│   ├── CollisionDetection.ts # Advanced collision detection
│   ├── Constraints.ts      # Physics constraints
│   └── Ragdoll.ts          # Ragdoll physics
├── rendering/               # Rendering systems
│   ├── RenderPipeline.ts   # Custom render pipeline
│   ├── PostProcessing.ts   # Post-processing effects
│   ├── Shaders.ts          # Custom shaders
│   └── LOD.ts              # Level of detail
├── audio/                   # Audio systems
│   ├── AudioEngine.ts      # Audio engine
│   ├── SpatialAudio.ts     # 3D spatial audio
│   └── AudioEffects.ts     # Audio effects
├── ui/                      # Advanced UI
│   ├── UIManager.ts        # UI management
│   ├── HUD.ts              # Advanced HUD
│   ├── Menu.ts             # Advanced menus
│   ├── Inventory.ts        # Inventory system
│   └── Dialog.ts           # Dialog system
├── utils/                   # Advanced utilities
│   ├── MathUtils.ts        # Advanced math
│   ├── ThreeUtils.ts       # Three.js utilities
│   ├── Constants.ts        # Game constants
│   ├── Serialization.ts    # Data serialization
│   └── Profiling.ts        # Performance profiling
├── types/                   # Advanced types
│   ├── GameTypes.ts        # Core game types
│   ├── EntityTypes.ts      # Entity type definitions
│   ├── EventTypes.ts       # Event type definitions
│   ├── NetworkTypes.ts     # Network type definitions
│   └── ConfigTypes.ts      # Configuration types
├── config/                  # Configuration
│   ├── GameConfig.ts       # Game configuration
│   ├── PhysicsConfig.ts    # Physics configuration
│   ├── AudioConfig.ts      # Audio configuration
│   └── NetworkConfig.ts    # Network configuration
├── assets/                  # Game assets
│   ├── models/
│   ├── textures/
│   ├── audio/
│   ├── shaders/
│   └── animations/
└── tests/                   # Test files
    ├── unit/
    ├── integration/
    └── performance/
```

#### Design Patterns

**1. Advanced ECS with Archetypes**

```typescript
// Archetype-based ECS for better performance
class Archetype {
  private components: Map<string, any[]> = new Map();
  private entities: Entity[] = [];

  addEntity(entity: Entity, components: Component[]): void {
    this.entities.push(entity);
    components.forEach((component) => {
      const componentName = component.constructor.name;
      if (!this.components.has(componentName)) {
        this.components.set(componentName, []);
      }
      this.components.get(componentName)!.push(component);
    });
  }

  getComponents<T>(componentType: string): T[] {
    return this.components.get(componentType) || [];
  }

  getEntities(): Entity[] {
    return this.entities;
  }
}

class AdvancedWorld {
  private archetypes: Map<string, Archetype> = new Map();
  private systems: System[] = [];
  private entityArchetypes: Map<string, string> = new Map();

  createEntity(): Entity {
    const entity = new Entity();
    this.entityArchetypes.set(entity.id, "empty");
    return entity;
  }

  addComponent(entity: Entity, component: Component): void {
    const currentArchetype = this.entityArchetypes.get(entity.id);
    const newArchetype = this.getArchetypeSignature(entity, component);

    if (currentArchetype !== newArchetype) {
      this.moveEntityToArchetype(entity, currentArchetype!, newArchetype);
    }
  }

  private getArchetypeSignature(
    entity: Entity,
    newComponent: Component
  ): string {
    // Generate archetype signature based on components
    return "signature";
  }

  private moveEntityToArchetype(
    entity: Entity,
    fromArchetype: string,
    toArchetype: string
  ): void {
    // Move entity between archetypes
  }

  query<T extends Component[]>(...componentTypes: T): Query<T> {
    return new Query(this, componentTypes);
  }
}

class Query<T extends Component[]> {
  private world: AdvancedWorld;
  private componentTypes: T;

  constructor(world: AdvancedWorld, componentTypes: T) {
    this.world = world;
    this.componentTypes = componentTypes;
  }

  forEach(callback: (entity: Entity, ...components: T) => void): void {
    // Iterate over entities with matching components
  }
}
```

**2. Advanced State Machine with Hierarchical States**

```typescript
class HierarchicalStateMachine<T extends string> {
  private currentState: T;
  private states: Map<T, HierarchicalState<T>> = new Map();
  private stateStack: T[] = [];

  constructor(initialState: T) {
    this.currentState = initialState;
    this.stateStack.push(initialState);
  }

  addState(state: T, stateHandler: HierarchicalState<T>): void {
    this.states.set(state, stateHandler);
  }

  pushState(newState: T): void {
    const currentStateHandler = this.states.get(this.currentState);
    currentStateHandler?.pause?.();

    this.stateStack.push(newState);
    this.currentState = newState;

    const newStateHandler = this.states.get(newState);
    newStateHandler?.enter?.();
  }

  popState(): void {
    if (this.stateStack.length > 1) {
      const currentStateHandler = this.states.get(this.currentState);
      currentStateHandler?.exit?.();

      this.stateStack.pop();
      this.currentState = this.stateStack[this.stateStack.length - 1];

      const previousStateHandler = this.states.get(this.currentState);
      previousStateHandler?.resume?.();
    }
  }

  update(deltaTime: number): void {
    const currentStateHandler = this.states.get(this.currentState);
    currentStateHandler?.update?.(deltaTime);
  }
}

interface HierarchicalState<T> {
  enter?: () => void;
  update?: (deltaTime: number) => void;
  exit?: () => void;
  pause?: () => void;
  resume?: () => void;
}
```

**3. Advanced Event System with Priorities and Filters**

```typescript
class AdvancedEventManager {
  private listeners: Map<string, EventListener[]> = new Map();
  private eventQueue: Event[] = [];
  private filters: Map<string, EventFilter[]> = new Map();
  private isProcessing = false;

  on<T = any>(
    event: string,
    callback: (data: T) => void,
    options: EventListenerOptions = {}
  ): EventSubscription {
    const { priority = 0, filter, once = false } = options;

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const listener: EventListener = {
      callback,
      priority,
      filter,
      once,
      id: crypto.randomUUID(),
    };

    this.listeners.get(event)!.push(listener);
    this.listeners.get(event)!.sort((a, b) => b.priority - a.priority);

    return new EventSubscription(this, event, listener.id);
  }

  emit<T = any>(event: string, data?: T): void {
    this.eventQueue.push({ event, data, timestamp: Date.now() });

    if (!this.isProcessing) {
      this.processEventQueue();
    }
  }

  private processEventQueue(): void {
    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const { event, data, timestamp } = this.eventQueue.shift()!;
      const listeners = this.listeners.get(event) || [];

      for (const listener of listeners) {
        if (listener.filter && !listener.filter(data)) {
          continue;
        }

        try {
          listener.callback(data);

          if (listener.once) {
            this.removeListener(event, listener.id);
          }
        } catch (error) {
          console.error(`Error in event ${event}:`, error);
        }
      }
    }

    this.isProcessing = false;
  }

  removeListener(event: string, listenerId: string): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.findIndex((l) => l.id === listenerId);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }
}

interface EventListener {
  callback: Function;
  priority: number;
  filter?: EventFilter;
  once: boolean;
  id: string;
}

interface EventListenerOptions {
  priority?: number;
  filter?: EventFilter;
  once?: boolean;
}

type EventFilter = (data: any) => boolean;

class EventSubscription {
  constructor(
    private eventManager: AdvancedEventManager,
    private event: string,
    private listenerId: string
  ) {}

  unsubscribe(): void {
    this.eventManager.removeListener(this.event, this.listenerId);
  }
}
```

**4. Advanced Asset Manager with Streaming**

```typescript
class AdvancedAssetManager {
  private loaders: Map<string, THREE.Loader> = new Map();
  private cache: Map<string, CachedAsset> = new Map();
  private loadingPromises: Map<string, Promise<any>> = new Map();
  private eventManager: AdvancedEventManager;
  private streamingQueue: AssetRequest[] = [];
  private isStreaming = false;

  constructor(eventManager: AdvancedEventManager) {
    this.eventManager = eventManager;
    this.initializeLoaders();
  }

  async loadAsset<T>(
    type: string,
    url: string,
    options: AssetLoadOptions = {}
  ): Promise<T> {
    const { priority = 0, streaming = false, cache = true } = options;
    const cacheKey = `${type}:${url}`;

    // Check cache
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      if (cached.isLoaded) {
        return cached.data;
      }
    }

    // Check if already loading
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    if (streaming) {
      return this.streamAsset<T>(type, url, priority, cacheKey);
    } else {
      return this.loadAssetImmediate<T>(type, url, cacheKey, cache);
    }
  }

  private async streamAsset<T>(
    type: string,
    url: string,
    priority: number,
    cacheKey: string
  ): Promise<T> {
    const request: AssetRequest = {
      type,
      url,
      priority,
      cacheKey,
      resolve: () => {},
      reject: () => {},
    };

    const promise = new Promise<T>((resolve, reject) => {
      request.resolve = resolve;
      request.reject = reject;
    });

    this.streamingQueue.push(request);
    this.streamingQueue.sort((a, b) => b.priority - a.priority);

    if (!this.isStreaming) {
      this.processStreamingQueue();
    }

    return promise;
  }

  private async processStreamingQueue(): Promise<void> {
    this.isStreaming = true;

    while (this.streamingQueue.length > 0) {
      const request = this.streamingQueue.shift()!;

      try {
        const asset = await this.loadAssetInternal(request.type, request.url);
        request.resolve(asset);
      } catch (error) {
        request.reject(error);
      }

      // Yield to prevent blocking
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    this.isStreaming = false;
  }

  preloadAssets(
    assets: Array<{ type: string; url: string; priority?: number }>
  ): Promise<void[]> {
    return Promise.all(
      assets.map((asset) =>
        this.loadAsset(asset.type, asset.url, { priority: asset.priority })
      )
    );
  }

  getCacheStats(): CacheStats {
    const totalAssets = this.cache.size;
    const loadedAssets = Array.from(this.cache.values()).filter(
      (asset) => asset.isLoaded
    ).length;
    const totalMemory = Array.from(this.cache.values()).reduce(
      (sum, asset) => sum + (asset.memoryUsage || 0),
      0
    );

    return { totalAssets, loadedAssets, totalMemory };
  }
}

interface CachedAsset {
  data: any;
  isLoaded: boolean;
  memoryUsage?: number;
  lastAccessed: number;
}

interface AssetLoadOptions {
  priority?: number;
  streaming?: boolean;
  cache?: boolean;
}

interface AssetRequest {
  type: string;
  url: string;
  priority: number;
  cacheKey: string;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

interface CacheStats {
  totalAssets: number;
  loadedAssets: number;
  totalMemory: number;
}
```

### Pattern Selection Guidelines

#### When to Use Basic Patterns:

- **Team Size**: 1-2 developers
- **Timeline**: < 6 months
- **Complexity**: Simple gameplay mechanics
- **Performance**: Basic optimization needs
- **Platform**: Web, mobile, simple desktop

#### When to Use Medium Patterns:

- **Team Size**: 2-5 developers
- **Timeline**: 6-18 months
- **Complexity**: Moderate gameplay complexity
- **Performance**: Moderate optimization needs
- **Platform**: Desktop, advanced mobile

#### When to Use Complex Patterns:

- **Team Size**: 5+ developers
- **Timeline**: 18+ months
- **Complexity**: Complex gameplay systems
- **Performance**: High optimization requirements
- **Platform**: High-end desktop, VR, multiplayer

### Migration Strategy

#### Basic to Medium:

1. **Gradual ECS Migration**: Start with core entities
2. **State Machine Enhancement**: Add hierarchical states
3. **Event System Upgrade**: Add priorities and filters
4. **Asset Manager Enhancement**: Add caching and streaming

#### Medium to Complex:

1. **Archetype Implementation**: Optimize ECS performance
2. **Advanced State Management**: Add state persistence
3. **Network Integration**: Add multiplayer support
4. **Advanced Rendering**: Add custom render pipeline

### Performance Considerations

#### Basic Games:

- **Memory**: < 100MB
- **CPU**: Single-threaded
- **GPU**: Basic Three.js features
- **Network**: None or simple

#### Medium Games:

- **Memory**: 100MB - 1GB
- **CPU**: Multi-threaded for specific systems
- **GPU**: Advanced Three.js features
- **Network**: Optional multiplayer

#### Complex Games:

- **Memory**: 1GB - 4GB+
- **CPU**: Multi-threaded architecture
- **GPU**: Custom shaders and post-processing
- **Network**: Full multiplayer support

---

## Conclusion

This best practices guide provides a comprehensive foundation for Three.js game development in TypeScript. Key takeaways:

1. **Structure First**: Establish a clear, scalable project structure from the beginning
2. **Performance Matters**: Implement optimization techniques early (object pooling, LOD, instancing)
3. **Type Safety**: Leverage TypeScript's type system for better code quality
4. **Modular Design**: Use ECS pattern and component-based architecture
5. **Asset Management**: Implement proper loading and caching strategies
6. **Testing**: Write tests for critical game systems
7. **Monitoring**: Include performance monitoring and debugging tools
8. **Documentation**: Maintain clear documentation and coding standards
9. **Game-Specific Strategy**: Choose architecture and libraries based on game type and complexity
10. **Performance Budgeting**: Set realistic performance targets based on target platforms

Remember to adapt these practices to your specific project requirements and scale. Start with the basics and gradually implement more advanced features as your project grows. The game type-specific recommendations will help you make informed decisions about architecture, libraries, and development approach from the very beginning.
