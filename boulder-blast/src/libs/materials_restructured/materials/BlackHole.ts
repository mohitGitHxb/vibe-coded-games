import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Black Hole material - Light-absorbing void
 */
export class BlackHole implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x000000,
      roughness: 1.0,
      metalness: 0.0,
      emissive: 0x220022,
      emissiveIntensity: 0.1,
    });
  }
}
