/**
 * Physics Factory - Main factory for creating and managing physics simulations
 */

import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PhysicsShapeCreator } from "../core/PhysicsShapeCreator.js";
import { PhysicsMaterialCreator } from "../core/PhysicsMaterialCreator.js";
import { PhysicsUtils } from "../utils/PhysicsUtils.js";
import {
  PHYSICS_WORLD_DEFAULTS,
  PHYSICS_BODY_PRESETS,
  GRAVITY_PRESETS,
  COLLISION_GROUPS,
  SIMULATION_DEFAULTS,
} from "../constants/PhysicsConstants.js";
import type {
  PhysicsFactoryOptions,
  PhysicsWorldOptions,
  PhysicsObject,
  PhysicsBodyOptions,
  PhysicsShapeType,
  PhysicsShapeOptions,
  PhysicsMaterialType,
  RaycastOptions,
  RaycastResult,
  CollisionCallback,
  PhysicsSimulationOptions,
  TriggerZoneOptions,
  Vector3Like,
  PhysicsBodyPresetType,
} from "../types/PhysicsTypes.js";

export class PhysicsFactory {
  private world: CANNON.World;
  private scene?: THREE.Scene;
  private physicsObjects = new Map<string, PhysicsObject>();
  private constraints = new Map<string, CANNON.Constraint>();
  private triggerZones = new Map<
    string,
    { body: CANNON.Body; options: TriggerZoneOptions }
  >();
  private collisionCallbacks = new Map<CANNON.Body, CollisionCallback[]>();

  // Debug renderer
  private debugRenderer?: any; // CannonDebugRenderer type
  private enableDebugRenderer: boolean;

  // Simulation settings
  private timeStep: number;
  private maxSubSteps: number;
  private paused: boolean;
  private lastTime: number = 0;

  constructor(options: PhysicsFactoryOptions = {}) {
    // Initialize physics world
    this.world = options.world || this.createWorld();
    this.scene = options.scene;
    this.enableDebugRenderer = options.enableDebugRenderer || false;
    this.timeStep = options.timeStep || SIMULATION_DEFAULTS.TIME_STEP;
    this.maxSubSteps = SIMULATION_DEFAULTS.MAX_SUB_STEPS;
    this.paused = SIMULATION_DEFAULTS.PAUSED;

    // Setup collision detection
    this.setupCollisionDetection();

    // Initialize debug renderer if requested
    if (this.enableDebugRenderer && this.scene) {
      this.initializeDebugRenderer();
    }
  }

  /**
   * Create a new physics world with default settings
   */
  private createWorld(options: PhysicsWorldOptions = {}): CANNON.World {
    const worldOptions = { ...PHYSICS_WORLD_DEFAULTS, ...options };
    const world = new CANNON.World();

    // Set gravity
    world.gravity.set(
      worldOptions.gravity.x,
      worldOptions.gravity.y,
      worldOptions.gravity.z
    );

    // Set broadphase
    switch (worldOptions.broadphase) {
      case "sap":
        world.broadphase = new CANNON.SAPBroadphase(world);
        break;
      case "grid":
        world.broadphase = new CANNON.GridBroadphase();
        break;
      default:
        world.broadphase = new CANNON.NaiveBroadphase();
    }

    // Set solver (casting as any due to CANNON type limitations)
    (world.solver as any).iterations = worldOptions.iterations;
    (world.solver as any).tolerance = worldOptions.tolerance;

    // Set sleep settings
    world.allowSleep = worldOptions.allowSleep;

    // Add default contact material
    const defaultContactMaterial = new CANNON.ContactMaterial(
      new CANNON.Material("default"),
      new CANNON.Material("default"),
      worldOptions.defaultContactMaterial
    );
    world.addContactMaterial(defaultContactMaterial);

    return world;
  }

  /**
   * Setup collision detection and callbacks
   */
  private setupCollisionDetection(): void {
    this.world.addEventListener("beginContact", (event: any) => {
      const { bodyA, bodyB, contact } = event;

      // Trigger callbacks for both bodies
      this.triggerCollisionCallbacks(bodyA, bodyB, contact);
      this.triggerCollisionCallbacks(bodyB, bodyA, contact);

      // Handle trigger zones
      this.handleTriggerZones(bodyA, bodyB, "enter");
    });

    this.world.addEventListener("endContact", (event: any) => {
      const { bodyA, bodyB } = event;
      this.handleTriggerZones(bodyA, bodyB, "exit");
    });
  }

  /**
   * Initialize debug renderer
   */
  private initializeDebugRenderer(): void {
    try {
      // Note: This would require cannon-es-debugger package
      // For now, we'll create a simple wireframe debug system
      console.log("Debug renderer would be initialized here");
    } catch (error) {
      console.warn("Debug renderer not available:", error);
    }
  }

  /**
   * Create a physics body with shape and material
   */
  createPhysicsBody(
    id: string,
    mesh: THREE.Object3D,
    options: {
      shapeType?: PhysicsShapeType;
      shapeOptions?: PhysicsShapeOptions;
      materialType?: PhysicsMaterialType;
      bodyOptions?: PhysicsBodyOptions;
      autoSync?: boolean;
    } = {}
  ): PhysicsObject {
    const {
      shapeType = "box",
      shapeOptions,
      materialType = "default",
      bodyOptions = {},
      autoSync = true,
    } = options;

    // Create shape
    let shape: CANNON.Shape;
    if (shapeOptions) {
      shape = PhysicsShapeCreator.createShape(shapeType, shapeOptions);
    } else {
      // Auto-generate shape from mesh geometry
      if (mesh instanceof THREE.Mesh && mesh.geometry) {
        shape = PhysicsShapeCreator.createShapeFromGeometry(mesh.geometry);
      } else {
        // Default box shape
        shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1));
      }
    }

    // Create material
    const material = PhysicsMaterialCreator.createMaterial(materialType);

    // Create body
    const body = new CANNON.Body({
      mass: bodyOptions.mass || 1,
      type: bodyOptions.type || CANNON.Body.DYNAMIC,
      material,
      position: bodyOptions.position
        ? new CANNON.Vec3(
            bodyOptions.position.x,
            bodyOptions.position.y,
            bodyOptions.position.z
          )
        : undefined,
      velocity: bodyOptions.velocity
        ? new CANNON.Vec3(
            bodyOptions.velocity.x,
            bodyOptions.velocity.y,
            bodyOptions.velocity.z
          )
        : undefined,
      angularVelocity: bodyOptions.angularVelocity
        ? new CANNON.Vec3(
            bodyOptions.angularVelocity.x,
            bodyOptions.angularVelocity.y,
            bodyOptions.angularVelocity.z
          )
        : undefined,
      fixedRotation: bodyOptions.fixedRotation,
      allowSleep: bodyOptions.allowSleep,
      sleepSpeedLimit: bodyOptions.sleepSpeedLimit,
      sleepTimeLimit: bodyOptions.sleepTimeLimit,
      collisionFilterGroup: bodyOptions.collisionFilterGroup,
      collisionFilterMask: bodyOptions.collisionFilterMask,
    });

    // Add shape to body
    body.addShape(shape);

    // Set initial position and rotation from mesh
    body.position.copy(mesh.position as any);
    body.quaternion.copy(mesh.quaternion as any);

    // Add body to world
    this.world.addBody(body);

    // Create physics object
    const physicsObject: PhysicsObject = {
      id,
      threeMesh: mesh,
      cannonBody: body,
      autoSync,
      userData: {},
    };

    // Store physics object
    this.physicsObjects.set(id, physicsObject);

    return physicsObject;
  }

  /**
   * Create a physics body from preset
   */
  createBodyFromPreset(
    id: string,
    mesh: THREE.Object3D,
    presetType: PhysicsBodyPresetType,
    customOptions?: Partial<PhysicsBodyOptions>
  ): PhysicsObject {
    const preset = PHYSICS_BODY_PRESETS.find((p) => p.type === presetType);
    if (!preset) {
      throw new Error(`Unknown preset type: ${presetType}`);
    }

    const bodyOptions = { ...preset.defaultOptions, ...customOptions };

    return this.createPhysicsBody(id, mesh, {
      shapeType: preset.shapeType,
      materialType: preset.recommendedMaterial,
      bodyOptions,
    });
  }

  /**
   * Create a trigger zone
   */
  createTriggerZone(
    id: string,
    position: Vector3Like,
    size: Vector3Like,
    options: Omit<TriggerZoneOptions, "position"> = {}
  ): PhysicsObject {
    const shape = new CANNON.Box(
      new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
    );
    const body = new CANNON.Body({
      mass: 0,
      type: CANNON.Body.STATIC,
      isTrigger: true,
      collisionFilterGroup: COLLISION_GROUPS.TRIGGER,
      fixedRotation: options.fixedRotation,
      allowSleep: options.allowSleep,
      sleepSpeedLimit: options.sleepSpeedLimit,
      sleepTimeLimit: options.sleepTimeLimit,
      collisionFilterMask: options.collisionFilterMask,
      material: options.material,
    });

    body.addShape(shape);
    body.position.set(position.x, position.y, position.z);
    this.world.addBody(body);

    // Store trigger zone
    this.triggerZones.set(id, { body, options });

    // Create invisible mesh for the trigger zone
    const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position as any);

    const physicsObject: PhysicsObject = {
      id,
      threeMesh: mesh,
      cannonBody: body,
      autoSync: false,
      userData: { isTrigger: true },
    };

    this.physicsObjects.set(id, physicsObject);
    return physicsObject;
  }

  /**
   * Apply force to a physics body
   */
  applyForce(id: string, force: Vector3Like, worldPoint?: Vector3Like): void {
    const physicsObject = this.physicsObjects.get(id);
    if (!physicsObject) return;

    const forceVec = new CANNON.Vec3(force.x, force.y, force.z);
    const pointVec = worldPoint
      ? new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z)
      : undefined;

    if (pointVec) {
      physicsObject.cannonBody.applyForce(forceVec, pointVec);
    } else {
      physicsObject.cannonBody.applyForce(forceVec);
    }
  }

  /**
   * Apply impulse to a physics body
   */
  applyImpulse(
    id: string,
    impulse: Vector3Like,
    worldPoint?: Vector3Like
  ): void {
    const physicsObject = this.physicsObjects.get(id);
    if (!physicsObject) return;

    const impulseVec = new CANNON.Vec3(impulse.x, impulse.y, impulse.z);
    const pointVec = worldPoint
      ? new CANNON.Vec3(worldPoint.x, worldPoint.y, worldPoint.z)
      : undefined;

    if (pointVec) {
      physicsObject.cannonBody.applyImpulse(impulseVec, pointVec);
    } else {
      physicsObject.cannonBody.applyImpulse(impulseVec);
    }
  }

  /**
   * Set velocity of a physics body
   */
  setVelocity(id: string, velocity: Vector3Like): void {
    const physicsObject = this.physicsObjects.get(id);
    if (!physicsObject) return;

    physicsObject.cannonBody.velocity.set(velocity.x, velocity.y, velocity.z);
  }

  /**
   * Set angular velocity of a physics body
   */
  setAngularVelocity(id: string, angularVelocity: Vector3Like): void {
    const physicsObject = this.physicsObjects.get(id);
    if (!physicsObject) return;

    physicsObject.cannonBody.angularVelocity.set(
      angularVelocity.x,
      angularVelocity.y,
      angularVelocity.z
    );
  }

  /**
   * Perform raycast
   */
  raycast(options: RaycastOptions): RaycastResult {
    const from = new CANNON.Vec3(
      options.from.x,
      options.from.y,
      options.from.z
    );
    const to = new CANNON.Vec3(options.to.x, options.to.y, options.to.z);

    const raycastResult = new CANNON.RaycastResult();
    const hasHit = this.world.raycastClosest(
      from,
      to,
      {
        collisionFilterMask: options.collisionFilterMask,
        skipBackfaces: options.skipBackfaces,
        checkCollisionResponse: options.checkCollisionResponse,
      },
      raycastResult
    );

    return {
      hasHit,
      body: raycastResult.body || undefined,
      shape: raycastResult.shape || undefined,
      rayFromWorld: raycastResult.rayFromWorld,
      rayToWorld: raycastResult.rayToWorld,
      hitNormalWorld: raycastResult.hitNormalWorld,
      hitPointWorld: raycastResult.hitPointWorld,
      distance: raycastResult.distance,
    };
  }

  /**
   * Add collision callback for a body
   */
  addCollisionCallback(id: string, callback: CollisionCallback): void {
    const physicsObject = this.physicsObjects.get(id);
    if (!physicsObject) return;

    const body = physicsObject.cannonBody;
    if (!this.collisionCallbacks.has(body)) {
      this.collisionCallbacks.set(body, []);
    }
    this.collisionCallbacks.get(body)!.push(callback);
  }

  /**
   * Remove collision callback for a body
   */
  removeCollisionCallback(id: string, callback: CollisionCallback): void {
    const physicsObject = this.physicsObjects.get(id);
    if (!physicsObject) return;

    const body = physicsObject.cannonBody;
    const callbacks = this.collisionCallbacks.get(body);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Step the physics simulation
   */
  step(deltaTime?: number): void {
    if (this.paused) return;

    const currentTime = performance.now();
    const dt = deltaTime || (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    // Step the physics world
    this.world.step(this.timeStep, dt, this.maxSubSteps);

    // Sync Three.js objects with physics bodies
    this.physicsObjects.forEach((physicsObject) => {
      if (physicsObject.autoSync) {
        PhysicsUtils.syncThreeWithCannon(
          physicsObject.threeMesh,
          physicsObject.cannonBody
        );
      }
    });

    // Update debug renderer
    if (this.debugRenderer) {
      this.debugRenderer.update();
    }
  }

  /**
   * Set gravity
   */
  setGravity(gravity: Vector3Like): void {
    this.world.gravity.set(gravity.x, gravity.y, gravity.z);
  }

  /**
   * Set gravity from preset
   */
  setGravityPreset(preset: string): void {
    const gravity = GRAVITY_PRESETS[preset];
    if (gravity) {
      this.setGravity(gravity);
    }
  }

  /**
   * Pause/resume simulation
   */
  setPaused(paused: boolean): void {
    this.paused = paused;
  }

  /**
   * Get physics object by ID
   */
  getPhysicsObject(id: string): PhysicsObject | undefined {
    return this.physicsObjects.get(id);
  }

  /**
   * Remove physics object
   */
  removePhysicsObject(id: string): boolean {
    const physicsObject = this.physicsObjects.get(id);
    if (!physicsObject) return false;

    // Remove from world
    this.world.removeBody(physicsObject.cannonBody);

    // Remove from maps
    this.physicsObjects.delete(id);
    this.collisionCallbacks.delete(physicsObject.cannonBody);

    // Remove from trigger zones if it's a trigger
    this.triggerZones.delete(id);

    return true;
  }

  /**
   * Get all physics objects
   */
  getAllPhysicsObjects(): PhysicsObject[] {
    return Array.from(this.physicsObjects.values());
  }

  /**
   * Get physics world
   */
  getWorld(): CANNON.World {
    return this.world;
  }

  /**
   * Configure simulation settings
   */
  configureSimulation(options: PhysicsSimulationOptions): void {
    if (options.timeStep !== undefined) {
      this.timeStep = options.timeStep;
    }
    if (options.maxSubSteps !== undefined) {
      this.maxSubSteps = options.maxSubSteps;
    }
    // Note: fixedTimeStep removed from class as it wasn't being used
    if (options.paused !== undefined) {
      this.paused = options.paused;
    }
  }

  /**
   * Trigger collision callbacks
   */
  private triggerCollisionCallbacks(
    bodyA: CANNON.Body,
    bodyB: CANNON.Body,
    contact: CANNON.ContactEquation
  ): void {
    const callbacks = this.collisionCallbacks.get(bodyA);
    if (callbacks) {
      const event = {
        bodyA,
        bodyB,
        contact,
        target: bodyA,
        type: "collision" as const,
      };
      callbacks.forEach((callback) => callback(event));
    }
  }

  /**
   * Handle trigger zone events
   */
  private handleTriggerZones(
    bodyA: CANNON.Body,
    bodyB: CANNON.Body,
    eventType: "enter" | "exit"
  ): void {
    // Check if either body is a trigger zone
    for (const [_id, { body: triggerBody, options }] of this.triggerZones) {
      if (triggerBody === bodyA || triggerBody === bodyB) {
        const otherBody = triggerBody === bodyA ? bodyB : bodyA;

        // Apply filter if provided
        if (options.filterBodies && !options.filterBodies(otherBody)) {
          continue;
        }

        // Trigger appropriate callback
        if (eventType === "enter" && options.onEnter) {
          options.onEnter(otherBody);
        } else if (eventType === "exit" && options.onExit) {
          options.onExit(otherBody);
        }
      }
    }
  }

  /**
   * Clean up and dispose of resources
   */
  dispose(): void {
    // Remove all bodies from world
    this.physicsObjects.forEach((physicsObject) => {
      this.world.removeBody(physicsObject.cannonBody);
    });

    // Remove all constraints
    this.constraints.forEach((constraint) => {
      this.world.removeConstraint(constraint);
    });

    // Clear maps
    this.physicsObjects.clear();
    this.constraints.clear();
    this.triggerZones.clear();
    this.collisionCallbacks.clear();

    // Clear materials cache
    PhysicsMaterialCreator.clearCache();

    console.log("PhysicsFactory disposed successfully");
  }
}
