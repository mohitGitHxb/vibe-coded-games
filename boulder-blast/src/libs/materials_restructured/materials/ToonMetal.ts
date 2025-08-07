import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Toon Metal material - Stylized cartoon metal
 */
export class ToonMetal implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.8,
      metalness: 0.2,
    });
  }
}
