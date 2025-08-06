import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Slime material - Viscous translucent goo
 */
export class Slime implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x88ff44,
      roughness: 0.2,
      metalness: 0.0,
      transparent: true,
      opacity: 0.7,
    });
  }
}
