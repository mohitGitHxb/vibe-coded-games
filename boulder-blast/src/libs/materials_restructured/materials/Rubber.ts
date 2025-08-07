import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Rubber material - Elastic synthetic material
 */
export class Rubber implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 0.9,
      metalness: 0.0,
    });
  }
}
