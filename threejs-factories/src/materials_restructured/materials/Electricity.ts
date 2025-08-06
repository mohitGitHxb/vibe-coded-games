import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Electricity material - Electric lightning energy
 */
export class Electricity implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      roughness: 0.0,
      metalness: 0.0,
      transparent: true,
      opacity: 0.6,
      emissive: 0x00ffff,
      emissiveIntensity: 1.0,
    });
  }
}
