import * as THREE from "three";
import type { IMaterial } from "./types/MaterialTypes.js";

/**
 * Simple Material Factory
 *
 * Usage:
 * ```typescript
 * import { MaterialFactory, Emerald, Brick, Wood } from './materials_restructured';
 *
 * const factory = new MaterialFactory();
 *
 * const emeraldMaterial = factory.create(new Emerald());
 * const brickMaterial = factory.create(new Brick());
 * const woodMaterial = factory.create(new Wood());
 * ```
 */
export class MaterialFactory {
  /**
   * Create a Three.js material from a material class
   */
  create(material: IMaterial): THREE.Material {
    return material.create();
  }

  /**
   * Create multiple materials at once
   */
  createBatch(materials: IMaterial[]): THREE.Material[] {
    return materials.map((material) => material.create());
  }
}
