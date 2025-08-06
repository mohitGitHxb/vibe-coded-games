import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Velvet material - Soft luxurious fabric
 */
export class Velvet implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x8b0000,
      roughness: 0.9,
      metalness: 0.0,
    });
  }
}
