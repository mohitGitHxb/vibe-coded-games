import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Steel material - Industrial metallic material
 */
export class Steel implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x71797e,
      roughness: 0.3,
      metalness: 0.9,
    });
  }
}
