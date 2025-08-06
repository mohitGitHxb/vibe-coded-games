import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Glowing Crystal material - Magical luminescent crystal
 */
export class GlowingCrystal implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x88ffff,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.7,
      emissive: 0x004466,
      emissiveIntensity: 0.3,
    });
  }
}
