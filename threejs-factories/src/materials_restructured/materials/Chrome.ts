import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Chrome material - Highly reflective polished metal
 */
export class Chrome implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      roughness: 0.0,
      metalness: 1.0,
    });
  }
}
