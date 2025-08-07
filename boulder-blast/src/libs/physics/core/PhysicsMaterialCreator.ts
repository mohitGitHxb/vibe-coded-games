/**
 * Physics Material Creator - Creates CANNON.js materials with predefined properties
 */

import * as CANNON from "cannon-es";
import type {
  PhysicsMaterialOptions,
  PhysicsMaterialType,
} from "../types/PhysicsTypes.js";
import { PHYSICS_MATERIALS } from "../constants/PhysicsConstants.js";

export class PhysicsMaterialCreator {
  private static materialCache = new Map<string, CANNON.Material>();

  /**
   * Create a physics material by type
   */
  static createMaterial(
    materialType: PhysicsMaterialType,
    customOptions?: Partial<PhysicsMaterialOptions>
  ): CANNON.Material {
    const cacheKey = `${materialType}-${JSON.stringify(customOptions || {})}`;

    if (this.materialCache.has(cacheKey)) {
      return this.materialCache.get(cacheKey)!;
    }

    const baseOptions = PHYSICS_MATERIALS[materialType];
    const finalOptions = { ...baseOptions, ...customOptions };

    const material = new CANNON.Material(`material-${materialType}`);

    // Apply basic properties (friction and restitution are on Material)
    if (finalOptions.friction !== undefined) {
      material.friction = finalOptions.friction;
    }
    if (finalOptions.restitution !== undefined) {
      material.restitution = finalOptions.restitution;
    }

    // Store additional properties for use in ContactMaterial creation
    (material as any).contactEquationStiffness =
      finalOptions.contactEquationStiffness;
    (material as any).contactEquationRelaxation =
      finalOptions.contactEquationRelaxation;
    (material as any).frictionEquationStiffness =
      finalOptions.frictionEquationStiffness;
    (material as any).frictionEquationRelaxation =
      finalOptions.frictionEquationRelaxation;

    this.materialCache.set(cacheKey, material);
    return material;
  }

  /**
   * Create a custom material with specific options
   */
  static createCustomMaterial(
    name: string,
    options: PhysicsMaterialOptions
  ): CANNON.Material {
    const material = new CANNON.Material(name);

    // Apply basic properties
    if (options.friction !== undefined) {
      material.friction = options.friction;
    }
    if (options.restitution !== undefined) {
      material.restitution = options.restitution;
    }

    // Store additional properties for use in ContactMaterial creation
    if (options.contactEquationStiffness !== undefined) {
      (material as any).contactEquationStiffness =
        options.contactEquationStiffness;
    }
    if (options.contactEquationRelaxation !== undefined) {
      (material as any).contactEquationRelaxation =
        options.contactEquationRelaxation;
    }
    if (options.frictionEquationStiffness !== undefined) {
      (material as any).frictionEquationStiffness =
        options.frictionEquationStiffness;
    }
    if (options.frictionEquationRelaxation !== undefined) {
      (material as any).frictionEquationRelaxation =
        options.frictionEquationRelaxation;
    }

    return material;
  }

  /**
   * Create contact material between two materials
   */
  static createContactMaterial(
    materialA: CANNON.Material,
    materialB: CANNON.Material,
    options?: Partial<PhysicsMaterialOptions>
  ): CANNON.ContactMaterial {
    const contactMaterial = new CANNON.ContactMaterial(materialA, materialB, {
      friction: options?.friction,
      restitution: options?.restitution,
      contactEquationStiffness: options?.contactEquationStiffness,
      contactEquationRelaxation: options?.contactEquationRelaxation,
      frictionEquationStiffness: options?.frictionEquationStiffness,
      frictionEquationRelaxation: options?.frictionEquationRelaxation,
    });

    return contactMaterial;
  }

  /**
   * Get all predefined material types
   */
  static getAvailableMaterialTypes(): PhysicsMaterialType[] {
    return Object.keys(PHYSICS_MATERIALS) as PhysicsMaterialType[];
  }

  /**
   * Get material properties by type
   */
  static getMaterialProperties(
    materialType: PhysicsMaterialType
  ): PhysicsMaterialOptions {
    return { ...PHYSICS_MATERIALS[materialType] };
  }

  /**
   * Clear the material cache
   */
  static clearCache(): void {
    this.materialCache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.materialCache.size,
      keys: Array.from(this.materialCache.keys()),
    };
  }

  /**
   * Create a set of commonly used contact materials
   */
  static createCommonContactMaterials(): CANNON.ContactMaterial[] {
    const materials = {
      default: this.createMaterial("default"),
      ice: this.createMaterial("ice"),
      rubber: this.createMaterial("rubber"),
      wood: this.createMaterial("wood"),
      metal: this.createMaterial("metal"),
      stone: this.createMaterial("stone"),
    };

    const contactMaterials: CANNON.ContactMaterial[] = [];

    // Ice interactions (very slippery)
    contactMaterials.push(
      this.createContactMaterial(materials.ice, materials.default, {
        friction: 0.02,
        restitution: 0.1,
      })
    );

    // Rubber interactions (high friction, bouncy)
    contactMaterials.push(
      this.createContactMaterial(materials.rubber, materials.default, {
        friction: 1.5,
        restitution: 0.9,
      })
    );

    // Metal on metal (low friction, low bounce)
    contactMaterials.push(
      this.createContactMaterial(materials.metal, materials.metal, {
        friction: 0.2,
        restitution: 0.1,
      })
    );

    // Wood on stone (medium friction, low bounce)
    contactMaterials.push(
      this.createContactMaterial(materials.wood, materials.stone, {
        friction: 0.7,
        restitution: 0.3,
      })
    );

    return contactMaterials;
  }

  /**
   * Create a bouncy material preset
   */
  static createBouncyMaterial(bounciness: number = 0.9): CANNON.Material {
    return this.createCustomMaterial("bouncy", {
      friction: 0.4,
      restitution: Math.max(0, Math.min(1, bounciness)),
      contactEquationStiffness: 1e8,
      contactEquationRelaxation: 3,
    });
  }

  /**
   * Create a slippery material preset
   */
  static createSlipperyMaterial(slipperiness: number = 0.95): CANNON.Material {
    const friction = 1 - Math.max(0, Math.min(1, slipperiness));
    return this.createCustomMaterial("slippery", {
      friction: friction,
      restitution: 0.1,
      frictionEquationStiffness: 1e7,
      frictionEquationRelaxation: 5,
    });
  }

  /**
   * Create a sticky material preset
   */
  static createStickyMaterial(stickiness: number = 0.9): CANNON.Material {
    const friction = 0.4 + stickiness * 1.6; // Range 0.4 to 2.0
    return this.createCustomMaterial("sticky", {
      friction: Math.max(0.4, Math.min(2.0, friction)),
      restitution: 0.1,
      contactEquationStiffness: 1e9,
      contactEquationRelaxation: 2,
    });
  }
}
