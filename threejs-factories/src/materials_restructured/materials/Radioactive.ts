import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Radioactive material - Glowing radioactive substance
 */
export class Radioactive implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x88ff00,
      roughness: 0.3,
      metalness: 0.0,
      emissive: 0x88ff00,
      emissiveIntensity: 0.4,
    });
  }
}
