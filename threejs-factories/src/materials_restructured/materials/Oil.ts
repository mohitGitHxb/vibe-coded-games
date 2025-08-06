import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Oil material - Dark viscous liquid
 */
export class Oil implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.0,
      metalness: 0.0,
      transparent: true,
      opacity: 0.9,
    });
  }
}
