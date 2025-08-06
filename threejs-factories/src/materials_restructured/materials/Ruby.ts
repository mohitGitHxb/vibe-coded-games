import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Ruby material - Red precious gemstone
 */
export class Ruby implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xcc0000,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.6,
    });
  }
}
