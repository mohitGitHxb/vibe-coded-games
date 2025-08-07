import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Gold material - Precious shiny metal
 */
export class Gold implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.1,
      metalness: 1.0,
    });
  }
}
