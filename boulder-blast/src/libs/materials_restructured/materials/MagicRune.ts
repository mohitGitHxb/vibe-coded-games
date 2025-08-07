import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Magic Rune material - Glowing magical inscription
 */
export class MagicRune implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x6600cc,
      roughness: 0.2,
      metalness: 0.0,
      emissive: 0x6600cc,
      emissiveIntensity: 0.6,
    });
  }
}
