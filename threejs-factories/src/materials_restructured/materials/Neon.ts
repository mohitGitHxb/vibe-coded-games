import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Neon material - Bright glowing neon
 */
export class Neon implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x00ff88,
      roughness: 0.1,
      metalness: 0.0,
      emissive: 0x00ff88,
      emissiveIntensity: 0.7,
    });
  }
}
