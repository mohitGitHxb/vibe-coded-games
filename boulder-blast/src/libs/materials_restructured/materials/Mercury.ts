import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Mercury material - Liquid metallic mercury
 */
export class Mercury implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      roughness: 0.0,
      metalness: 1.0,
      transparent: true,
      opacity: 0.9,
    });
  }
}
