import * as THREE from "three";
import type {
  BaseMaterialConfig,
  GlowMaterialConfig,
  WaterMaterialConfig,
  PBRMaterialConfig,
} from "../types/MaterialTypes.js";
import {
  MATERIAL_DEFAULTS,
  TEXTURE_DEFAULTS,
} from "../constants/MaterialConstants.js";

/**
 * Creates special effect materials like water, glowing crystal, ice, lava
 */
export class SpecialMaterials {
  /**
   * Creates special effect materials
   */
  static async create(
    type: "water" | "glowingCrystal" | "ice" | "lava",
    config: any = {},
    applyTextureConfiguration?: (
      material: THREE.MeshStandardMaterial,
      config: PBRMaterialConfig,
      textureDefaults: { [key: string]: string }
    ) => Promise<void>
  ): Promise<THREE.MeshStandardMaterial> {
    switch (type) {
      case "water":
        return this.createWater(config);
      case "glowingCrystal":
        return this.createGlowingCrystal(config);
      case "ice":
        return this.createIce(config);
      case "lava":
        return this.createLava(config, applyTextureConfiguration!);
      default:
        throw new Error(`Unsupported special material type: ${type}`);
    }
  }

  private static createWater(
    config: WaterMaterialConfig = {}
  ): THREE.MeshStandardMaterial {
    const material = new THREE.MeshStandardMaterial({
      color: config.color || MATERIAL_DEFAULTS.WATER.COLOR,
      roughness: MATERIAL_DEFAULTS.WATER.ROUGHNESS,
      metalness: MATERIAL_DEFAULTS.WATER.METALNESS,
      transparent: true,
      opacity:
        config.opacity !== undefined
          ? config.opacity
          : MATERIAL_DEFAULTS.WATER.OPACITY,
      side: config.side || THREE.FrontSide,
      envMapIntensity: MATERIAL_DEFAULTS.WATER.ENV_MAP_INTENSITY,
    });

    if (config.envMap) {
      material.envMap = config.envMap;
    }

    return material;
  }

  private static createGlowingCrystal(
    config: GlowMaterialConfig = {}
  ): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: config.color || MATERIAL_DEFAULTS.GLOWING_CRYSTAL.COLOR,
      roughness: MATERIAL_DEFAULTS.GLOWING_CRYSTAL.ROUGHNESS,
      metalness: MATERIAL_DEFAULTS.GLOWING_CRYSTAL.METALNESS,
      emissive:
        config.glowColor ||
        config.color ||
        MATERIAL_DEFAULTS.GLOWING_CRYSTAL.EMISSIVE,
      emissiveIntensity:
        config.emissiveIntensity !== undefined
          ? config.emissiveIntensity
          : MATERIAL_DEFAULTS.GLOWING_CRYSTAL.EMISSIVE_INTENSITY,
      transparent: config.transparent !== undefined ? config.transparent : true,
      opacity:
        config.opacity !== undefined
          ? config.opacity
          : MATERIAL_DEFAULTS.GLOWING_CRYSTAL.OPACITY,
      side: config.side || THREE.DoubleSide,
    });
  }

  private static createIce(
    config: BaseMaterialConfig = {}
  ): THREE.MeshStandardMaterial {
    return new THREE.MeshStandardMaterial({
      color: config.color || MATERIAL_DEFAULTS.ICE.COLOR,
      roughness: MATERIAL_DEFAULTS.ICE.ROUGHNESS,
      metalness: MATERIAL_DEFAULTS.ICE.METALNESS,
      transparent: config.transparent !== undefined ? config.transparent : true,
      opacity:
        config.opacity !== undefined
          ? config.opacity
          : MATERIAL_DEFAULTS.ICE.OPACITY,
      side: config.side || THREE.FrontSide,
      envMapIntensity: MATERIAL_DEFAULTS.ICE.ENV_MAP_INTENSITY,
    });
  }

  private static async createLava(
    config: PBRMaterialConfig,
    applyTextureConfiguration: (
      material: THREE.MeshStandardMaterial,
      config: PBRMaterialConfig,
      textureDefaults: { [key: string]: string }
    ) => Promise<void>
  ): Promise<THREE.MeshStandardMaterial> {
    const material = new THREE.MeshStandardMaterial({
      color: config.color || MATERIAL_DEFAULTS.LAVA.COLOR,
      roughness:
        config.roughness !== undefined
          ? config.roughness
          : MATERIAL_DEFAULTS.LAVA.ROUGHNESS,
      metalness:
        config.metalness !== undefined
          ? config.metalness
          : MATERIAL_DEFAULTS.LAVA.METALNESS,
      emissive: config.emissive || MATERIAL_DEFAULTS.LAVA.EMISSIVE,
      emissiveIntensity:
        config.emissiveIntensity !== undefined
          ? config.emissiveIntensity
          : MATERIAL_DEFAULTS.LAVA.EMISSIVE_INTENSITY,
      transparent: config.transparent || false,
      opacity: config.opacity !== undefined ? config.opacity : 1.0,
      side: config.side || THREE.FrontSide,
    });

    await applyTextureConfiguration(material, config, TEXTURE_DEFAULTS.LAVA);
    return material;
  }
}
