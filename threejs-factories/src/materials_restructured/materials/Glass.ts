import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Glass material - Transparent clear material
 */
export class Glass implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.0,
      metalness: 0.0,
      transparent: true,
      opacity: 0.3,
    });
  }
}
