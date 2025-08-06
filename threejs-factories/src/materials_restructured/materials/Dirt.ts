import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Dirt material - Natural earth soil
 */
export class Dirt implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x654321,
      roughness: 0.9,
      metalness: 0.0,
    });
  }
}
