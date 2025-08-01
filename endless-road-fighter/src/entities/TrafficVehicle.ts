import * as THREE from "three";
import { GAME_CONFIG } from "../utils/Constants";
import type { VehicleData, VehicleType } from "../utils/Types";

export class TrafficVehicle {
  public data: VehicleData;
  public mesh!: THREE.Mesh;
  private geometry!: THREE.BoxGeometry;
  private material!: THREE.MeshLambertMaterial;

  constructor(
    id: number,
    type: VehicleType,
    lane: number,
    startZ: number,
    playerSpeed: number
  ) {
    this.data = this.createVehicleData(id, type, lane, startZ, playerSpeed);
    this.createMesh();
    this.data.mesh = this.mesh;
    this.updateBoundingBox();
  }

  private createVehicleData(
    id: number,
    type: VehicleType,
    lane: number,
    startZ: number,
    playerSpeed: number
  ): VehicleData {
    const config = GAME_CONFIG.VEHICLE_TYPES[type];

    // Calculate lane position
    const laneX = this.getLanePosition(lane);

    // Choose random color from type-specific palette
    const color =
      config.colors[Math.floor(Math.random() * config.colors.length)];

    // Calculate speed with variance
    const baseSpeed = playerSpeed * config.speedFactor;
    const speedVariance = baseSpeed * GAME_CONFIG.TRAFFIC.SPEED_VARIANCE;
    const finalSpeed = baseSpeed + (Math.random() - 0.5) * 2 * speedVariance;

    return {
      id,
      type,
      transform: {
        position: new THREE.Vector3(laneX, config.size.height / 2, startZ),
        rotation: new THREE.Euler(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
      },
      physics: {
        velocity: new THREE.Vector3(0, 0, finalSpeed),
        acceleration: new THREE.Vector3(0, 0, 0),
        maxSpeed: finalSpeed,
        steeringSpeed: 3.0, // Slower than player for lane changes
      },
      currentLane: lane,
      targetLane: lane,
      isChangingLanes: false,
      laneChangeProgress: 0,
      color,
    };
  }

  private getLanePosition(lane: number): number {
    // Assume 3 lanes for now - will be updated by traffic system
    const totalLanes = 3;
    const laneWidth = GAME_CONFIG.LANE_WIDTH;
    return (lane - (totalLanes - 1) / 2) * laneWidth;
  }

  private createMesh(): void {
    const config = GAME_CONFIG.VEHICLE_TYPES[this.data.type];

    this.geometry = new THREE.BoxGeometry(
      config.size.width,
      config.size.height,
      config.size.length
    );

    this.material = new THREE.MeshLambertMaterial({
      color: this.data.color,
      transparent: false,
    });

    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.copy(this.data.transform.position);
    this.mesh.rotation.copy(this.data.transform.rotation);
    this.mesh.scale.copy(this.data.transform.scale);

    // Enable shadows
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // Store reference to vehicle data
    this.mesh.userData = { vehicleId: this.data.id, type: this.data.type };
  }

  public update(deltaTime: number, currentLanes: number): void {
    this.updateLaneChange(deltaTime, currentLanes);
    this.updatePhysics(deltaTime);
    this.updateMesh();
    this.updateBoundingBox();
  }

  private updateLaneChange(deltaTime: number, currentLanes: number): void {
    // Check if should start lane change
    if (
      !this.data.isChangingLanes &&
      Math.random() < GAME_CONFIG.TRAFFIC.LANE_CHANGE_PROBABILITY * deltaTime
    ) {
      this.startLaneChange(currentLanes);
    }

    // Update ongoing lane change
    if (this.data.isChangingLanes) {
      this.data.laneChangeProgress += deltaTime * 2; // 0.5 seconds to change lanes

      if (this.data.laneChangeProgress >= 1) {
        this.completeLaneChange();
      } else {
        // Interpolate position during lane change
        const startX = this.getLanePosition(this.data.currentLane);
        const targetX = this.getLanePosition(this.data.targetLane);
        this.data.transform.position.x = THREE.MathUtils.lerp(
          startX,
          targetX,
          this.data.laneChangeProgress
        );

        // Add slight rotation during lane change
        this.data.transform.rotation.y =
          Math.sin(this.data.laneChangeProgress * Math.PI) * 0.1;
      }
    }
  }

  private startLaneChange(currentLanes: number): void {
    const possibleLanes: number[] = [];

    // Check left lane
    if (this.data.currentLane > 0) {
      possibleLanes.push(this.data.currentLane - 1);
    }

    // Check right lane
    if (this.data.currentLane < currentLanes - 1) {
      possibleLanes.push(this.data.currentLane + 1);
    }

    if (possibleLanes.length > 0) {
      this.data.targetLane =
        possibleLanes[Math.floor(Math.random() * possibleLanes.length)];
      this.data.isChangingLanes = true;
      this.data.laneChangeProgress = 0;
    }
  }

  private completeLaneChange(): void {
    this.data.currentLane = this.data.targetLane;
    this.data.isChangingLanes = false;
    this.data.laneChangeProgress = 0;
    this.data.transform.rotation.y = 0;
    this.data.transform.position.x = this.getLanePosition(
      this.data.currentLane
    );
  }

  private updatePhysics(deltaTime: number): void {
    // Simple forward movement
    this.data.transform.position.z += this.data.physics.velocity.z * deltaTime;
  }

  private updateMesh(): void {
    this.mesh.position.copy(this.data.transform.position);
    this.mesh.rotation.copy(this.data.transform.rotation);
    this.mesh.scale.copy(this.data.transform.scale);
  }

  private updateBoundingBox(): void {
    this.data.boundingBox = new THREE.Box3().setFromObject(this.mesh);
  }

  public updateLanePositions(currentLanes: number): void {
    // Update lane position calculation for dynamic road widths
    const laneWidth = GAME_CONFIG.LANE_WIDTH;

    if (!this.data.isChangingLanes) {
      // Clamp current lane to valid range
      this.data.currentLane = Math.max(
        0,
        Math.min(currentLanes - 1, this.data.currentLane)
      );
      this.data.targetLane = this.data.currentLane;

      // Update position
      this.data.transform.position.x =
        (this.data.currentLane - (currentLanes - 1) / 2) * laneWidth;
    }
  }

  public getPosition(): THREE.Vector3 {
    return this.data.transform.position.clone();
  }

  public getBoundingBox(): THREE.Box3 {
    return this.data.boundingBox!.clone();
  }

  public dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}
