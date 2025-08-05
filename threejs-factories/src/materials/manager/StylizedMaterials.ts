import * as THREE from "three";
import type {
  BaseMaterialConfig,
  PBRMaterialConfig,
} from "../types/MaterialTypes.js";
import {
  MATERIAL_DEFAULTS,
  TEXTURE_DEFAULTS,
} from "../constants/MaterialConstants.js";

/**
 * Creates stylized materials like cartoon cel-shaded, marble, fabric
 */
export class StylizedMaterials {
  /**
   * Creates stylized materials
   */
  static async create(
    type: "cartoonCelShaded" | "marble" | "fabric",
    config: any = {},
    applyTextureConfiguration?: (
      material: THREE.MeshStandardMaterial,
      config: PBRMaterialConfig,
      textureDefaults: { [key: string]: string }
    ) => Promise<void>
  ): Promise<THREE.Material> {
    switch (type) {
      case "cartoonCelShaded":
        return this.createCartoonCelShaded(config);
      case "marble":
        return this.createMarble(config, applyTextureConfiguration!);
      case "fabric":
        return this.createFabric(config, applyTextureConfiguration!);
      default:
        throw new Error(`Unsupported stylized material type: ${type}`);
    }
  }

  private static createCartoonCelShaded(
    config: BaseMaterialConfig = {}
  ): THREE.MeshToonMaterial {
    return new THREE.MeshToonMaterial({
      color: config.color || MATERIAL_DEFAULTS.CARTOON_CEL.COLOR,
      transparent: config.transparent || false,
      opacity: config.opacity !== undefined ? config.opacity : 1.0,
      side: config.side || THREE.FrontSide,
    });
  }

  private static async createMarble(
    config: PBRMaterialConfig,
    applyTextureConfiguration: (
      material: THREE.MeshStandardMaterial,
      config: PBRMaterialConfig,
      textureDefaults: { [key: string]: string }
    ) => Promise<void>
  ): Promise<THREE.MeshStandardMaterial> {
    const material = new THREE.MeshStandardMaterial({
      color: config.color || MATERIAL_DEFAULTS.MARBLE.COLOR,
      roughness:
        config.roughness !== undefined
          ? config.roughness
          : MATERIAL_DEFAULTS.MARBLE.ROUGHNESS,
      metalness:
        config.metalness !== undefined
          ? config.metalness
          : MATERIAL_DEFAULTS.MARBLE.METALNESS,
      transparent: config.transparent || false,
      opacity: config.opacity !== undefined ? config.opacity : 1.0,
      side: config.side || THREE.FrontSide,
    });

    await applyTextureConfiguration(material, config, TEXTURE_DEFAULTS.MARBLE);
    return material;
  }

  private static async createFabric(
    config: PBRMaterialConfig,
    applyTextureConfiguration: (
      material: THREE.MeshStandardMaterial,
      config: PBRMaterialConfig,
      textureDefaults: { [key: string]: string }
    ) => Promise<void>
  ): Promise<THREE.MeshStandardMaterial> {
    const material = new THREE.MeshStandardMaterial({
      color: config.color || MATERIAL_DEFAULTS.FABRIC.COLOR,
      roughness:
        config.roughness !== undefined
          ? config.roughness
          : MATERIAL_DEFAULTS.FABRIC.ROUGHNESS,
      metalness:
        config.metalness !== undefined
          ? config.metalness
          : MATERIAL_DEFAULTS.FABRIC.METALNESS,
      transparent: config.transparent || false,
      opacity: config.opacity !== undefined ? config.opacity : 1.0,
      side: config.side || THREE.FrontSide,
    });

    await applyTextureConfiguration(material, config, TEXTURE_DEFAULTS.FABRIC);
    return material;
  }
}
