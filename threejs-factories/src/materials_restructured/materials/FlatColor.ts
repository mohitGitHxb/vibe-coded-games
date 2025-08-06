import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Flat Color material - Simple solid color
 */
export class FlatColor implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshBasicMaterial({
      color: 0x44aaff,
    });
  }
}
