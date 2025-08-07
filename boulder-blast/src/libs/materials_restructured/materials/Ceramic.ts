import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Ceramic material - Fired clay pottery
 */
export class Ceramic implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xfaf0e6,
      roughness: 0.3,
      metalness: 0.0,
    });
  }
}
