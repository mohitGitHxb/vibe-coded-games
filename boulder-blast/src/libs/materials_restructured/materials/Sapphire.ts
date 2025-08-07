import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Sapphire material - Blue precious gemstone
 */
export class Sapphire implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x0066cc,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.6,
    });
  }
}
