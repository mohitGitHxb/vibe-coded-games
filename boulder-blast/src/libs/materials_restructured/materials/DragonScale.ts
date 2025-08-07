import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Dragon Scale material - Mystical dragon hide
 */
export class DragonScale implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x228b22,
      roughness: 0.4,
      metalness: 0.3,
      emissive: 0x004400,
      emissiveIntensity: 0.1,
    });
  }
}
