# Three.js Factories 🏭

**Modular, reusable, type-safe Three.js material and audio factories with synthetic generation**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()

## ✨ Features

- � **Complete World Management** - Scene, camera, lighting, and skybox factories
- �🎨 **49+ Working Materials** - All using synthetic generation (no external texture dependencies)
- 🔊 **Synthetic Audio Generation** - Web Audio API-based sound creation
- 🏗️ **Domain-Driven Architecture** - Clean separation by feature domains
- 📱 **Interactive 3D Demo** - Live material and audio testing environment
- 🎮 **Multiple 3D Objects** - Sphere, cube, torus, plane, cylinder
- 📹 **Orbital Camera** - Smooth rotating camera with controls
- ⚡ **TypeScript First** - Full type safety throughout
- 🔄 **Real-time Material Switching** - Instant material application
- 🎛️ **Audio Controls** - UI click, power up, background music

## 🚀 Quick Start

```bash
# Clone and install
git clone [your-repo-url]
cd threejs-factories
npm install

# Development
npm run dev

# Production build
npm run build
```

## 🏗️ Architecture

```
src/
├── world/              # World/Scene Factory Domain
│   ├── constants/      # Default configurations (cameras, lights, skyboxes)
│   ├── types/          # TypeScript type definitions
│   ├── core/           # CameraManager, LightManager, SkyboxGenerator
│   ├── utils/          # Helper utilities (future)
│   └── manager/        # WorldManager + scene orchestration
├── materials/          # Material Factory Domain
│   ├── constants/      # Material configuration constants
│   ├── types/          # TypeScript type definitions
│   ├── core/           # Core material utilities
│   ├── utils/          # Helper utilities (future)
│   └── manager/        # MaterialFactory + implementations
├── audios/             # Audio Factory Domain
│   ├── constants/      # Audio configuration constants
│   ├── types/          # TypeScript type definitions
│   ├── core/           # Core audio utilities
│   ├── utils/          # Helper utilities (future)
│   └── manager/        # AudioFactory + implementations
├── main.ts             # Demo application entry
└── ui-demo.ts          # UI state and definitions
```

## 📦 Usage

### World Factory

```typescript
import { WorldManager } from "./world";

// Create complete 3D world
const world = new WorldManager();
const scene = world.getScene();
const camera = world.getCamera();
const renderer = world.createRenderer();

// Add studio lighting + gradient skybox
world.addStudioLighting();
await world.addSkybox({ type: "gradient", colors: ["#87ceeb", "#ffffff"] });
```

### Material Factory

```typescript
import { MaterialFactory } from "./materials";

const materialFactory = new MaterialFactory();

// Create specific materials
const grass = await materialFactory.createMaterial("grass");
const metal = await materialFactory.createMaterial("rustedMetal");
const crystal = await materialFactory.createMaterial("glowingCrystal");
```

### Audio Factory

```typescript
import { AudioFactory } from "./audios";

const audioFactory = new AudioFactory(audioListener);

// Create synthetic sounds
const clickSound = await audioFactory.createSound("uiClick");
const music = await audioFactory.createSound("backgroundMusic");
```

## 🎮 Demo Features

- **Complete World System**: Scene, camera, lighting, and skybox management
- **Material Categories**: Terrain, Metal, Organic, Liquid, Glass, Sci-Fi, Fantasy, etc.
- **Lighting Presets**: Default, studio, outdoor, and night lighting setups
- **Dynamic Skyboxes**: Gradient, sunset, space, stars, and cloud environments
- **3D Scene**: Multiple objects with realistic lighting and shadows
- **Camera Controls**: Orbital rotation with pause/resume functionality
- **Audio System**: Synthetic sound generation for UI interactions
- **Real-time Updates**: Instant material switching across all objects

## 🎨 Available Materials

### Terrain & Natural (5)

- Grass, Dirt, Sand, Clay, Asphalt

### Metals (8)

- Rusted Metal, Chrome, Steel, Copper, Brass, Gold, Silver, Iron

### Organic (3)

- Wood, Fabric, Leather

### Liquids (4)

- Water, Lava, Oil, Mercury

### And 29 more across Glass, Sci-Fi, Fantasy, Stylized, and Special categories!

## 🔊 Audio Types

- **UI Click** - Short button click sound
- **Power Up** - Material change chime
- **Background Music** - Ambient looping music
- **Explosion** - Noise burst effect

## 🛠️ Development

The codebase uses a domain-driven architecture where each feature (materials, audios) is self-contained with its own:

- **Types** - TypeScript definitions
- **Constants** - Configuration values
- **Core** - Utility functions
- **Manager** - Factory implementation
- **Utils** - Helper functions (extensible)

## 🚀 Future Extensions

The architecture is designed to easily add new factory domains:

```
src/
├── world/         # ✅ Complete - Scene, camera, lighting, skybox management
├── materials/     # ✅ Complete - 49+ synthetic materials
├── audios/        # ✅ Complete - Synthetic sound generation
├── physics/       # 🔄 Ready to add - Collision, forces, constraints
├── inputs/        # 🔄 Ready to add - Keyboard, mouse, gamepad
├── assets/        # 🔄 Ready to add - Model loading, texture management
└── networking/    # 🔄 Ready to add - Multiplayer, data sync
```

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Follow the established domain architecture
4. Add tests for new features
5. Submit a pull request

---

**Built with Three.js, TypeScript, and modern web technologies** 🚀
