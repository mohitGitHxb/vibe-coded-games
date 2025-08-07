import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Emerald material - Beautiful green gemstone
 */
export class Emerald implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x00cc44,
      roughness: 0.1,
      metalness: 0.0,
      transparent: true,
      opacity: 0.6,
      envMapIntensity: 1.5,
    });
  }
}
