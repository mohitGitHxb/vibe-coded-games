/**
 * Physics Constants - Predefined values and presets for physics simulation
 */

import * as CANNON from "cannon-es";
import type {
  PhysicsMaterialOptions,
  PhysicsMaterialType,
  PhysicsBodyPreset,
  PhysicsWorldOptions,
  Vector3Like,
} from "../types/PhysicsTypes.js";

// === PHYSICS WORLD CONSTANTS ===
export const PHYSICS_WORLD_DEFAULTS: Required<PhysicsWorldOptions> = {
  gravity: { x: 0, y: -9.82, z: 0 },
  broadphase: "naive",
  solver: "gs",
  iterations: 10,
  tolerance: 1e-4,
  allowSleep: true,
  defaultContactMaterial: {
    friction: 0.4,
    restitution: 0.3,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e8,
    frictionEquationRelaxation: 3,
  },
  quatNormalizeFast: false,
  quatNormalizeSkip: 0,
};

// === GRAVITY PRESETS ===
export const GRAVITY_PRESETS: Record<string, Vector3Like> = {
  earth: { x: 0, y: -9.82, z: 0 },
  moon: { x: 0, y: -1.62, z: 0 },
  mars: { x: 0, y: -3.71, z: 0 },
  jupiter: { x: 0, y: -24.79, z: 0 },
  zero: { x: 0, y: 0, z: 0 },
  custom_low: { x: 0, y: -2.0, z: 0 },
  custom_high: { x: 0, y: -20.0, z: 0 },
};

// === PHYSICS MATERIALS ===
export const PHYSICS_MATERIALS: Record<
  PhysicsMaterialType,
  PhysicsMaterialOptions
> = {
  default: {
    friction: 0.4,
    restitution: 0.3,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e8,
    frictionEquationRelaxation: 3,
  },
  ice: {
    friction: 0.05,
    restitution: 0.1,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e7,
    frictionEquationRelaxation: 5,
  },
  rubber: {
    friction: 1.2,
    restitution: 0.8,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e8,
    frictionEquationRelaxation: 2,
  },
  wood: {
    friction: 0.6,
    restitution: 0.4,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
    frictionEquationStiffness: 1e8,
    frictionEquationRelaxation: 3,
  },
  metal: {
    friction: 0.3,
    restitution: 0.2,
    contactEquationStiffness: 1e9,
    contactEquationRelaxation: 2,
    frictionEquationStiffness: 1e9,
    frictionEquationRelaxation: 2,
  },
  stone: {
    friction: 0.8,
    restitution: 0.1,
    contactEquationStiffness: 1e9,
    contactEquationRelaxation: 2,
    frictionEquationStiffness: 1e8,
    frictionEquationRelaxation: 4,
  },
  mud: {
    friction: 0.9,
    restitution: 0.05,
    contactEquationStiffness: 1e7,
    contactEquationRelaxation: 5,
    frictionEquationStiffness: 1e7,
    frictionEquationRelaxation: 8,
  },
  fabric: {
    friction: 0.7,
    restitution: 0.6,
    contactEquationStiffness: 1e7,
    contactEquationRelaxation: 4,
    frictionEquationStiffness: 1e7,
    frictionEquationRelaxation: 4,
  },
};

// === PHYSICS BODY PRESETS ===
export const PHYSICS_BODY_PRESETS: PhysicsBodyPreset[] = [
  {
    name: "Static Ground",
    type: "static-ground",
    description: "Immovable ground surface with stone-like properties",
    defaultOptions: {
      mass: 0,
      type: CANNON.Body.STATIC,
      position: { x: 0, y: 0, z: 0 },
      fixedRotation: true,
      allowSleep: false,
    },
    recommendedMaterial: "stone",
    shapeType: "box",
  },
  {
    name: "Dynamic Ball",
    type: "dynamic-ball",
    description: "Bouncy ball with rubber-like properties",
    defaultOptions: {
      mass: 1,
      type: CANNON.Body.DYNAMIC,
      allowSleep: true,
      sleepSpeedLimit: 0.1,
      sleepTimeLimit: 1,
    },
    recommendedMaterial: "rubber",
    shapeType: "sphere",
  },
  {
    name: "Dynamic Box",
    type: "dynamic-box",
    description: "Wooden crate with realistic physics",
    defaultOptions: {
      mass: 5,
      type: CANNON.Body.DYNAMIC,
      allowSleep: true,
      sleepSpeedLimit: 0.1,
      sleepTimeLimit: 1,
    },
    recommendedMaterial: "wood",
    shapeType: "box",
  },
  {
    name: "Kinematic Platform",
    type: "kinematic-platform",
    description: "Moving platform controlled by code",
    defaultOptions: {
      mass: 0,
      type: CANNON.Body.KINEMATIC,
      fixedRotation: true,
      allowSleep: false,
    },
    recommendedMaterial: "metal",
    shapeType: "box",
  },
  {
    name: "Trigger Zone",
    type: "trigger-zone",
    description: "Invisible zone that detects other objects",
    defaultOptions: {
      mass: 0,
      type: CANNON.Body.STATIC,
      collisionFilterGroup: 2,
      collisionFilterMask: 1,
    },
    recommendedMaterial: "default",
    shapeType: "box",
  },
  {
    name: "Character Controller",
    type: "character-controller",
    description: "Player character with controlled movement",
    defaultOptions: {
      mass: 80,
      type: CANNON.Body.DYNAMIC,
      fixedRotation: true,
      allowSleep: false,
      sleepSpeedLimit: 0,
    },
    recommendedMaterial: "fabric",
    shapeType: "cylinder",
  },
];

// === SIMULATION CONSTANTS ===
export const SIMULATION_DEFAULTS = {
  TIME_STEP: 1 / 60,
  MAX_SUB_STEPS: 3,
  FIXED_TIME_STEP: 1 / 60,
  PAUSED: false,
  DEBUG: false,
};

// === COLLISION GROUPS ===
export const COLLISION_GROUPS = {
  DEFAULT: 1,
  STATIC: 2,
  DYNAMIC: 4,
  KINEMATIC: 8,
  TRIGGER: 16,
  CHARACTER: 32,
  DEBRIS: 64,
  PROJECTILE: 128,
} as const;

// === FORCE PRESETS ===
export const FORCE_PRESETS = {
  WEAK_PUSH: { x: 0, y: 0, z: -50 },
  STRONG_PUSH: { x: 0, y: 0, z: -200 },
  JUMP_IMPULSE: { x: 0, y: 300, z: 0 },
  EXPLOSION_FORCE: { x: 0, y: 500, z: 0 },
  WIND_FORCE: { x: 10, y: 0, z: 0 },
  MAGNETIC_PULL: { x: 0, y: 0, z: 100 },
} as const;

// === CONSTRAINT DEFAULTS ===
export const CONSTRAINT_DEFAULTS = {
  MAX_FORCE: 1e6,
  DISTANCE: 1,
  COLLIDE_CONNECTED: true,
} as const;

// === DEBUG RENDER CONSTANTS ===
export const DEBUG_RENDER_OPTIONS = {
  WIREFRAME_COLOR: 0x00ff00,
  CONTACT_POINT_COLOR: 0xff0000,
  CONTACT_NORMAL_COLOR: 0x0000ff,
  CONTACT_POINT_SIZE: 0.1,
  CONTACT_NORMAL_LENGTH: 1,
  WIREFRAME_OPACITY: 0.3,
} as const;

// === VEHICLE CONSTANTS ===
export const VEHICLE_DEFAULTS = {
  SUSPENSION_STIFFNESS: 30,
  SUSPENSION_REST_LENGTH: 0.3,
  MAX_SUSPENSION_FORCE: 10000,
  MAX_SUSPENSION_TRAVEL: 0.3,
  DAMPING_RELAXATION: 2.3,
  DAMPING_COMPRESSION: 4.4,
  FRICTION_SLIP: 10.5,
  ROLL_INFLUENCE: 0.01,
  CUSTOM_SLIDING_ROTATIONAL_SPEED: -30,
} as const;

// === PHYSICS PERFORMANCE CONSTANTS ===
export const PERFORMANCE_SETTINGS = {
  // Broadphase settings
  NAIVE_MAX_BODIES: 100,
  SAP_MAX_BODIES: 1000,
  GRID_MAX_BODIES: 10000,

  // Solver settings
  LOW_QUALITY_ITERATIONS: 5,
  MEDIUM_QUALITY_ITERATIONS: 10,
  HIGH_QUALITY_ITERATIONS: 20,

  // Sleep settings
  AGGRESSIVE_SLEEP_SPEED_LIMIT: 0.5,
  NORMAL_SLEEP_SPEED_LIMIT: 0.1,
  CONSERVATIVE_SLEEP_SPEED_LIMIT: 0.01,

  AGGRESSIVE_SLEEP_TIME_LIMIT: 0.5,
  NORMAL_SLEEP_TIME_LIMIT: 1.0,
  CONSERVATIVE_SLEEP_TIME_LIMIT: 2.0,
} as const;

// === HELPER FUNCTIONS ===
export function getPresetByType(
  presetType: string
): PhysicsBodyPreset | undefined {
  return PHYSICS_BODY_PRESETS.find((preset) => preset.type === presetType);
}

export function getMaterialByType(
  materialType: PhysicsMaterialType
): PhysicsMaterialOptions {
  return PHYSICS_MATERIALS[materialType];
}

export function getGravityPreset(preset: string): Vector3Like {
  return GRAVITY_PRESETS[preset] || GRAVITY_PRESETS.earth;
}
