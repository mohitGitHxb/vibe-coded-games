import * as THREE from "three";
import type { MaterialType, MaterialConfig } from "../types/MaterialTypes.js";
import { MaterialCore } from "../core/MaterialCore.js";
import { TerrainMaterials } from "./TerrainMaterials.js";
import { MetallicMaterials } from "./MetallicMaterials.js";
import { SpecialMaterials } from "./SpecialMaterials.js";
import { StylizedMaterials } from "./StylizedMaterials.js";
import { MaterialType as MT } from "../types/MaterialTypes.js";
import { MATERIAL_DEFAULTS } from "../constants/MaterialConstants.js";

/**
 * Refactored Material Factory with modular architecture
 *
 * This factory now uses the principle of separation of concerns:
 * - Types are in separate files
 * - Constants are in separate files
 * - Material creation is separated by category
 * - Core functionality is abstracted
 *
 * @example
 * ```typescript
 * const factory = new MaterialFactory('/textures/');
 *
 * // Type-safe material creation
 * const grass = await factory.createGrass({ color: 0x22cc22 });
 * const metal = await factory.createRustedMetal({ roughness: 0.9 });
 *
 * // Generic creation with enum
 * const asphalt = await factory.createMaterial(MaterialType.Asphalt, {
 *   roughness: 0.8
 * });
 * ```
 */
export class MaterialFactory {
  private core: MaterialCore;

  /**
   * Creates a new MaterialFactory instance
   *
   * @param textureBasePath - Base path for texture files (default: '/textures/')
   * @param textureLoader - Custom texture loader instance (optional)
   */
  constructor(
    textureBasePath: string = "/textures/",
    textureLoader?: THREE.TextureLoader
  ) {
    this.core = new MaterialCore(textureBasePath, textureLoader);
  }

  // === TERRAIN MATERIALS ===

  /**
   * Creates an asphalt material - dark, slightly rough surface suitable for roads
   */
  async createAsphalt(
    config: MaterialConfig = {}
  ): Promise<THREE.MeshStandardMaterial> {
    return TerrainMaterials.create(
      "asphalt",
      config as any,
      this.core.applyTextureConfiguration.bind(this.core)
    );
  }

  /**
   * Creates a grass material - green, rough, non-metallic surface
   */
  async createGrass(
    config: MaterialConfig = {}
  ): Promise<THREE.MeshStandardMaterial> {
    return TerrainMaterials.create(
      "grass",
      config as any,
      this.core.applyTextureConfiguration.bind(this.core)
    );
  }

  /**
   * Creates a cobblestone material - rough stone surface for pathways
   */
  async createCobblestone(
    config: MaterialConfig = {}
  ): Promise<THREE.MeshStandardMaterial> {
    return TerrainMaterials.create(
      "cobblestone",
      config as any,
      this.core.applyTextureConfiguration.bind(this.core)
    );
  }

  // === METALLIC MATERIALS ===

  /**
   * Creates a sci-fi panel material - metallic, smooth surface with technological appearance
   */
  async createSciFiPanel(
    config: MaterialConfig = {}
  ): Promise<THREE.MeshStandardMaterial> {
    return MetallicMaterials.create(
      "scifiPanel",
      config as any,
      this.core.applyTextureConfiguration.bind(this.core)
    );
  }

  /**
   * Creates a rusted metal material - weathered metallic surface with corrosion
   */
  async createRustedMetal(
    config: MaterialConfig = {}
  ): Promise<THREE.MeshStandardMaterial> {
    return MetallicMaterials.create(
      "rustedMetal",
      config as any,
      this.core.applyTextureConfiguration.bind(this.core)
    );
  }

  // === SPECIAL MATERIALS ===

  /**
   * Creates a water material - transparent, reflective, and refractive
   */
  createWater(config: MaterialConfig = {}): THREE.MeshStandardMaterial {
    return SpecialMaterials.create(
      "water",
      config
    ) as unknown as THREE.MeshStandardMaterial;
  }

  /**
   * Creates a glowing crystal material - emissive, translucent crystal surface
   */
  createGlowingCrystal(
    config: MaterialConfig = {}
  ): THREE.MeshStandardMaterial {
    return SpecialMaterials.create(
      "glowingCrystal",
      config
    ) as unknown as THREE.MeshStandardMaterial;
  }

  /**
   * Creates an ice material - transparent, crystalline frozen surface
   */
  createIce(config: MaterialConfig = {}): THREE.MeshStandardMaterial {
    return SpecialMaterials.create(
      "ice",
      config
    ) as unknown as THREE.MeshStandardMaterial;
  }

  /**
   * Creates a lava material - hot, glowing molten rock surface
   */
  async createLava(
    config: MaterialConfig = {}
  ): Promise<THREE.MeshStandardMaterial> {
    return SpecialMaterials.create(
      "lava",
      config,
      this.core.applyTextureConfiguration.bind(this.core)
    ) as Promise<THREE.MeshStandardMaterial>;
  }

  // === STYLIZED MATERIALS ===

  /**
   * Creates a cartoon cel-shaded material - flat, stylized appearance
   */
  createCartoonCelShaded(config: MaterialConfig = {}): THREE.MeshToonMaterial {
    return StylizedMaterials.create(
      "cartoonCelShaded",
      config
    ) as unknown as THREE.MeshToonMaterial;
  }

  /**
   * Creates a marble material - smooth, polished stone surface
   */
  async createMarble(
    config: MaterialConfig = {}
  ): Promise<THREE.MeshStandardMaterial> {
    return StylizedMaterials.create(
      "marble",
      config,
      this.core.applyTextureConfiguration.bind(this.core)
    ) as Promise<THREE.MeshStandardMaterial>;
  }

  /**
   * Creates a fabric material - soft, non-metallic textile surface
   */
  async createFabric(
    config: MaterialConfig = {}
  ): Promise<THREE.MeshStandardMaterial> {
    return StylizedMaterials.create(
      "fabric",
      config,
      this.core.applyTextureConfiguration.bind(this.core)
    ) as Promise<THREE.MeshStandardMaterial>;
  }

  // === GENERIC CREATION ===

  /**
   * Generic material creation method using material type enum
   *
   * @param type - Material type from MaterialType enum
   * @param config - Configuration specific to the material type
   * @returns Promise resolving to the created material
   */
  async createMaterial(
    type: MaterialType,
    config: MaterialConfig = {}
  ): Promise<THREE.Material> {
    // Try specific creators first for existing materials
    switch (type) {
      case MT.Asphalt:
        return this.createAsphalt(config);
      case MT.Grass:
        return this.createGrass(config);
      case MT.SciFiPanel:
        return this.createSciFiPanel(config);
      case MT.Water:
        return this.createWater(config);
      case MT.RustedMetal:
        return this.createRustedMetal(config);
      case MT.GlowingCrystal:
        return this.createGlowingCrystal(config);
      case MT.CartoonCelShaded:
        return this.createCartoonCelShaded(config);
      case MT.Cobblestone:
        return this.createCobblestone(config);
      case MT.Marble:
        return this.createMarble(config);
      case MT.Lava:
        return this.createLava(config);
      case MT.Ice:
        return this.createIce(config);
      case MT.Fabric:
        return this.createFabric(config);

      // All other materials use synthetic generation
      default:
        return this.createSyntheticMaterial(type, config);
    }
  }

  /**
   * Creates a synthetic material using procedural generation
   * No external texture files required!
   */
  private createSyntheticMaterial(
    type: MaterialType,
    config: MaterialConfig = {}
  ): THREE.Material {
    const defaults = this.getMaterialDefaults(type);
    if (!defaults) {
      throw new Error(`Unsupported material type: ${type}`);
    }

    // Cast config to PBR config for roughness/metalness access
    const pbrConfig = config as any;

    // Create material based on properties
    const material = new THREE.MeshStandardMaterial({
      color: config.color ?? defaults.COLOR,
      roughness: pbrConfig.roughness ?? defaults.ROUGHNESS,
      metalness: pbrConfig.metalness ?? defaults.METALNESS,
      transparent:
        config.transparent ??
        (defaults.OPACITY !== undefined && defaults.OPACITY < 1.0),
      opacity: config.opacity ?? defaults.OPACITY ?? 1.0,
      emissive: defaults.EMISSIVE
        ? new THREE.Color(defaults.EMISSIVE)
        : undefined,
      emissiveIntensity: defaults.EMISSIVE_INTENSITY ?? 0.0,
      envMapIntensity: defaults.ENV_MAP_INTENSITY ?? 1.0,
    });

    // Generate synthetic textures for certain materials
    if (this.needsSyntheticTexture(type)) {
      material.map = this.generateSyntheticTexture(type);
    }

    return material;
  }

  /**
   * Get material defaults for a given type
   */
  private getMaterialDefaults(type: MaterialType): any {
    const constantMap: Record<string, string> = {
      [MT.Sand]: "SAND",
      [MT.Clay]: "CLAY",
      [MT.Dirt]: "DIRT",
      [MT.Chrome]: "CHROME",
      [MT.Steel]: "STEEL",
      [MT.Copper]: "COPPER",
      [MT.Brass]: "BRASS",
      [MT.Gold]: "GOLD",
      [MT.Silver]: "SILVER",
      [MT.Iron]: "IRON",
      [MT.Oil]: "OIL",
      [MT.Mercury]: "MERCURY",
      [MT.Snow]: "SNOW",
      [MT.Wood]: "WOOD",
      [MT.Leather]: "LEATHER",
      [MT.Concrete]: "CONCRETE",
      [MT.Brick]: "BRICK",
      [MT.Ceramic]: "CERAMIC",
      [MT.Glass]: "GLASS",
      [MT.Crystal]: "CRYSTAL",
      [MT.Diamond]: "DIAMOND",
      [MT.Ruby]: "RUBY",
      [MT.Emerald]: "EMERALD",
      [MT.Sapphire]: "SAPPHIRE",
      [MT.HolographicMaterial]: "HOLOGRAPHIC",
      [MT.EnergyField]: "ENERGY_FIELD",
      [MT.NeonGlass]: "NEON_GLASS",
      [MT.PlasmaField]: "PLASMA_FIELD",
      [MT.MagicRune]: "MAGIC_RUNE",
      [MT.DragonScale]: "DRAGON_SCALE",
      [MT.ToonMetal]: "TOON_METAL",
      [MT.FlatColor]: "FLAT_COLOR",
      [MT.Mirror]: "MIRROR",
      [MT.BlackHole]: "BLACK_HOLE",
      [MT.Iridescent]: "IRIDESCENT",
      [MT.Electricity]: "ELECTRICITY",
      [MT.Radioactive]: "RADIOACTIVE",
    };

    const constantKey = constantMap[type];
    if (constantKey) {
      return (MATERIAL_DEFAULTS as any)[constantKey];
    }

    return null;
  }

  /**
   * Check if a material type needs a synthetic texture
   */
  private needsSyntheticTexture(type: MaterialType): boolean {
    const texturedTypes: MaterialType[] = [
      MT.Sand,
      MT.Brick,
      MT.Wood,
      MT.Concrete,
      MT.Ceramic,
    ];
    return texturedTypes.includes(type);
  }

  /**
   * Generate a simple synthetic texture for materials
   */
  private generateSyntheticTexture(type: MaterialType): THREE.Texture {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d")!;

    switch (type) {
      case MT.Sand:
        this.generateSandTexture(ctx);
        break;
      case MT.Brick:
        this.generateBrickTexture(ctx);
        break;
      case MT.Wood:
        this.generateWoodTexture(ctx);
        break;
      case MT.Concrete:
        this.generateConcreteTexture(ctx);
        break;
      default:
        this.generateNoiseTexture(ctx);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    return texture;
  }

  private generateSandTexture(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#c2b280";
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 1000; i++) {
      ctx.fillStyle = `rgb(${180 + Math.random() * 40}, ${
        160 + Math.random() * 40
      }, ${120 + Math.random() * 20})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
  }

  private generateBrickTexture(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#8B4513";
    ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = "#654321";
    ctx.lineWidth = 2;
    for (let y = 0; y < 256; y += 32) {
      for (let x = 0; x < 256; x += 64) {
        const offset = (y / 32) % 2 === 0 ? 0 : 32;
        ctx.strokeRect(x + offset, y, 64, 32);
      }
    }
  }

  private generateWoodTexture(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createLinearGradient(0, 0, 256, 0);
    gradient.addColorStop(0, "#8B4513");
    gradient.addColorStop(0.5, "#A0522D");
    gradient.addColorStop(1, "#8B4513");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 256, 256);

    for (let y = 0; y < 256; y += 8) {
      ctx.fillStyle = `rgba(139, 69, 19, ${0.1 + Math.random() * 0.2})`;
      ctx.fillRect(0, y, 256, 2);
    }
  }

  private generateConcreteTexture(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = `rgb(${120 + Math.random() * 20}, ${
        120 + Math.random() * 20
      }, ${120 + Math.random() * 20})`;
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 1, 1);
    }
  }

  private generateNoiseTexture(ctx: CanvasRenderingContext2D): void {
    const imageData = ctx.createImageData(256, 256);
    for (let i = 0; i < imageData.data.length; i += 4) {
      const noise = Math.random() * 255;
      imageData.data[i] = noise; // R
      imageData.data[i + 1] = noise; // G
      imageData.data[i + 2] = noise; // B
      imageData.data[i + 3] = 255; // A
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // === UTILITY METHODS ===

  /**
   * Disposes of all cached textures and clears the cache
   * Call this method when the factory is no longer needed to free up memory
   */
  dispose(): void {
    this.core.dispose();
  }

  /**
   * Gets information about the current texture cache
   * Useful for debugging and memory management
   */
  getCacheInfo(): { size: number; urls: string[] } {
    return this.core.getCacheInfo();
  }

  /**
   * Gets the current texture base path
   */
  getTextureBasePath(): string {
    return this.core.getTextureBasePath();
  }

  /**
   * Sets a new texture base path
   */
  setTextureBasePath(newBasePath: string): void {
    this.core.setTextureBasePath(newBasePath);
  }
}

// Re-export types and constants for convenience
export { MaterialType } from "../types/MaterialTypes.js";
export type {
  BaseMaterialConfig,
  PBRMaterialConfig,
  WaterMaterialConfig,
  GlowMaterialConfig,
  MaterialConfig,
} from "../types/MaterialTypes.js";
