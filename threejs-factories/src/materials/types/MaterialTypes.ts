import * as THREE from "three";

/**
 * Available material types for the factory
 * All materials use procedural/synthetic generation - no external texture files required!
 */
export const MaterialType = {
  // === BASIC TERRAIN ===
  Asphalt: "asphalt",
  Grass: "grass",
  Cobblestone: "cobblestone",
  Marble: "marble",
  Sand: "sand",
  Clay: "clay",
  Dirt: "dirt",

  // === METALS ===
  RustedMetal: "rustedMetal",
  Chrome: "chrome",
  Steel: "steel",
  Copper: "copper",
  Brass: "brass",
  Gold: "gold",
  Silver: "silver",
  Iron: "iron",

  // === LIQUIDS ===
  Water: "water",
  Lava: "lava",
  Oil: "oil",
  Mercury: "mercury",

  // === FROZEN ===
  Ice: "ice",
  Snow: "snow",

  // === ORGANIC ===
  Fabric: "fabric",
  Wood: "wood",
  Leather: "leather",

  // === BUILDING ===
  Concrete: "concrete",
  Brick: "brick",
  Ceramic: "ceramic",

  // === GLASS & GEMS ===
  Glass: "glass",
  Crystal: "crystal",
  Diamond: "diamond",
  Ruby: "ruby",
  Emerald: "emerald",
  Sapphire: "sapphire",

  // === SCI-FI ===
  SciFiPanel: "scifiPanel",
  HolographicMaterial: "holographic",
  EnergyField: "energyField",
  NeonGlass: "neonGlass",
  PlasmaField: "plasmaField",

  // === FANTASY ===
  GlowingCrystal: "glowingCrystal",
  MagicRune: "magicRune",
  DragonScale: "dragonScale",

  // === CARTOON ===
  CartoonCelShaded: "cartoonCelShaded",
  ToonMetal: "toonMetal",
  FlatColor: "flatColor",

  // === SPECIAL FX ===
  Mirror: "mirror",
  BlackHole: "blackHole",
  Iridescent: "iridescent",
  Electricity: "electricity",
  Radioactive: "radioactive",
} as const;
export type MaterialType = (typeof MaterialType)[keyof typeof MaterialType];

/**
 * Base configuration interface for all materials
 */
export interface BaseMaterialConfig {
  color?: THREE.ColorRepresentation;
  transparent?: boolean;
  opacity?: number;
  side?: THREE.Side;
  textureBasePath?: string;
}

/**
 * Configuration for standard PBR materials
 */
export interface PBRMaterialConfig extends BaseMaterialConfig {
  roughness?: number;
  metalness?: number;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  normalScale?: number;
  displacementScale?: number;
  aoIntensity?: number;
  envMapIntensity?: number;
  textureRepeat?: { x: number; y: number };
  customTextures?: {
    map?: string;
    normalMap?: string;
    roughnessMap?: string;
    metalnessMap?: string;
    aoMap?: string;
    displacementMap?: string;
    emissiveMap?: string;
  };
}

/**
 * Configuration for water materials
 */
export interface WaterMaterialConfig extends BaseMaterialConfig {
  refractionRatio?: number;
  reflectivity?: number;
  envMap?: THREE.CubeTexture;
}

/**
 * Configuration for glowing/emissive materials
 */
export interface GlowMaterialConfig extends BaseMaterialConfig {
  emissiveIntensity?: number;
  glowColor?: THREE.ColorRepresentation;
}

/**
 * Material creator function type
 */
export type MaterialCreator<T extends BaseMaterialConfig = BaseMaterialConfig> =
  (config?: T) => Promise<THREE.Material> | THREE.Material;

/**
 * Material configuration union type
 */
export type MaterialConfig =
  | BaseMaterialConfig
  | PBRMaterialConfig
  | WaterMaterialConfig
  | GlowMaterialConfig;
