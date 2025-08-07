import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * PlasmaField material - Energy field with bright glow
 */
export class PlasmaField implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      roughness: 0.0,
      metalness: 0.0,
      transparent: true,
      opacity: 0.4,
      emissive: 0x00ffff,
      emissiveIntensity: 0.8,
    });
  }
}
