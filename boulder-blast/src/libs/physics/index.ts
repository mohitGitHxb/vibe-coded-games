/**
 * Physics Factory Module - Complete physics simulation system for Three.js
 *
 * This module provides comprehensive physics capabilities including:
 * - Rigid body dynamics with CANNON.js integration
 * - Collision detection and response
 * - Force and impulse application
 * - Physics materials with realistic properties
 * - Shape creation from Three.js geometries
 * - Raycast and trigger zone systems
 * - Physics world management and simulation
 *
 * @example Basic Usage
 * ```typescript
 * import { PhysicsFactory } from './physics/index.js';
 * import * as THREE from 'three';
 *
 * // Create physics factory
 * const physics = new PhysicsFactory();
 *
 * // Create a mesh and physics body
 * const mesh = new THREE.Mesh(
 *   new THREE.BoxGeometry(2, 2, 2),
 *   new THREE.MeshBasicMaterial()
 * );
 *
 * const physicsObject = physics.createPhysicsBody('box1', mesh, {
 *   materialType: 'wood',
 *   shapeType: 'box'
 * });
 *
 * // Apply forces
 * physics.applyForce('box1', { x: 0, y: 100, z: 0 });
 *
 * // Step simulation
 * function animate() {
 *   physics.step();
 *   requestAnimationFrame(animate);
 * }
 * animate();
 * ```
 *
 * @example Advanced Usage with Presets
 * ```typescript
 * // Create from preset
 * const ball = physics.createBodyFromPreset('ball', ballMesh, 'dynamic-ball');
 *
 * // Create trigger zone
 * const trigger = physics.createTriggerZone('goal', { x: 0, y: 0, z: 10 }, { x: 4, y: 4, z: 1 }, {
 *   onEnter: (body) => console.log('Goal scored!'),
 *   onExit: (body) => console.log('Left goal area')
 * });
 *
 * // Raycast
 * const result = physics.raycast({
 *   from: { x: 0, y: 10, z: 0 },
 *   to: { x: 0, y: -10, z: 0 }
 * });
 * if (result.hasHit) {
 *   console.log('Hit ground at', result.hitPointWorld);
 * }
 * ```
 */

import * as THREE from "three";
import { PhysicsFactory } from "./manager/PhysicsFactory.js";
import type { Vector3Like } from "./types/PhysicsTypes.js";

// === MAIN FACTORY EXPORTS ===
export { PhysicsFactory } from "./manager/PhysicsFactory.js";

// === CORE SYSTEM EXPORTS ===
export { PhysicsShapeCreator } from "./core/PhysicsShapeCreator.js";
export { PhysicsMaterialCreator } from "./core/PhysicsMaterialCreator.js";

// === UTILITY EXPORTS ===
export { PhysicsUtils } from "./utils/PhysicsUtils.js";

// === TYPE EXPORTS ===
export type {
  // Core types
  Vector3Like,
  PhysicsObject,
  PhysicsFactoryOptions,
  PhysicsWorldOptions,
  PhysicsSimulationOptions,

  // Body types
  PhysicsBodyOptions,
  PhysicsBodyPresetType,
  PhysicsBodyPreset,

  // Shape types
  PhysicsShapeType,
  PhysicsShapeOptions,
  BoxShapeOptions,
  SphereShapeOptions,
  CylinderShapeOptions,
  PlaneShapeOptions,
  HeightfieldShapeOptions,
  TrimeshShapeOptions,
  ConvexHullShapeOptions,

  // Material types
  PhysicsMaterialType,
  PhysicsMaterialOptions,

  // Constraint types
  ConstraintType,
  ConstraintOptions,

  // Force types
  ForceApplication,
  ImpulseApplication,

  // Collision types
  CollisionEvent,
  CollisionCallback,

  // Raycast types
  RaycastOptions,
  RaycastResult,

  // Trigger types
  TriggerZoneOptions,

  // Vehicle types (for future expansion)
  VehicleOptions,
  WheelOptions,

  // Event types
  PhysicsEventType,
  PhysicsDebugType,
} from "./types/PhysicsTypes.js";

// === CONSTANT EXPORTS ===
export {
  // World defaults
  PHYSICS_WORLD_DEFAULTS,
  GRAVITY_PRESETS,

  // Materials
  PHYSICS_MATERIALS,

  // Body presets
  PHYSICS_BODY_PRESETS,

  // Simulation
  SIMULATION_DEFAULTS,

  // Collision groups
  COLLISION_GROUPS,

  // Forces
  FORCE_PRESETS,

  // Constraints
  CONSTRAINT_DEFAULTS,

  // Debug rendering
  DEBUG_RENDER_OPTIONS,

  // Vehicle defaults
  VEHICLE_DEFAULTS,

  // Performance settings
  PERFORMANCE_SETTINGS,

  // Helper functions
  getPresetByType,
  getMaterialByType,
  getGravityPreset,
} from "./constants/PhysicsConstants.js";

// === RE-EXPORT CANNON TYPES FOR CONVENIENCE ===
// Users can import CANNON types directly from this module
export type { Body, Shape, Material, World, Constraint } from "cannon-es";

// === PHYSICS PRESETS FOR QUICK ACCESS ===
export const PHYSICS_PRESETS = {
  // Gravity presets
  GRAVITY: {
    EARTH: { x: 0, y: -9.82, z: 0 },
    MOON: { x: 0, y: -1.62, z: 0 },
    MARS: { x: 0, y: -3.71, z: 0 },
    ZERO: { x: 0, y: 0, z: 0 },
  },

  // Common force values
  FORCES: {
    LIGHT_PUSH: { x: 0, y: 0, z: -25 },
    MEDIUM_PUSH: { x: 0, y: 0, z: -100 },
    STRONG_PUSH: { x: 0, y: 0, z: -250 },
    JUMP: { x: 0, y: 200, z: 0 },
    EXPLOSION: { x: 0, y: 300, z: 0 },
  },

  // Common material combinations
  MATERIAL_COMBOS: {
    BOUNCY_BALL: "rubber",
    WOODEN_CRATE: "wood",
    METAL_OBJECT: "metal",
    STONE_WALL: "stone",
    ICE_SURFACE: "ice",
    MUD_GROUND: "mud",
  },

  // Common shapes for quick creation
  SHAPES: {
    CUBE: { type: "box" as const, halfExtents: { x: 1, y: 1, z: 1 } },
    SPHERE: { type: "sphere" as const, radius: 1 },
    GROUND_PLANE: { type: "plane" as const },
    CYLINDER: {
      type: "cylinder" as const,
      radiusTop: 1,
      radiusBottom: 1,
      height: 2,
    },
  },
} as const;

// === PHYSICS FACTORY VERSION ===
export const PHYSICS_VERSION = "1.0.0";

// === MAIN FACTORY CREATION HELPER ===
/**
 * Create a new PhysicsFactory instance with common configurations
 */
export function createPhysicsFactory(options?: {
  scene?: THREE.Scene;
  gravity?: "earth" | "moon" | "mars" | "zero" | Vector3Like;
  enableDebug?: boolean;
  performance?: "low" | "medium" | "high";
}): PhysicsFactory {
  const { scene, enableDebug = false } = options || {};

  // Note: gravity and performance settings would be applied during world creation
  // This is a simplified factory creation helper

  return new PhysicsFactory({
    scene,
    enableDebugRenderer: enableDebug,
    world: undefined, // Let factory create default world with custom settings
  });
}

console.log(
  `🔬 Physics Factory v${PHYSICS_VERSION} - Advanced physics simulation for Three.js`
);
