import * as THREE from "three";
import type { PBRMaterialConfig } from "../types/MaterialTypes.js";
import {
  MATERIAL_DEFAULTS,
  TEXTURE_DEFAULTS,
} from "../constants/MaterialConstants.js";

/**
 * Creates terrain-based materials like grass, asphalt, cobblestone
 */
export class TerrainMaterials {
  /**
   * Creates an asphalt material - dark, slightly rough surface suitable for roads
   */
  static async create(
    type: "asphalt" | "grass" | "cobblestone",
    config: PBRMaterialConfig = {},
    applyTextureConfiguration: (
      material: THREE.MeshStandardMaterial,
      config: PBRMaterialConfig,
      textureDefaults: { [key: string]: string }
    ) => Promise<void>
  ): Promise<THREE.MeshStandardMaterial> {
    switch (type) {
      case "asphalt":
        return this.createAsphalt(config, applyTextureConfiguration);
      case "grass":
        return this.createGrass(config, applyTextureConfiguration);
      case "cobblestone":
        return this.createCobblestone(config, applyTextureConfiguration);
      default:
        throw new Error(`Unsupported terrain material type: ${type}`);
    }
  }

  private static async createAsphalt(
    config: PBRMaterialConfig,
    applyTextureConfiguration: (
      material: THREE.MeshStandardMaterial,
      config: PBRMaterialConfig,
      textureDefaults: { [key: string]: string }
    ) => Promise<void>
  ): Promise<THREE.MeshStandardMaterial> {
    const material = new THREE.MeshStandardMaterial({
      color: config.color || MATERIAL_DEFAULTS.ASPHALT.COLOR,
      roughness:
        config.roughness !== undefined
          ? config.roughness
          : MATERIAL_DEFAULTS.ASPHALT.ROUGHNESS,
      metalness:
        config.metalness !== undefined
          ? config.metalness
          : MATERIAL_DEFAULTS.ASPHALT.METALNESS,
      transparent: config.transparent || false,
      opacity: config.opacity !== undefined ? config.opacity : 1.0,
      side: config.side || THREE.FrontSide,
    });

    await applyTextureConfiguration(material, config, TEXTURE_DEFAULTS.ASPHALT);
    return material;
  }

  private static async createGrass(
    config: PBRMaterialConfig,
    applyTextureConfiguration: (
      material: THREE.MeshStandardMaterial,
      config: PBRMaterialConfig,
      textureDefaults: { [key: string]: string }
    ) => Promise<void>
  ): Promise<THREE.MeshStandardMaterial> {
    const material = new THREE.MeshStandardMaterial({
      color: config.color || MATERIAL_DEFAULTS.GRASS.COLOR,
      roughness:
        config.roughness !== undefined
          ? config.roughness
          : MATERIAL_DEFAULTS.GRASS.ROUGHNESS,
      metalness:
        config.metalness !== undefined
          ? config.metalness
          : MATERIAL_DEFAULTS.GRASS.METALNESS,
      transparent: config.transparent || false,
      opacity: config.opacity !== undefined ? config.opacity : 1.0,
      side: config.side || THREE.FrontSide,
    });

    await applyTextureConfiguration(material, config, TEXTURE_DEFAULTS.GRASS);
    return material;
  }

  private static async createCobblestone(
    config: PBRMaterialConfig,
    applyTextureConfiguration: (
      material: THREE.MeshStandardMaterial,
      config: PBRMaterialConfig,
      textureDefaults: { [key: string]: string }
    ) => Promise<void>
  ): Promise<THREE.MeshStandardMaterial> {
    const material = new THREE.MeshStandardMaterial({
      color: config.color || MATERIAL_DEFAULTS.COBBLESTONE.COLOR,
      roughness:
        config.roughness !== undefined
          ? config.roughness
          : MATERIAL_DEFAULTS.COBBLESTONE.ROUGHNESS,
      metalness:
        config.metalness !== undefined
          ? config.metalness
          : MATERIAL_DEFAULTS.COBBLESTONE.METALNESS,
      transparent: config.transparent || false,
      opacity: config.opacity !== undefined ? config.opacity : 1.0,
      side: config.side || THREE.FrontSide,
    });

    await applyTextureConfiguration(
      material,
      config,
      TEXTURE_DEFAULTS.COBBLESTONE
    );
    return material;
  }
}
