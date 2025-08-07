import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Asphalt material - Dark road surface
 */
export class Asphalt implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x2a2a2a,
      roughness: 0.8,
      metalness: 0.1,
    });
  }
}
