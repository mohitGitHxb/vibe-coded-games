import * as THREE from "three";
import { GAME_CONFIG } from "../utils/Constants";
import type { Transform, VehiclePhysics, InputState } from "../utils/Types";
import { EnhancedMaterials } from "./EnhancedMaterials";

export class Player {
  public mesh!: THREE.Mesh;
  public transform: Transform;
  public physics: VehiclePhysics;

  private geometry!: THREE.BoxGeometry;
  private material!: THREE.MeshStandardMaterial;
  private originalMaterial!: THREE.MeshStandardMaterial;
  private invincibilityMaterial!: THREE.MeshStandardMaterial;
  // Dynamic road bounds - scaled for 12-unit lanes
  private roadBounds: { left: number; right: number } = {
    left: -10, // Updated for much wider roads
    right: 10,
  };

  constructor() {
    // Initialize transform
    this.transform = {
      position: new THREE.Vector3(0, 0.8, 0), // Higher above ground for larger scale
      rotation: new THREE.Euler(0, 0, 0),
      scale: new THREE.Vector3(1, 1, 1),
    };

    // Initialize physics with auto-acceleration
    this.physics = {
      velocity: new THREE.Vector3(0, 0, 0), // Start stationary
      acceleration: new THREE.Vector3(0, 0, 0),
      maxSpeed: GAME_CONFIG.STARTING_SPEED,
      steeringSpeed: GAME_CONFIG.STEERING_SPEED,
    };

    this.createMesh();
  }

  private createMesh(): void {
    // Create larger player car for 12-unit lanes - doubled from original
    this.geometry = new THREE.BoxGeometry(4.4, 1.8, 9.0); // Much larger car

    // Use EnhancedMaterials for player
    this.originalMaterial = EnhancedMaterials.createPlayerMaterial();
    this.material = this.originalMaterial;
    this.invincibilityMaterial =
      EnhancedMaterials.createInvincibilityMaterial();

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.copy(this.transform.position);
    this.mesh.rotation.copy(this.transform.rotation);
    this.mesh.scale.copy(this.transform.scale);

    // Cast shadow for better visual depth
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    console.log("Player mesh created with EnhancedMaterials: 4.4 x 1.8 x 9.0");
  }

  public update(deltaTime: number, inputState: InputState): void {
    this.handleInput(inputState, deltaTime);
    this.updatePhysics(deltaTime);
    this.updateMesh();
  }

  public setInvincible(isInvincible: boolean): void {
    if (isInvincible) {
      this.mesh.material = this.invincibilityMaterial;
    } else {
      this.mesh.material = this.originalMaterial;
    }
  }

  private handleInput(inputState: InputState, deltaTime: number): void {
    // Reset lateral velocity for immediate response
    this.physics.velocity.x = 0;

    // Handle steering input with IMMEDIATE response (scaled for wider lanes)
    if (inputState.left) {
      this.physics.velocity.x = -this.physics.steeringSpeed;
    }
    if (inputState.right) {
      this.physics.velocity.x = this.physics.steeringSpeed;
    }

    // No damping needed - immediate stop when no input (Road Fighter style)
  }

  private updatePhysics(deltaTime: number): void {
    // AUTO-ACCELERATION: Car always moves forward at current max speed
    this.physics.velocity.z = this.physics.maxSpeed;

    // Update position with immediate steering response
    this.transform.position.x += this.physics.velocity.x * deltaTime;
    this.transform.position.z += this.physics.velocity.z * deltaTime;

    // Keep player within dynamic road bounds (much wider now)
    this.transform.position.x = Math.max(
      this.roadBounds.left,
      Math.min(this.roadBounds.right, this.transform.position.x)
    );

    // Add slight rotation when steering for visual feedback
    this.transform.rotation.y = -this.physics.velocity.x * 0.01; // Reduced for larger scale

    // Add slight banking effect when turning (visual enhancement)
    const bankingAngle = this.physics.velocity.x * 0.015; // Subtle banking
    this.mesh.rotation.z = -bankingAngle;
  }

  private updateMesh(): void {
    this.mesh.position.copy(this.transform.position);
    this.mesh.rotation.copy(this.transform.rotation);
    this.mesh.scale.copy(this.transform.scale);
  }

  public setSpeed(speed: number): void {
    this.physics.maxSpeed = speed;
    console.log(`Player speed updated to: ${Math.round(speed * 3.6)} km/h`);
  }

  public setRoadBounds(bounds: { left: number; right: number }): void {
    this.roadBounds = bounds;
  }

  public getSpeed(): number {
    return this.physics.maxSpeed;
  }

  public getPosition(): THREE.Vector3 {
    return this.transform.position.clone();
  }

  public getBoundingBox(): THREE.Box3 {
    const box = new THREE.Box3();
    box.setFromObject(this.mesh);
    return box;
  }

  public handleCollision(collisionInfo: any): void {
    // Enhanced collision response with screen shake and visual feedback
    const pushBack = collisionInfo.penetrationDepth * 2;
    this.transform.position.add(
      collisionInfo.collisionNormal.multiplyScalar(pushBack)
    );

    // Add slight rotation for impact effect
    this.mesh.rotation.y += (Math.random() - 0.5) * 0.2;

    console.log("Player collision handled with enhanced feedback");
  }

  public dispose(): void {
    if (this.geometry) this.geometry.dispose();
    if (this.material) this.material.dispose();
  }
}
