# 🎆 Particle Effects System (Restructured)

A comprehensive factory-based particle effects system for Three.js applications, featuring high-performance particle systems across multiple categories with GSAP animations and custom shaders.

## 📋 Overview

This particle system provides a simple, extensible factory pattern for creating stunning visual effects with consistent APIs and professional quality. All effects are optimized for performance and designed to work seamlessly with Three.js rendering pipeline.

### 🏗️ Architecture

```
particles_restructured/
├── ParticleFactory.ts         # Main factory class
├── types/                     # TypeScript interfaces
│   └── ParticleTypes.ts      # IParticleEffect interface & config
├── effects/                  # Particle effect implementations
│   ├── combat/              # FireExplosion, Sparks, Impact
│   ├── environmental/       # Rain, Snow, Fire, Smoke
│   ├── magic/               # MagicSparkles, Energy, Portals
│   └── ui/                  # ClickBurst, Hover, Transitions
├── repository/              # Particle registry
│   └── particles-registry.ts # Complete effect catalog
└── docs/                   # Documentation (this file)
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { ParticleFactory } from "./particles_restructured/ParticleFactory";
import { FireExplosion, MagicSparkles, Rain } from "./particles_restructured";

const factory = new ParticleFactory(scene);

// Create explosion effect
const explosion = await factory.create(
  new FireExplosion(),
  new THREE.Vector3(0, 5, 0),
  { particleCount: 200, lifetime: [1.0, 2.0] }
);

// Create continuous rain
const rain = await factory.create(new Rain(), new THREE.Vector3(0, 10, 0), {
  particleCount: 500,
});

// Start effects
explosion.play();
rain.play();

// Update in animation loop
function animate() {
  const deltaTime = clock.getDelta();
  factory.update(deltaTime);
  requestAnimationFrame(animate);
}
```

### Registry-Based Creation

```typescript
import {
  COMPLETE_PARTICLES_REGISTRY,
  createParticleFromRegistry,
} from "./particles_restructured";

// Get effect info from registry
const effectInfo = COMPLETE_PARTICLES_REGISTRY["fireExplosion"];
console.log(effectInfo.name); // "💥 Fire Explosion"
console.log(effectInfo.description); // "Violent fiery explosion with realistic physics..."

// Create from registry
const explosion = await createParticleFromRegistry(
  factory,
  "fireExplosion",
  position,
  { particleCount: 150 }
);
```

## 📚 Available Particle Effects (5 Categories)

### 💥 Combat Effects (2 effects)

- **💥 Fire Explosion** - Violent fiery explosion with realistic physics and color transitions
- **✨ Sparks** - Metal sparks with ground collision and realistic trajectories

### 🌍 Environmental Effects (1 effect)

- **🌧️ Rain** - Continuous rainfall with vertical streaks and wind effects

### ✨ Magic Effects (1 effect)

- **🌟 Magic Sparkles** - Floating magical particles with color shifting and swirling motion

### 🎨 UI Effects (1 effect)

- **👆 Click Burst** - Quick radial burst for UI click feedback with clean design

## 🔧 Advanced Usage

### Custom Configuration

```typescript
import { ParticleConfig } from "./particles_restructured/types/ParticleTypes";

// Detailed configuration
const config: ParticleConfig = {
  particleCount: 300,
  emissionRate: 100,
  emissionDuration: 2.0,
  color: [0xff4400, 0xff8800, 0xffffff],
  size: [0.05, 0.2],
  velocity: [new THREE.Vector3(-5, 0, -5), new THREE.Vector3(5, 10, 5)],
  lifetime: [1.0, 3.0],
  blending: THREE.AdditiveBlending,
  spawnArea: { type: "sphere", size: 1.0 },
};

const effect = await factory.create(new FireExplosion(), position, config);
```

### GSAP Integration

```typescript
// Many effects use GSAP for smooth animations
const sparkles = await factory.create(new MagicSparkles(), position, {
  particleCount: 100,
});

// GSAP timeline is automatically managed
sparkles.play(); // Starts GSAP animations
sparkles.pause(); // Pauses both particles and GSAP
sparkles.stop(); // Stops and cleans up GSAP timelines
```

### Performance Optimization

```typescript
// Use one-shot effects for better performance
const clickEffect = await factory.createOneShot(
  new ClickBurst(),
  clickPosition,
  { particleCount: 20 }
);

// Batch creation for multiple effects
const effects = await factory.createBatch([
  { effect: new FireExplosion(), position: pos1 },
  { effect: new Sparks(), position: pos2 },
  { effect: new MagicSparkles(), position: pos3 },
]);
```

## 📖 Examples

### Combat Scene

```typescript
// Explosion with sparks combo
const explosionPos = new THREE.Vector3(0, 0, 0);

// Main explosion
const explosion = await factory.create(new FireExplosion(), explosionPos, {
  particleCount: 200,
  scaleOverTime: 2.0,
});

// Metal sparks on delay
setTimeout(async () => {
  const sparks = await factory.create(
    new Sparks(),
    explosionPos.clone().add(new THREE.Vector3(0, 0.5, 0)),
    { particleCount: 80, bounceStrength: 0.4 }
  );
  sparks.play();
}, 200);

explosion.play();
```

### Weather System

```typescript
// Continuous rain effect
const rain = await factory.create(new Rain(), new THREE.Vector3(0, 15, 0), {
  particleCount: 400,
  emissionDuration: -1, // Continuous
  spawnArea: { type: "box", size: new THREE.Vector3(30, 1, 30) },
  velocity: [new THREE.Vector3(-2, -20, -2), new THREE.Vector3(2, -30, 2)],
});

rain.play();
```

### Magic Effects

```typescript
// Floating magical aura
const sparkles = await factory.create(
  new MagicSparkles(),
  new THREE.Vector3(0, 2, 0),
  {
    particleCount: 150,
    emissionDuration: -1,
    color: [0xff00ff, 0x00ffff, 0xffff00],
    spawnArea: { type: "sphere", size: 1.5 },
  }
);

sparkles.play(); // Includes automatic GSAP floating animation
```

### UI Feedback

```typescript
// Button click feedback
button.addEventListener("click", async (event) => {
  const rect = canvas.getBoundingClientRect();
  const clickPos = new THREE.Vector3(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
    0
  );

  const burst = await factory.createOneShot(new ClickBurst(), clickPos, {
    particleCount: 15,
    lifetime: [0.2, 0.4],
  });
});
```

## 🔀 Adding New Particle Effects

### 1. Create Effect Class

```typescript
// src/particles_restructured/effects/environmental/Snow.ts
import * as THREE from "three";
import type {
  IParticleEffect,
  ParticleConfig,
  ParticleSystem,
} from "../../types/ParticleTypes.js";

export class Snow implements IParticleEffect {
  async create(
    position: THREE.Vector3,
    config?: ParticleConfig
  ): Promise<ParticleSystem> {
    // Implementation with default config
    const defaultConfig: Required<ParticleConfig> = {
      particleCount: 200,
      color: [0xffffff, 0xf0f8ff],
      size: [0.03, 0.08],
      velocity: [new THREE.Vector3(-1, -3, -1), new THREE.Vector3(1, -1, 1)],
      // ... other properties
    };

    const finalConfig = { ...defaultConfig, ...config };

    // Create geometry, material, particle system
    // Return ParticleSystem implementation
  }
}
```

### 2. Register Effect

```typescript
// Add to particles-registry.ts
import { Snow } from "../effects/environmental/Snow.js";

export const COMPLETE_PARTICLES_REGISTRY = {
  // ... existing effects ...
  snow: {
    class: Snow,
    name: "❄️ Snow",
    description: "Gentle snowfall with realistic drifting motion",
    category: "environmental",
  },
};
```

### 3. Export from Index

```typescript
// Add to index.ts
export { Snow } from "./effects/environmental/Snow.js";
```

## 🎯 Best Practices

### Performance Optimization

```typescript
// Reuse factory instance
const factory = new ParticleFactory(scene);

// Use appropriate particle counts
const smallEffect = { particleCount: 20 }; // UI effects
const mediumEffect = { particleCount: 100 }; // Magic effects
const largeEffect = { particleCount: 300 }; // Environmental effects

// Clean up completed effects
effect.onComplete = () => {
  factory.remove(effect.id);
};
```

### Memory Management

```typescript
// Proper cleanup
factory.clear(); // Remove all active effects
factory.dispose(); // Clean up factory resources

// Individual effect cleanup
effect.dispose(); // Clean up geometry, materials, GSAP timelines
```

### Animation Loop Integration

```typescript
const clock = new THREE.Clock();

function animate() {
  const deltaTime = clock.getDelta();

  // Update all particle systems
  factory.update(deltaTime);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
```

## 🔍 Troubleshooting

### Common Issues

1. **Effects not visible**: Check camera position, particle scale, and blending mode
2. **Performance problems**: Reduce particle counts, use shorter lifetimes
3. **GSAP conflicts**: Ensure GSAP is properly imported and timelines are cleaned up
4. **Shader compilation errors**: Check WebGL support and shader uniforms

### Debug Tips

```typescript
// Monitor active effects
console.log("Active effects:", factory.getActiveCount());
console.log("Effect IDs:", factory.getActiveIds());

// Check particle system state
console.log("Effect active:", effect.isActive);
console.log("Particle count:", effect.particleCount);

// Enable wireframe for debugging
effect.material.wireframe = true;
```

## 📊 Technical Specifications

- **Total Effects**: 5 unique particle systems across 4 categories
- **Categories**: Combat, Environmental, Magic, UI
- **Performance**: Optimized for 60fps with <1000 particles active
- **Dependencies**: Three.js (r150+), GSAP, Lodash
- **Browser Support**: Modern browsers with WebGL 2.0
- **Memory Usage**: ~50KB per active system (typical)

## 🎮 Integration with Game Systems

### With Physics

```typescript
// Explosion with physics impulse
const explosion = await factory.create(new FireExplosion(), position);
explosion.onStart = () => {
  // Apply physics impulse to nearby objects
  physicsWorld.applyRadialImpulse(position, 10, 500);
};
```

### With Audio

```typescript
// Synchronized audio and particles
const explosion = await factory.create(new FireExplosion(), position);
explosion.onStart = () => {
  audioManager.play("explosion", position);
};
```

### With Lighting

```typescript
// Dynamic lighting with magic effects
const sparkles = await factory.create(new MagicSparkles(), position);
const light = new THREE.PointLight(0x00ffff, 2, 10);
sparkles.mesh.add(light);
```

## 🤝 Contributing

To add new particle effects:

1. Follow the `IParticleEffect` interface
2. Include comprehensive configuration options
3. Add GSAP animations where appropriate
4. Register in the main registry
5. Include appropriate emoji and description
6. Test with various particle counts
7. Ensure proper cleanup and disposal

## 📄 License

Part of the Three.js Factories mini-game system. Follow project licensing terms.

---

_Last Updated: August 2025_  
_Particle Effects System Version: 1.0.0_  
_Total Effects: 5 across 4 categories_  
_Enhanced with GSAP animations and custom shaders_
