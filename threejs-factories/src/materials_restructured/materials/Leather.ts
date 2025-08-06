import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Leather material - Tough organic material
 */
export class Leather implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x654321,
      roughness: 0.7,
      metalness: 0.0,
    });
  }
}
