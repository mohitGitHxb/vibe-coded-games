# 🎨 Materials System (Restructured)

A comprehensive factory-based material generation system for Three.js applications, featuring 56 high-quality materials across 9 categories with procedural textures and realistic properties.

## 📋 Overview

This materials system provides a simple, extensible factory pattern for creating Three.js materials with consistent APIs and professional quality. All materials are designed to work seamlessly with Three.js lighting and rendering systems.

### 🏗️ Architecture

```
materials_restructured/
├── MaterialFactory.ts         # Main factory class
├── types/                     # TypeScript interfaces
│   └── MaterialTypes.ts      # IMaterial interface & config
├── materials/                # 56+ material implementations
│   ├── [gems]/              # Emerald, Ruby, Diamond, etc.
│   ├── [building]/          # Brick, Wood, Concrete, etc.
│   ├── [metals]/            # Steel, Gold, Chrome, etc.
│   ├── [terrain]/           # Grass, Sand, Rock, etc.
│   ├── [fabrics]/           # Silk, Velvet, Denim, etc.
│   ├── [liquids]/           # Water, Oil, Slime, etc.
│   ├── [special]/           # Holographic, Radioactive, etc.
│   ├── [stylized]/          # ToonMetal, FlatColor, etc.
│   └── [space]/             # BlackHole, Nebula, etc.
├── repository/              # Material registry
│   └── materials-registry.ts # Complete material catalog
├── examples/                # Usage examples
└── docs/                   # Documentation (this file)
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { MaterialFactory } from "./materials_restructured/MaterialFactory";
import { Emerald, Gold, Wood } from "./materials_restructured";

const factory = new MaterialFactory();

// Create materials using factory
const emeraldMaterial = factory.create(new Emerald());
const goldMaterial = factory.create(new Gold());
const woodMaterial = factory.create(new Wood());

// Apply to geometry
const geometry = new THREE.BoxGeometry(1, 1, 1);
const mesh = new THREE.Mesh(geometry, emeraldMaterial);
scene.add(mesh);
```

### Registry-Based Creation

```typescript
import { COMPLETE_MATERIALS_REGISTRY } from "./materials_restructured/repository/materials-registry";

// Get material info from registry
const materialInfo = COMPLETE_MATERIALS_REGISTRY["emerald"];
const material = factory.create(new materialInfo.class());

console.log(materialInfo.name); // "💚 Emerald"
console.log(materialInfo.description); // "Precious green gemstone with crystalline shine"
```

## 📚 Available Materials (56 Total)

### 💎 Gems & Crystals (6 materials)

- **💚 Emerald** - Precious green gemstone with crystalline shine
- **❤️ Ruby** - Deep red precious gemstone with inner fire
- **💎 Diamond** - Brilliant clear crystal with perfect reflections
- **💙 Sapphire** - Deep blue precious gemstone
- **🔮 Crystal** - Clear crystalline structure with transparency
- **✨ Glowing Crystal** - Magical luminescent crystal

### 🏗️ Building Materials (5 materials)

- **🧱 Brick** - Red clay brick with procedural mortar pattern texture
- **🏢 Concrete** - Gray industrial concrete with aggregate speckles
- **🪵 Wood** - Rich brown wood grain with natural fiber patterns
- **🏛️ Marble** - White marble with elegant gray veining
- **🏺 Ceramic** - Smooth glazed ceramic surface

### 🔩 Metals (9 materials)

- **⚡ Steel** - Brushed industrial steel with metallic luster
- **🥇 Gold** - Pure golden metal with warm reflections
- **🟫 Copper** - Warm reddish-brown metallic surface
- **🔘 Chrome** - Mirror-like chrome with perfect reflections
- **🥈 Silver** - Bright silvery metallic finish
- **🟨 Brass** - Golden brass alloy with vintage appeal
- **⚫ Iron** - Dark metallic iron with rough surface
- **🦀 Rusted Metal** - Weathered metal with rust patina
- **🪞 Mirror** - Perfect reflective surface

### 🌍 Terrain & Nature (10 materials)

- **🌱 Grass** - Lush green grass texture with natural variation
- **🏖️ Sand** - Fine beach sand with granular texture
- **🪨 Rock** - Rough stone surface with mineral patterns
- **🧿 Snow** - Pure white snow with crystalline sparkle
- **🌰 Dirt** - Rich brown earth with organic particles
- **🪨 Stone** - Natural stone with weathered surface
- **🌋 Lava** - Molten rock with glowing cracks and ember effects
- **🧊 Ice** - Translucent frozen water with internal reflections
- **☁️ Cloud** - Soft, fluffy cloud material with transparency
- **🌫️ Fog** - Misty atmospheric fog effect

### 🧵 Fabrics & Textures (8 materials)

- **🎀 Silk** - Luxurious silk with subtle sheen
- **🟤 Leather** - Rich brown leather with natural grain
- **👖 Denim** - Blue denim fabric with woven texture
- **🧶 Fabric** - Generic woven textile material
- **🟦 Plastic** - Smooth plastic surface with slight gloss
- **🟫 Rubber** - Flexible rubber material with matte finish
- **🍫 Velvet** - Soft velvet with deep, rich texture
- **📜 Paper** - Fibrous paper surface with subtle texture

### 🌊 Liquids & Fluids (4 materials)

- **💧 Water** - Transparent water with realistic flow simulation
- **🛢️ Oil** - Viscous dark liquid with rainbow reflections
- **🟢 Slime** - Gelatinous material with organic properties
- **🩸 Blood** - Deep red organic fluid (for horror/medical applications)

### ⚡ Special Effects (8 materials)

- **🌈 Holographic** - Iridescent surface with color shifting
- **☢️ Radioactive** - Glowing green hazardous material
- **🦋 Iridescent** - Color-shifting pearlescent surface
- **🔥 Neon** - Bright neon glow with electric effects
- **⚡ Electric** - Crackling electric energy visualization
- **🌟 Magical** - Mystical material with particle effects
- **👻 Phantom** - Semi-transparent ghostly material
- **💨 Smoke** - Volumetric smoke with realistic dispersion

### 🎮 Stylized & Toon (3 materials)

- **🤖 Toon Metal** - Cartoon-style metallic surface
- **🎨 Flat Color** - Solid color without lighting effects
- **📱 UI Material** - Clean material designed for interface elements

### 🚀 Space & Sci-Fi (3 materials)

- **🕳️ Black Hole** - Gravitational distortion effect with event horizon
- **🌌 Nebula** - Cosmic gas cloud with stellar formation
- **⭐ Plasma** - High-energy ionized gas with electric effects

## 🔧 Advanced Usage

### Custom Material Configuration

```typescript
import { MaterialConfig } from "./materials_restructured/types/MaterialTypes";

// Create material with custom properties
const config: MaterialConfig = {
  color: 0xff0000,
  roughness: 0.3,
  metalness: 0.8,
  emissive: 0x330000,
  emissiveIntensity: 0.1,
};

const customMaterial = factory.create(new Gold(), config);
```

### Procedural Texture Materials

Many materials generate procedural textures:

```typescript
// Materials with procedural generation
const brick = factory.create(new Brick()); // Generates mortar pattern
const wood = factory.create(new Wood()); // Creates wood grain
const marble = factory.create(new Marble()); // Generates veining
const lava = factory.create(new Lava()); // Animated glowing cracks
```

### Animation and Dynamic Effects

```typescript
// Materials with built-in animation
const water = factory.create(new Water()); // Flowing water simulation
const neon = factory.create(new Neon()); // Pulsing glow effects
const electric = factory.create(new Electric()); // Crackling energy
const plasma = factory.create(new Plasma()); // Swirling plasma effects

// Update in animation loop
function animate() {
  // Some materials auto-animate via shaders
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
```

## 📖 Examples

### Complete Scene Setup

```typescript
import * as THREE from "three";
import { MaterialFactory } from "./materials_restructured/MaterialFactory";
import { Emerald, Gold, Wood, Marble } from "./materials_restructured";

const scene = new THREE.Scene();
const factory = new MaterialFactory();

// Create different objects with various materials
const objects = [
  {
    geometry: new THREE.BoxGeometry(1, 1, 1),
    material: factory.create(new Emerald()),
    position: [-2, 0, 0],
  },
  {
    geometry: new THREE.SphereGeometry(0.5, 32, 32),
    material: factory.create(new Gold()),
    position: [0, 0, 0],
  },
  {
    geometry: new THREE.CylinderGeometry(0.5, 0.5, 2, 16),
    material: factory.create(new Wood()),
    position: [2, 1, 0],
  },
  {
    geometry: new THREE.PlaneGeometry(10, 10),
    material: factory.create(new Marble()),
    position: [0, -1, 0],
  },
];

objects.forEach((obj) => {
  const mesh = new THREE.Mesh(obj.geometry, obj.material);
  mesh.position.set(...obj.position);
  if (obj.position[1] === -1) mesh.rotation.x = -Math.PI / 2; // Floor
  scene.add(mesh);
});
```

### Material Categories Demo

```typescript
// Showcase different material categories
const categories = {
  gems: ["emerald", "ruby", "diamond", "sapphire"],
  metals: ["gold", "silver", "chrome", "copper"],
  nature: ["wood", "stone", "grass", "sand"],
  special: ["holographic", "neon", "radioactive", "magical"],
};

Object.entries(categories).forEach(([category, materials]) => {
  materials.forEach((materialKey, index) => {
    const materialInfo = COMPLETE_MATERIALS_REGISTRY[materialKey];
    const material = factory.create(new materialInfo.class());

    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      index * 2,
      0,
      Object.keys(categories).indexOf(category) * 2
    );
    scene.add(mesh);
  });
});
```

## 🔀 Adding New Materials

### 1. Create Material Class

```typescript
// src/materials_restructured/materials/MyCustomMaterial.ts
import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes";

export class MyCustomMaterial implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xff6b35,
      roughness: 0.4,
      metalness: 0.2,
      // Add custom properties...
    });
  }
}
```

### 2. Register in Registry

```typescript
// Add to materials-registry.ts
import { MyCustomMaterial } from "../materials/MyCustomMaterial.js";

export const COMPLETE_MATERIALS_REGISTRY = {
  // ... existing materials ...
  myCustom: {
    class: MyCustomMaterial,
    name: "🎨 My Custom",
    description: "Custom material with unique properties",
  },
};
```

### 3. Export from Index

```typescript
// Add to index.ts
export { MyCustomMaterial } from "./materials/MyCustomMaterial";
```

## 🎯 Best Practices

### Performance Optimization

```typescript
// Reuse materials when possible
const factory = new MaterialFactory();
const goldMaterial = factory.create(new Gold());

// Use same material for multiple objects
const objects = [mesh1, mesh2, mesh3];
objects.forEach((mesh) => (mesh.material = goldMaterial));
```

### Memory Management

```typescript
// Dispose materials when no longer needed
material.dispose();

// Dispose textures if material has them
if (material.map) material.map.dispose();
if (material.normalMap) material.normalMap.dispose();
```

### Lighting Compatibility

```typescript
// Most materials work best with proper lighting
const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(ambientLight, directionalLight);
```

## 🔍 Troubleshooting

### Common Issues

1. **Materials appear black**: Ensure proper lighting setup
2. **Textures not loading**: Check file paths and web server configuration
3. **Performance issues**: Consider material reuse and LOD systems
4. **Transparency problems**: Set `transparent: true` and proper `renderOrder`

### Debug Tips

```typescript
// Enable material debugging
material.wireframe = true; // Show wireframe
console.log(material); // Inspect material properties

// Check texture loading
material.map?.onLoad = () => console.log("Texture loaded");
material.map?.onError = (err) => console.error("Texture error:", err);
```

## 📊 Technical Specifications

- **Total Materials**: 56 unique materials
- **Categories**: 9 distinct categories
- **File Size**: ~2MB total (optimized)
- **Dependencies**: Three.js (r150+)
- **Browser Support**: Modern browsers with WebGL 2.0
- **Performance**: Optimized for 60fps with <100 materials active

## 🤝 Contributing

To add new materials:

1. Follow the `IMaterial` interface
2. Add comprehensive documentation
3. Include usage examples
4. Register in the main registry
5. Add appropriate emoji and description
6. Test with various lighting conditions

## 📄 License

Part of the Three.js Factories mini-game system. Follow project licensing terms.

---

_Last Updated: August 2025_  
_Materials System Version: 2.0.0_  
_Total Materials: 56 across 9 categories_
