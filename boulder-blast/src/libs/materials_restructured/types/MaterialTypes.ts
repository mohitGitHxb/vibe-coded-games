import * as THREE from "three";

/**
 * Base interface for all materials
 * Simple contract - just return a Three.js material
 */
export interface IMaterial {
  /**
   * Create and return the Three.js material
   */
  create(): THREE.Material;
}

/**
 * Optional configuration for materials
 */
export interface MaterialConfig {
  color?: THREE.ColorRepresentation;
  roughness?: number;
  metalness?: number;
  opacity?: number;
  transparent?: boolean;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
}
