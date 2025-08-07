import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Water material - Transparent blue liquid
 */
export class Water implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x006994,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.8,
      envMapIntensity: 1.0,
    });
  }
}
