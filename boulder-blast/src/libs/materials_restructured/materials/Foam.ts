import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Foam material - Light spongy material
 */
export class Foam implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xffffcc,
      roughness: 0.9,
      metalness: 0.0,
    });
  }
}
