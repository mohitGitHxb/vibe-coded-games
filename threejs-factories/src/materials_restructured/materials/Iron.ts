import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Iron material - Raw metallic iron
 */
export class Iron implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x4c4c4c,
      roughness: 0.5,
      metalness: 0.8,
    });
  }
}
