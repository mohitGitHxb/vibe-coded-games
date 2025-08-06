import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Neon Glass material - Glowing neon tubing
 */
export class NeonGlass implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xff00ff,
      roughness: 0.0,
      metalness: 0.0,
      transparent: true,
      opacity: 0.6,
      emissive: 0xff00ff,
      emissiveIntensity: 0.5,
    });
  }
}
