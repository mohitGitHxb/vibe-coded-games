import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Plastic material - Synthetic polymer
 */
export class Plastic implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xff6b95,
      roughness: 0.4,
      metalness: 0.0,
    });
  }
}
