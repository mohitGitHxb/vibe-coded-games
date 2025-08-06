import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Fabric material - Woven textile material
 */
export class Fabric implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x8b4b9c,
      roughness: 0.9,
      metalness: 0.0,
    });
  }
}
