import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Copper material - Reddish-brown metal
 */
export class Copper implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xb87333,
      roughness: 0.2,
      metalness: 0.9,
    });
  }
}
