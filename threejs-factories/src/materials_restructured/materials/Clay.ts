import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Clay material - Earthy ceramic clay
 */
export class Clay implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8,
      metalness: 0.0,
    });
  }
}
