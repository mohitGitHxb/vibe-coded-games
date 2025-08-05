/**
 * Material Factory Constants
 */

// Default material properties - all using synthetic generation
export const MATERIAL_DEFAULTS = {
  // === BASIC TERRAIN ===
  ASPHALT: { COLOR: 0x2a2a2a, ROUGHNESS: 0.8, METALNESS: 0.1 },
  GRASS: { COLOR: 0x4a7c59, ROUGHNESS: 0.9, METALNESS: 0.0 },
  COBBLESTONE: { COLOR: 0x888888, ROUGHNESS: 0.8, METALNESS: 0.0 },
  MARBLE: { COLOR: 0xf5f5dc, ROUGHNESS: 0.2, METALNESS: 0.0 },
  SAND: { COLOR: 0xc2b280, ROUGHNESS: 0.9, METALNESS: 0.0 },
  CLAY: { COLOR: 0x8b4513, ROUGHNESS: 0.8, METALNESS: 0.0 },
  DIRT: { COLOR: 0x654321, ROUGHNESS: 0.9, METALNESS: 0.0 },

  // === METALS ===
  RUSTED_METAL: { COLOR: 0x8b4513, ROUGHNESS: 0.9, METALNESS: 0.4 },
  CHROME: { COLOR: 0xc0c0c0, ROUGHNESS: 0.0, METALNESS: 1.0 },
  STEEL: { COLOR: 0x71797e, ROUGHNESS: 0.3, METALNESS: 0.9 },
  COPPER: { COLOR: 0xb87333, ROUGHNESS: 0.2, METALNESS: 0.9 },
  BRASS: { COLOR: 0xb5a642, ROUGHNESS: 0.3, METALNESS: 0.8 },
  GOLD: { COLOR: 0xffd700, ROUGHNESS: 0.1, METALNESS: 1.0 },
  SILVER: { COLOR: 0xc0c0c0, ROUGHNESS: 0.1, METALNESS: 0.95 },
  IRON: { COLOR: 0x4c4c4c, ROUGHNESS: 0.5, METALNESS: 0.8 },

  // === LIQUIDS ===
  WATER: {
    COLOR: 0x006994,
    ROUGHNESS: 0.1,
    METALNESS: 0.0,
    OPACITY: 0.8,
    ENV_MAP_INTENSITY: 1.0,
  },
  LAVA: {
    COLOR: 0xffaa00,
    ROUGHNESS: 0.9,
    METALNESS: 0.0,
    EMISSIVE: 0xff4400,
    EMISSIVE_INTENSITY: 0.5,
  },
  OIL: { COLOR: 0x1a1a1a, ROUGHNESS: 0.0, METALNESS: 0.0, OPACITY: 0.9 },
  MERCURY: { COLOR: 0xc0c0c0, ROUGHNESS: 0.0, METALNESS: 1.0, OPACITY: 0.9 },

  // === FROZEN ===
  ICE: {
    COLOR: 0xaaeeff,
    ROUGHNESS: 0.1,
    METALNESS: 0.0,
    OPACITY: 0.8,
    ENV_MAP_INTENSITY: 1.2,
  },
  SNOW: { COLOR: 0xffffff, ROUGHNESS: 0.9, METALNESS: 0.0 },

  // === ORGANIC ===
  FABRIC: { COLOR: 0x8b4b9c, ROUGHNESS: 0.9, METALNESS: 0.0 },
  WOOD: { COLOR: 0x8b4513, ROUGHNESS: 0.8, METALNESS: 0.0 },
  LEATHER: { COLOR: 0x654321, ROUGHNESS: 0.7, METALNESS: 0.0 },

  // === BUILDING ===
  CONCRETE: { COLOR: 0x808080, ROUGHNESS: 0.9, METALNESS: 0.0 },
  BRICK: { COLOR: 0xb22222, ROUGHNESS: 0.8, METALNESS: 0.0 },
  CERAMIC: { COLOR: 0xfaf0e6, ROUGHNESS: 0.3, METALNESS: 0.0 },

  // === GLASS & GEMS ===
  GLASS: { COLOR: 0xffffff, ROUGHNESS: 0.0, METALNESS: 0.0, OPACITY: 0.3 },
  CRYSTAL: { COLOR: 0xffffff, ROUGHNESS: 0.0, METALNESS: 0.0, OPACITY: 0.7 },
  DIAMOND: {
    COLOR: 0xffffff,
    ROUGHNESS: 0.0,
    METALNESS: 0.0,
    OPACITY: 0.2,
    ENV_MAP_INTENSITY: 1.5,
  },
  RUBY: { COLOR: 0xcc0000, ROUGHNESS: 0.1, METALNESS: 0.0, OPACITY: 0.6 },
  EMERALD: { COLOR: 0x00cc44, ROUGHNESS: 0.1, METALNESS: 0.0, OPACITY: 0.6 },
  SAPPHIRE: { COLOR: 0x0066cc, ROUGHNESS: 0.1, METALNESS: 0.0, OPACITY: 0.6 },

  // === SCI-FI ===
  SCIFI_PANEL: {
    COLOR: 0x6a9bd1,
    ROUGHNESS: 0.3,
    METALNESS: 0.7,
    EMISSIVE: 0x001122,
    EMISSIVE_INTENSITY: 0.1,
  },
  HOLOGRAPHIC: {
    COLOR: 0x44ffff,
    ROUGHNESS: 0.1,
    METALNESS: 0.0,
    OPACITY: 0.5,
    EMISSIVE: 0x002244,
    EMISSIVE_INTENSITY: 0.3,
  },
  ENERGY_FIELD: {
    COLOR: 0x00ffff,
    ROUGHNESS: 0.0,
    METALNESS: 0.0,
    OPACITY: 0.4,
    EMISSIVE: 0x00ffff,
    EMISSIVE_INTENSITY: 0.8,
  },
  NEON_GLASS: {
    COLOR: 0xff00ff,
    ROUGHNESS: 0.0,
    METALNESS: 0.0,
    OPACITY: 0.6,
    EMISSIVE: 0xff00ff,
    EMISSIVE_INTENSITY: 0.5,
  },
  PLASMA_FIELD: {
    COLOR: 0xff4400,
    ROUGHNESS: 0.0,
    METALNESS: 0.0,
    OPACITY: 0.3,
    EMISSIVE: 0xff4400,
    EMISSIVE_INTENSITY: 1.0,
  },

  // === FANTASY ===
  GLOWING_CRYSTAL: {
    COLOR: 0x88ffff,
    ROUGHNESS: 0.1,
    METALNESS: 0.0,
    EMISSIVE: 0x004466,
    EMISSIVE_INTENSITY: 0.3,
    OPACITY: 0.7,
  },
  MAGIC_RUNE: {
    COLOR: 0x6600cc,
    ROUGHNESS: 0.2,
    METALNESS: 0.0,
    EMISSIVE: 0x6600cc,
    EMISSIVE_INTENSITY: 0.6,
  },
  DRAGON_SCALE: {
    COLOR: 0x228b22,
    ROUGHNESS: 0.4,
    METALNESS: 0.3,
    EMISSIVE: 0x004400,
    EMISSIVE_INTENSITY: 0.1,
  },

  // === CARTOON ===
  CARTOON_CEL: { COLOR: 0xff6b6b },
  TOON_METAL: { COLOR: 0x888888, ROUGHNESS: 0.8, METALNESS: 0.2 },
  FLAT_COLOR: { COLOR: 0x44aaff },

  // === SPECIAL FX ===
  MIRROR: { COLOR: 0xffffff, ROUGHNESS: 0.0, METALNESS: 1.0 },
  BLACK_HOLE: {
    COLOR: 0x000000,
    ROUGHNESS: 1.0,
    METALNESS: 0.0,
    EMISSIVE: 0x220022,
    EMISSIVE_INTENSITY: 0.1,
  },
  IRIDESCENT: { COLOR: 0x888888, ROUGHNESS: 0.0, METALNESS: 0.5 },
  ELECTRICITY: {
    COLOR: 0x00ffff,
    ROUGHNESS: 0.0,
    METALNESS: 0.0,
    OPACITY: 0.6,
    EMISSIVE: 0x00ffff,
    EMISSIVE_INTENSITY: 1.0,
  },
  RADIOACTIVE: {
    COLOR: 0x88ff00,
    ROUGHNESS: 0.3,
    METALNESS: 0.0,
    EMISSIVE: 0x88ff00,
    EMISSIVE_INTENSITY: 0.4,
  },
} as const;

// Default texture file names
export const TEXTURE_DEFAULTS = {
  ASPHALT: {
    map: "asphalt_albedo.jpg",
    normalMap: "asphalt_normal.jpg",
    roughnessMap: "asphalt_roughness.jpg",
  },
  GRASS: {
    map: "grass_albedo.jpg",
    normalMap: "grass_normal.jpg",
    aoMap: "grass_ao.jpg",
  },
  SCIFI_PANEL: {
    map: "scifi_panel_albedo.jpg",
    normalMap: "scifi_panel_normal.png",
    metalnessMap: "scifi_panel_metalness.jpg",
    emissiveMap: "scifi_panel_emissive.jpg",
  },
  RUSTED_METAL: {
    map: "rusted_metal_albedo.jpg",
    normalMap: "rusted_metal_normal.jpg",
    roughnessMap: "rusted_metal_roughness.jpg",
    metalnessMap: "rusted_metal_metalness.jpg",
  },
  COBBLESTONE: {
    map: "cobblestone_albedo.jpg",
    normalMap: "cobblestone_normal.jpg",
    displacementMap: "cobblestone_height.jpg",
  },
  MARBLE: {
    map: "marble_albedo.jpg",
    normalMap: "marble_normal.jpg",
    roughnessMap: "marble_roughness.jpg",
  },
  LAVA: {
    map: "lava_albedo.jpg",
    normalMap: "lava_normal.jpg",
    emissiveMap: "lava_emissive.jpg",
  },
  FABRIC: {
    map: "fabric_albedo.jpg",
    normalMap: "fabric_normal.jpg",
    roughnessMap: "fabric_roughness.jpg",
  },
} as const;

// Cache and performance constants
export const MATERIAL_CACHE_CONFIG = {
  DEFAULT_TEXTURE_BASE_PATH: "/textures/",
  CACHE_KEY_SEPARATOR: "_",
  DEFAULT_REPEAT: { x: 1, y: 1 },
} as const;
