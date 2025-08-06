import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Marble material - Smooth polished stone
 */
export class Marble implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xf5f5dc,
      roughness: 0.2,
      metalness: 0.0,
    });
  }
}
