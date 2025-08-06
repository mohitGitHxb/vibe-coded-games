import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Silver material - Precious white metal
 */
export class Silver implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      roughness: 0.1,
      metalness: 0.95,
    });
  }
}
