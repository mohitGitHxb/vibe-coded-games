/**
 * Physics Types - Comprehensive type definitions for physics simulation
 */

import type * as THREE from "three";
import type * as CANNON from "cannon-es";

// === BASIC PHYSICS TYPES ===
export interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

export interface PhysicsBodyOptions {
  mass?: number;
  material?: CANNON.Material;
  type?: CANNON.BodyType;
  position?: Vector3Like;
  velocity?: Vector3Like;
  angularVelocity?: Vector3Like;
  fixedRotation?: boolean;
  allowSleep?: boolean;
  sleepSpeedLimit?: number;
  sleepTimeLimit?: number;
  collisionFilterGroup?: number;
  collisionFilterMask?: number;
}

// === SHAPE TYPES ===
export type PhysicsShapeType =
  | "box"
  | "sphere"
  | "cylinder"
  | "plane"
  | "heightfield"
  | "trimesh"
  | "convexhull"
  | "compound";

export interface BoxShapeOptions {
  halfExtents: Vector3Like;
}

export interface SphereShapeOptions {
  radius: number;
}

export interface CylinderShapeOptions {
  radiusTop: number;
  radiusBottom: number;
  height: number;
  numSegments?: number;
}

export interface PlaneShapeOptions {
  normal?: Vector3Like;
}

export interface HeightfieldShapeOptions {
  data: number[][];
  minValue?: number;
  maxValue?: number;
  elementSize: number;
}

export interface TrimeshShapeOptions {
  vertices: number[];
  indices: number[];
}

export interface ConvexHullShapeOptions {
  vertices: Vector3Like[];
  faces?: number[][];
}

export type PhysicsShapeOptions =
  | BoxShapeOptions
  | SphereShapeOptions
  | CylinderShapeOptions
  | PlaneShapeOptions
  | HeightfieldShapeOptions
  | TrimeshShapeOptions
  | ConvexHullShapeOptions;

// === MATERIAL TYPES ===
export interface PhysicsMaterialOptions {
  friction?: number;
  restitution?: number;
  contactEquationStiffness?: number;
  contactEquationRelaxation?: number;
  frictionEquationStiffness?: number;
  frictionEquationRelaxation?: number;
}

export type PhysicsMaterialType =
  | "default"
  | "ice"
  | "rubber"
  | "wood"
  | "metal"
  | "stone"
  | "mud"
  | "fabric";

// === CONSTRAINT TYPES ===
export type ConstraintType =
  | "point"
  | "distance"
  | "hinge"
  | "cone-twist"
  | "lock";

export interface ConstraintOptions {
  bodyA: CANNON.Body;
  bodyB: CANNON.Body;
  pivotA?: Vector3Like;
  pivotB?: Vector3Like;
  axisA?: Vector3Like;
  axisB?: Vector3Like;
  distance?: number;
  maxForce?: number;
  collideConnected?: boolean;
}

// === FORCE TYPES ===
export interface ForceApplication {
  force: Vector3Like;
  worldPoint?: Vector3Like;
  localPoint?: Vector3Like;
}

export interface ImpulseApplication {
  impulse: Vector3Like;
  worldPoint?: Vector3Like;
  localPoint?: Vector3Like;
}

// === COLLISION TYPES ===
export interface CollisionEvent {
  bodyA: CANNON.Body;
  bodyB: CANNON.Body;
  contact: CANNON.ContactEquation;
  target: CANNON.Body;
  type: "collision";
}

export interface CollisionCallback {
  (event: CollisionEvent): void;
}

// === PHYSICS BODY PRESET TYPES ===
export type PhysicsBodyPresetType =
  | "static-ground"
  | "dynamic-ball"
  | "dynamic-box"
  | "kinematic-platform"
  | "trigger-zone"
  | "character-controller";

export interface PhysicsBodyPreset {
  name: string;
  type: PhysicsBodyPresetType;
  description: string;
  defaultOptions: PhysicsBodyOptions;
  recommendedMaterial: PhysicsMaterialType;
  shapeType: PhysicsShapeType;
}

// === PHYSICS WORLD TYPES ===
export interface PhysicsWorldOptions {
  gravity?: Vector3Like;
  broadphase?: "naive" | "sap" | "grid";
  solver?: "gs" | "split";
  iterations?: number;
  tolerance?: number;
  allowSleep?: boolean;
  defaultContactMaterial?: PhysicsMaterialOptions;
  quatNormalizeFast?: boolean;
  quatNormalizeSkip?: number;
}

// === PHYSICS FACTORY TYPES ===
export interface PhysicsFactoryOptions {
  world?: CANNON.World;
  scene?: THREE.Scene;
  enableDebugRenderer?: boolean;
  autoSync?: boolean;
  timeStep?: number;
}

// === PHYSICS OBJECT TYPES ===
export interface PhysicsObject {
  id: string;
  threeMesh: THREE.Object3D;
  cannonBody: CANNON.Body;
  autoSync: boolean;
  userData?: Record<string, any>;
}

// === RAY CASTING TYPES ===
export interface RaycastOptions {
  from: Vector3Like;
  to: Vector3Like;
  collisionFilterMask?: number;
  skipBackfaces?: boolean;
  checkCollisionResponse?: boolean;
  mode?: "closest" | "any" | "all";
}

export interface RaycastResult {
  hasHit: boolean;
  body?: CANNON.Body;
  shape?: CANNON.Shape;
  rayFromWorld: CANNON.Vec3;
  rayToWorld: CANNON.Vec3;
  hitNormalWorld: CANNON.Vec3;
  hitPointWorld: CANNON.Vec3;
  distance: number;
}

// === PHYSICS SIMULATION TYPES ===
export interface PhysicsSimulationOptions {
  timeStep?: number;
  maxSubSteps?: number;
  fixedTimeStep?: number;
  paused?: boolean;
  debug?: boolean;
}

// === TRIGGER ZONE TYPES ===
export interface TriggerZoneOptions extends PhysicsBodyOptions {
  onEnter?: (body: CANNON.Body) => void;
  onExit?: (body: CANNON.Body) => void;
  onStay?: (body: CANNON.Body) => void;
  filterBodies?: (body: CANNON.Body) => boolean;
}

// === VEHICLE TYPES ===
export interface VehicleOptions {
  chassisBody: CANNON.Body;
  wheelOptions: WheelOptions[];
}

export interface WheelOptions {
  radius: number;
  directionLocal: Vector3Like;
  suspensionStiffness: number;
  suspensionRestLength: number;
  maxSuspensionForce: number;
  maxSuspensionTravel: number;
  dampingRelaxation: number;
  dampingCompression: number;
  frictionSlip: number;
  rollInfluence: number;
  axleLocal: Vector3Like;
  chassisConnectionPointLocal: Vector3Like;
  isFrontWheel: boolean;
  customSlidingRotationalSpeed?: number;
}

// === EXPORT TYPE UNIONS ===
export type PhysicsEventType = "collision" | "sleep" | "wakeup";

export type PhysicsDebugType = "wireframe" | "bounds" | "contacts" | "all";
