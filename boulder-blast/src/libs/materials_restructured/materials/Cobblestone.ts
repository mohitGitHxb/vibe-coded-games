import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Cobblestone material - Old stone street surface
 */
export class Cobblestone implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x888888,
      roughness: 0.8,
      metalness: 0.0,
    });
  }
}
