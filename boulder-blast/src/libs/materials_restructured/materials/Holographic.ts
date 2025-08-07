import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Holographic material - Translucent hologram effect
 */
export class Holographic implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x44ffff,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.5,
      emissive: 0x002244,
      emissiveIntensity: 0.3,
    });
  }
}
