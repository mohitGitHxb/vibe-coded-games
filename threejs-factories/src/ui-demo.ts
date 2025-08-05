import * as THREE from "three";
import type { MaterialType } from "./materials/types/MaterialTypes.js";
import type { SoundType } from "./audios/types/AudioTypes.js";

// Enhanced UI state with complete factory management
interface DemoState {
  currentMaterial: MaterialType;
  activeSounds: Map<string, THREE.Audio | THREE.PositionalAudio>;
  sceneObjects: Map<string, THREE.Mesh>;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  uiVisible: boolean;
}

// Main application state
const appState: DemoState = {
  // Using the exact value from MaterialType enum
  currentMaterial: "grass" as MaterialType,
  activeSounds: new Map<string, THREE.Audio | THREE.PositionalAudio>(),
  sceneObjects: new Map<string, THREE.Mesh>(),
  masterVolume: 0.7,
  musicVolume: 0.4,
  sfxVolume: 0.8,
  uiVisible: true,
};

// Material definitions for UI - only materials that exist in the reduced MaterialType enum
const materialDefinitions = [
  // === TERRAIN & NATURAL ===
  {
    type: "grass" as MaterialType,
    name: "🌱 Grass",
    description: "Natural grass surface",
    category: "Terrain",
  },
  {
    type: "dirt" as MaterialType,
    name: "🟤 Dirt",
    description: "Rich soil surface",
    category: "Terrain",
  },
  {
    type: "sand" as MaterialType,
    name: "🏖️ Sand",
    description: "Fine sandy texture",
    category: "Terrain",
  },
  {
    type: "clay" as MaterialType,
    name: "🧱 Clay",
    description: "Moldable clay material",
    category: "Terrain",
  },
  {
    type: "asphalt" as MaterialType,
    name: "🛣️ Asphalt",
    description: "Road surface material",
    category: "Terrain",
  },

  // === STONES & ROCKS ===
  {
    type: "cobblestone" as MaterialType,
    name: "🪨 Cobblestone",
    description: "Stone pathway material",
    category: "Stone",
  },
  {
    type: "marble" as MaterialType,
    name: "⚪ Marble",
    description: "Polished stone surface",
    category: "Stone",
  },

  // === METALS ===
  {
    type: "rustedMetal" as MaterialType,
    name: "🦀 Rusted Metal",
    description: "Weathered metal surface",
    category: "Metal",
  },
  {
    type: "chrome" as MaterialType,
    name: "✨ Chrome",
    description: "Polished reflective metal",
    category: "Metal",
  },
  {
    type: "steel" as MaterialType,
    name: "🔩 Steel",
    description: "Industrial metal alloy",
    category: "Metal",
  },
  {
    type: "copper" as MaterialType,
    name: "🟠 Copper",
    description: "Reddish conductive metal",
    category: "Metal",
  },
  {
    type: "brass" as MaterialType,
    name: "🟡 Brass",
    description: "Golden metal alloy",
    category: "Metal",
  },
  {
    type: "gold" as MaterialType,
    name: "🥇 Gold",
    description: "Precious yellow metal",
    category: "Metal",
  },
  {
    type: "silver" as MaterialType,
    name: "🥈 Silver",
    description: "Shiny white metal",
    category: "Metal",
  },
  {
    type: "iron" as MaterialType,
    name: "⚫ Iron",
    description: "Raw iron material",
    category: "Metal",
  },

  // === ORGANIC ===
  {
    type: "wood" as MaterialType,
    name: "🪵 Wood",
    description: "Natural timber",
    category: "Organic",
  },
  {
    type: "fabric" as MaterialType,
    name: "🧵 Fabric",
    description: "Textile material",
    category: "Organic",
  },
  {
    type: "leather" as MaterialType,
    name: "🟤 Leather",
    description: "Animal hide material",
    category: "Organic",
  },

  // === LIQUIDS ===
  {
    type: "water" as MaterialType,
    name: "💧 Water",
    description: "Transparent liquid",
    category: "Liquid",
  },
  {
    type: "lava" as MaterialType,
    name: "🌋 Lava",
    description: "Molten rock material",
    category: "Liquid",
  },
  {
    type: "oil" as MaterialType,
    name: "⚫ Oil",
    description: "Dark viscous liquid",
    category: "Liquid",
  },
  {
    type: "mercury" as MaterialType,
    name: "💿 Mercury",
    description: "Liquid metal",
    category: "Liquid",
  },

  // === ICE & FROZEN ===
  {
    type: "ice" as MaterialType,
    name: "🧊 Ice",
    description: "Frozen water surface",
    category: "Frozen",
  },
  {
    type: "snow" as MaterialType,
    name: "❄️ Snow",
    description: "Crystalline frozen water",
    category: "Frozen",
  },

  // === BUILDING MATERIALS ===
  {
    type: "concrete" as MaterialType,
    name: "🏗️ Concrete",
    description: "Construction material",
    category: "Building",
  },
  {
    type: "brick" as MaterialType,
    name: "🧱 Brick",
    description: "Clay building block",
    category: "Building",
  },
  {
    type: "ceramic" as MaterialType,
    name: "🏺 Ceramic",
    description: "Fired clay material",
    category: "Building",
  },

  // === GLASS & GEMS ===
  {
    type: "glass" as MaterialType,
    name: "🪟 Glass",
    description: "Transparent solid",
    category: "Glass",
  },
  {
    type: "crystal" as MaterialType,
    name: "💎 Crystal",
    description: "Clear crystalline solid",
    category: "Glass",
  },
  {
    type: "diamond" as MaterialType,
    name: "💎 Diamond",
    description: "Precious crystal",
    category: "Glass",
  },
  {
    type: "ruby" as MaterialType,
    name: "🔴 Ruby",
    description: "Red precious gemstone",
    category: "Glass",
  },
  {
    type: "emerald" as MaterialType,
    name: "🟢 Emerald",
    description: "Green precious gemstone",
    category: "Glass",
  },
  {
    type: "sapphire" as MaterialType,
    name: "🔵 Sapphire",
    description: "Blue precious gemstone",
    category: "Glass",
  },

  // === SCI-FI & FUTURISTIC ===
  {
    type: "scifiPanel" as MaterialType,
    name: "🛸 Sci-Fi Panel",
    description: "Futuristic metal panel",
    category: "Sci-Fi",
  },
  {
    type: "holographic" as MaterialType,
    name: "🌈 Holographic",
    description: "Shifting color material",
    category: "Sci-Fi",
  },
  {
    type: "energyField" as MaterialType,
    name: "⚡ Energy Field",
    description: "Glowing energy barrier",
    category: "Sci-Fi",
  },
  {
    type: "neonGlass" as MaterialType,
    name: "🌈 Neon Glass",
    description: "Glowing glass material",
    category: "Sci-Fi",
  },
  {
    type: "plasmaField" as MaterialType,
    name: "⚡ Plasma Field",
    description: "Ionized gas field",
    category: "Sci-Fi",
  },

  // === FANTASY & MAGICAL ===
  {
    type: "glowingCrystal" as MaterialType,
    name: "✨ Glowing Crystal",
    description: "Emissive crystal material",
    category: "Fantasy",
  },
  {
    type: "magicRune" as MaterialType,
    name: "🔮 Magic Rune",
    description: "Enchanted symbol",
    category: "Fantasy",
  },
  {
    type: "dragonScale" as MaterialType,
    name: "🐉 Dragon Scale",
    description: "Mythical creature armor",
    category: "Fantasy",
  },

  // === CARTOON & STYLIZED ===
  {
    type: "cartoonCelShaded" as MaterialType,
    name: "🎨 Cartoon",
    description: "Cel-shaded toon material",
    category: "Stylized",
  },
  {
    type: "toonMetal" as MaterialType,
    name: "🎨 Toon Metal",
    description: "Stylized metal surface",
    category: "Stylized",
  },
  {
    type: "flatColor" as MaterialType,
    name: "🎨 Flat Color",
    description: "Solid color material",
    category: "Stylized",
  },

  // === SPECIAL EFFECTS ===
  {
    type: "iridescent" as MaterialType,
    name: "🌈 Iridescent",
    description: "Color-shifting surface",
    category: "Special",
  },
  {
    type: "mirror" as MaterialType,
    name: "🪞 Mirror",
    description: "Perfect reflective surface",
    category: "Special",
  },
  {
    type: "blackHole" as MaterialType,
    name: "⚫ Black Hole",
    description: "Light-absorbing void",
    category: "Special",
  },
  {
    type: "electricity" as MaterialType,
    name: "⚡ Electricity",
    description: "Electric energy field",
    category: "Special",
  },
  {
    type: "radioactive" as MaterialType,
    name: "☢️ Radioactive",
    description: "Glowing nuclear material",
    category: "Special",
  },
];

// Audio definitions for UI (keeping original structure)
const audioDefinitions = [
  {
    type: "backgroundMusic" as SoundType,
    name: "Music",
    description: "Ambient background music",
  },
  {
    type: "buttonClick" as SoundType,
    name: "UI Click",
    description: "Button click sound",
  },
  {
    type: "materialChange" as SoundType,
    name: "Material Change",
    description: "Material switch sound",
  },
];

// World/Scene demo definitions for WorldManager showcase
const worldLightingPresets = [
  {
    type: "default",
    name: "🏠 Default",
    description: "Basic 3-light setup",
    category: "Lighting",
  },
  {
    type: "studio",
    name: "🎬 Studio",
    description: "Professional 4-light setup",
    category: "Lighting",
  },
  {
    type: "outdoor",
    name: "🌞 Outdoor",
    description: "Sun + sky hemisphere",
    category: "Lighting",
  },
  {
    type: "night",
    name: "🌙 Night",
    description: "Moon + dark ambient",
    category: "Lighting",
  },
];

const worldSkyboxPresets = [
  {
    type: "gradient",
    name: "🌈 Gradient",
    description: "Smooth color gradient",
    category: "Skybox",
    colors: ["#87ceeb", "#ffffff", "#87ceeb"],
  },
  {
    type: "sunset",
    name: "🌅 Sunset",
    description: "Orange to blue sunset",
    category: "Skybox",
    colors: ["#ff6b35", "#f7931e", "#ffdc00", "#87ceeb"],
  },
  {
    type: "night",
    name: "🌌 Night",
    description: "Dark sky with stars",
    category: "Skybox",
    colors: ["#0f0f23", "#1a1a3a", "#2d2d5a"],
  },
  {
    type: "space",
    name: "🚀 Space",
    description: "Deep space with nebula",
    category: "Skybox",
    colors: ["#000011", "#000033", "#000055"],
  },
  {
    type: "stars",
    name: "⭐ Stars",
    description: "Starfield background",
    category: "Skybox",
  },
  {
    type: "clouds",
    name: "☁️ Clouds",
    description: "Cloudy sky atmosphere",
    category: "Skybox",
  },
];

const worldCameraPresets = [
  {
    type: "3d-orbital",
    name: "🎥 3D Orbital",
    description: "Rotating around scene",
    category: "Camera",
    perspective: "3D",
  },
  {
    type: "3d-firstperson",
    name: "👁️ First Person",
    description: "Player eye level view",
    category: "Camera",
    perspective: "3D",
  },
  {
    type: "2d-topdown",
    name: "🗺️ Top Down",
    description: "RTS/Strategy view",
    category: "Camera",
    perspective: "2D",
  },
  {
    type: "2d-sidescroll",
    name: "↔️ Side Scroll",
    description: "Platformer side view",
    category: "Camera",
    perspective: "2D",
  },
  {
    type: "isometric",
    name: "📐 Isometric",
    description: "Angled perspective",
    category: "Camera",
    perspective: "2.5D",
  },
];

// Export for use in the main application
export {
  materialDefinitions,
  audioDefinitions,
  worldLightingPresets,
  worldSkyboxPresets,
  worldCameraPresets,
  appState,
};
