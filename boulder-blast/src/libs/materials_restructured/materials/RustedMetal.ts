import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Rusted Metal material - Weathered corroded metal
 */
export class RustedMetal implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.9,
      metalness: 0.4,
    });
  }
}
