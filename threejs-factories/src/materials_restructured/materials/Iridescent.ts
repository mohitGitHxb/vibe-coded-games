import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Iridescent material - Color-shifting rainbow effect
 */
export class Iridescent implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.0,
      metalness: 0.5,
    });
  }
}
