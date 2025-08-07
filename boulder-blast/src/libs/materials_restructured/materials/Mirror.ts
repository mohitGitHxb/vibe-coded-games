import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Mirror material - Perfect reflective surface
 */
export class Mirror implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.0,
      metalness: 1.0,
    });
  }
}
