import * as THREE from "three";
import type { PBRMaterialConfig } from "../types/MaterialTypes.js";
import {
  MATERIAL_DEFAULTS,
  TEXTURE_DEFAULTS,
} from "../constants/MaterialConstants.js";

/**
 * Creates metallic and technological materials like sci-fi panels, rusted metal
 */
export class MetallicMaterials {
  /**
   * Creates metallic materials
   */
  static async create(
    type: "scifiPanel" | "rustedMetal",
    config: PBRMaterialConfig = {},
    applyTextureConfiguration: (
      material: THREE.MeshStandardMaterial,
      config: PBRMaterialConfig,
      textureDefaults: { [key: string]: string }
    ) => Promise<void>
  ): Promise<THREE.MeshStandardMaterial> {
    switch (type) {
      case "scifiPanel":
        return this.createSciFiPanel(config, applyTextureConfiguration);
      case "rustedMetal":
        return this.createRustedMetal(config, applyTextureConfiguration);
      default:
        throw new Error(`Unsupported metallic material type: ${type}`);
    }
  }

  private static async createSciFiPanel(
    config: PBRMaterialConfig,
    applyTextureConfiguration: (
      material: THREE.MeshStandardMaterial,
      config: PBRMaterialConfig,
      textureDefaults: { [key: string]: string }
    ) => Promise<void>
  ): Promise<THREE.MeshStandardMaterial> {
    const material = new THREE.MeshStandardMaterial({
      color: config.color || MATERIAL_DEFAULTS.SCIFI_PANEL.COLOR,
      roughness:
        config.roughness !== undefined
          ? config.roughness
          : MATERIAL_DEFAULTS.SCIFI_PANEL.ROUGHNESS,
      metalness:
        config.metalness !== undefined
          ? config.metalness
          : MATERIAL_DEFAULTS.SCIFI_PANEL.METALNESS,
      emissive: config.emissive || MATERIAL_DEFAULTS.SCIFI_PANEL.EMISSIVE,
      emissiveIntensity:
        config.emissiveIntensity !== undefined
          ? config.emissiveIntensity
          : MATERIAL_DEFAULTS.SCIFI_PANEL.EMISSIVE_INTENSITY,
      transparent: config.transparent || false,
      opacity: config.opacity !== undefined ? config.opacity : 1.0,
      side: config.side || THREE.FrontSide,
    });

    await applyTextureConfiguration(
      material,
      config,
      TEXTURE_DEFAULTS.SCIFI_PANEL
    );
    return material;
  }

  private static async createRustedMetal(
    config: PBRMaterialConfig,
    applyTextureConfiguration: (
      material: THREE.MeshStandardMaterial,
      config: PBRMaterialConfig,
      textureDefaults: { [key: string]: string }
    ) => Promise<void>
  ): Promise<THREE.MeshStandardMaterial> {
    const material = new THREE.MeshStandardMaterial({
      color: config.color || MATERIAL_DEFAULTS.RUSTED_METAL.COLOR,
      roughness:
        config.roughness !== undefined
          ? config.roughness
          : MATERIAL_DEFAULTS.RUSTED_METAL.ROUGHNESS,
      metalness:
        config.metalness !== undefined
          ? config.metalness
          : MATERIAL_DEFAULTS.RUSTED_METAL.METALNESS,
      transparent: config.transparent || false,
      opacity: config.opacity !== undefined ? config.opacity : 1.0,
      side: config.side || THREE.FrontSide,
    });

    await applyTextureConfiguration(
      material,
      config,
      TEXTURE_DEFAULTS.RUSTED_METAL
    );
    return material;
  }
}
