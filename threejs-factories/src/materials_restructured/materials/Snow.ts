import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Snow material - Pure white snow
 */
export class Snow implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0.0,
    });
  }
}
