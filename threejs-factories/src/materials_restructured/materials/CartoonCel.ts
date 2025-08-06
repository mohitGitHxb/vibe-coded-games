import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Cartoon Cel material - Flat cartoon shading
 */
export class CartoonCel implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshToonMaterial({
      color: 0xff6b6b,
    });
  }
}
