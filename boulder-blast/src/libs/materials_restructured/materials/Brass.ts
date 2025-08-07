import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Brass material - Golden metal alloy
 */
export class Brass implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xb5a642,
      roughness: 0.3,
      metalness: 0.8,
    });
  }
}
