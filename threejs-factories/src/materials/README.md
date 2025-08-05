# Materials Factory 🎨

A modular material factory for Three.js with support for both synthetic generation and custom textures.

## 📦 Quick Usage

```typescript
import { MaterialFactory } from "./materials";

const materialFactory = new MaterialFactory();

// Use default synthetic materials
const grass = await materialFactory.createMaterial("grass");
const metal = await materialFactory.createMaterial("rustedMetal");

// Apply to mesh
mesh.material = grass;
```

## 🎯 Custom Textures

You can override default synthetic generation with custom PNG/JPG textures:

```typescript
// Custom texture configuration
const customMaterial = await materialFactory.createMaterial("grass", {
  baseColor: "./textures/grass_diffuse.png",
  normalMap: "./textures/grass_normal.png",
  roughnessMap: "./textures/grass_roughness.png",
});

// Or just override specific maps
const semiCustom = await materialFactory.createMaterial("metal", {
  baseColor: "./textures/custom_metal.png",
  // normalMap and roughnessMap will use synthetic generation
});
```

## 🔧 Adding New Materials

### 1. Define the Material Type

Add your new material to `types/MaterialTypes.ts`:

```typescript
export type MaterialType =
  | "grass"
  | "dirt"
  | "sand"
  // Add your new material here
  | "marble"
  | "concrete";
```

### 2. Add Configuration

Add configuration in `constants/MaterialConfigs.ts`:

```typescript
export const MATERIAL_CONFIGS: Record<MaterialType, MaterialConfig> = {
  // ... existing materials

  marble: {
    baseColor: [0.9, 0.9, 0.95],
    roughness: 0.1,
    metalness: 0.0,
    normalIntensity: 0.3,
    category: "stone",
  },

  concrete: {
    baseColor: [0.6, 0.6, 0.6],
    roughness: 0.9,
    metalness: 0.0,
    normalIntensity: 0.8,
    category: "stone",
  },
};
```

### 3. Implement Generation Logic

Add synthetic generation in `core/SyntheticMaterialGenerator.ts`:

```typescript
// Add to generateSyntheticMaps method
case 'marble':
  return this.generateMarbleTexture(config);
case 'concrete':
  return this.generateConcreteTexture(config);
```

Then implement the generation methods:

```typescript
private generateMarbleTexture(config: MaterialConfig): SyntheticMaps {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = canvas.height = 512;

  // Generate marble-like veining pattern
  // ... your generation logic

  return {
    baseColorMap: new CanvasTexture(canvas),
    normalMap: this.generateMarbleNormalMap(),
    roughnessMap: this.generateMarbleRoughnessMap()
  };
}
```

## 🏗️ Architecture

```
materials/
├── constants/          # Material configurations
│   └── MaterialConfigs.ts
├── types/             # TypeScript definitions
│   └── MaterialTypes.ts
├── core/              # Core generation logic
│   ├── SyntheticMaterialGenerator.ts
│   └── TextureLoader.ts
├── utils/             # Helper utilities
└── manager/           # Factory implementation
    └── MaterialFactory.ts
```

## 💡 Tips

- **Categories**: Group similar materials in `category` field for UI organization
- **Performance**: Synthetic generation happens once and caches results
- **Textures**: PNG/JPG override synthetic generation completely
- **Testing**: Use the main demo to test new materials instantly

## 🎨 Available Categories

- `terrain` - Grass, dirt, sand, clay
- `metal` - Chrome, steel, copper, brass
- `organic` - Wood, fabric, leather
- `liquid` - Water, lava, oil
- `glass` - Clear, frosted, colored
- `scifi` - Holographic, energy, plasma
- `fantasy` - Magical, crystal, rune
- `stylized` - Cartoon, flat, artistic
- `special` - Invisible, wireframe, debug
