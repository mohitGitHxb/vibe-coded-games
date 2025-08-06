import * as THREE from "three";
import type { IMaterial } from "../types/MaterialTypes.js";

/**
 * Sci-Fi Panel material - Futuristic control panel
 */
export class SciFiPanel implements IMaterial {
  create(): THREE.Material {
    return new THREE.MeshStandardMaterial({
      color: 0x6a9bd1,
      roughness: 0.3,
      metalness: 0.7,
      emissive: 0x001122,
      emissiveIntensity: 0.1,
    });
  }
}
