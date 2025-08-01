import * as THREE from "three";
import { TrafficVehicle } from "../entities/TrafficVehicle";
import { GAME_CONFIG } from "../utils/Constants";
import type { CollisionInfo, TrafficState, VehicleType } from "../utils/Types";

export class TrafficSystem {
  private trafficState: TrafficState;
  private activeVehicles: Map<number, TrafficVehicle> = new Map();
  private scene: THREE.Scene | null = null;

  constructor() {
    this.trafficState = {
      vehicles: [],
      nextVehicleId: 0,
      lastSpawnTime: 0,
      currentSpawnRate: GAME_CONFIG.TRAFFIC.BASE_SPAWN_RATE,
    };
  }

  public setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }

  public update(
    deltaTime: number,
    playerPosition: THREE.Vector3,
    playerSpeed: number,
    currentLanes: number,
    gameDistance: number
  ): void {
    this.updateSpawnRate(playerSpeed);
    this.spawnVehicles(deltaTime, playerPosition, playerSpeed, currentLanes);
    this.updateVehicles(deltaTime, currentLanes);
    this.updateVehicleLanePositions(currentLanes);
    this.despawnDistantVehicles(playerPosition.z);
    this.updateTrafficState();
  }

  private updateSpawnRate(playerSpeed: number): void {
    // Increase spawn rate with player speed for higher difficulty
    const speedRatio = playerSpeed / GAME_CONFIG.STARTING_SPEED;
    this.trafficState.currentSpawnRate = THREE.MathUtils.lerp(
      GAME_CONFIG.TRAFFIC.BASE_SPAWN_RATE,
      GAME_CONFIG.TRAFFIC.MAX_SPAWN_RATE,
      Math.min(speedRatio - 1, 1) // Start increasing after base speed
    );
  }

  private spawnVehicles(
    deltaTime: number,
    playerPosition: THREE.Vector3,
    playerSpeed: number,
    currentLanes: number
  ): void {
    this.trafficState.lastSpawnTime += deltaTime;

    const spawnInterval = 1 / this.trafficState.currentSpawnRate;

    if (this.trafficState.lastSpawnTime >= spawnInterval) {
      const spawnZ = playerPosition.z + GAME_CONFIG.TRAFFIC.SPAWN_DISTANCE;
      const lane = Math.floor(Math.random() * currentLanes);

      // Check if spawn position is clear
      if (this.isSpawnPositionClear(lane, spawnZ)) {
        this.spawnVehicle(lane, spawnZ, playerSpeed);
        this.trafficState.lastSpawnTime = 0;
      }
    }
  }

  private isSpawnPositionClear(lane: number, spawnZ: number): boolean {
    const minSpacing = GAME_CONFIG.TRAFFIC.MIN_VEHICLE_SPACING;

    for (const vehicle of this.activeVehicles.values()) {
      if (
        vehicle.data.currentLane === lane ||
        vehicle.data.targetLane === lane
      ) {
        const distance = Math.abs(vehicle.data.transform.position.z - spawnZ);
        if (distance < minSpacing) {
          return false;
        }
      }
    }

    return true;
  }

  private spawnVehicle(
    lane: number,
    spawnZ: number,
    playerSpeed: number
  ): void {
    const vehicleType = this.selectVehicleType();
    const vehicle = new TrafficVehicle(
      this.trafficState.nextVehicleId++,
      vehicleType,
      lane,
      spawnZ,
      playerSpeed
    );

    this.activeVehicles.set(vehicle.data.id, vehicle);

    if (this.scene) {
      this.scene.add(vehicle.mesh);
    }

    console.log(
      `Spawned ${vehicleType} in lane ${lane} at z=${Math.round(spawnZ)}`
    );
  }

  private selectVehicleType(): VehicleType {
    const rand = Math.random() * 100;
    let cumulative = 0;

    for (const [type, config] of Object.entries(GAME_CONFIG.VEHICLE_TYPES)) {
      cumulative += config.spawnWeight;
      if (rand <= cumulative) {
        return type as VehicleType;
      }
    }

    return "CAR"; // Fallback
  }

  private updateVehicles(deltaTime: number, currentLanes: number): void {
    for (const vehicle of this.activeVehicles.values()) {
      vehicle.update(deltaTime, currentLanes);
    }
  }

  private updateVehicleLanePositions(currentLanes: number): void {
    for (const vehicle of this.activeVehicles.values()) {
      vehicle.updateLanePositions(currentLanes);
    }
  }

  private despawnDistantVehicles(playerZ: number): void {
    const despawnThreshold = playerZ + GAME_CONFIG.TRAFFIC.DESPAWN_DISTANCE;
    const vehiclesToRemove: number[] = [];

    for (const [id, vehicle] of this.activeVehicles.entries()) {
      if (vehicle.data.transform.position.z < despawnThreshold) {
        vehiclesToRemove.push(id);
      }
    }

    for (const id of vehiclesToRemove) {
      const vehicle = this.activeVehicles.get(id);
      if (vehicle) {
        vehicle.dispose();
        this.activeVehicles.delete(id);
      }
    }

    if (vehiclesToRemove.length > 0) {
      console.log(`Despawned ${vehiclesToRemove.length} vehicles`);
    }
  }

  private updateTrafficState(): void {
    this.trafficState.vehicles = Array.from(this.activeVehicles.values()).map(
      (v) => v.data
    );
  }

  public checkCollisions(
    playerPosition: THREE.Vector3,
    playerBounds: THREE.Box3
  ): CollisionInfo {
    for (const vehicle of this.activeVehicles.values()) {
      if (
        vehicle.data.boundingBox &&
        playerBounds.intersectsBox(vehicle.data.boundingBox)
      ) {
        // Calculate collision details
        const penetration = this.calculatePenetrationDepth(
          playerBounds,
          vehicle.data.boundingBox
        );
        const normal = new THREE.Vector3()
          .subVectors(playerPosition, vehicle.data.transform.position)
          .normalize();

        return {
          hasCollision: true,
          vehicle: vehicle.data,
          penetrationDepth: penetration,
          collisionNormal: normal,
        };
      }
    }

    return {
      hasCollision: false,
      penetrationDepth: 0,
      collisionNormal: new THREE.Vector3(),
    };
  }

  private calculatePenetrationDepth(
    box1: THREE.Box3,
    box2: THREE.Box3
  ): number {
    const overlap = new THREE.Box3();
    overlap.copy(box1).intersect(box2);

    if (overlap.isEmpty()) {
      return 0;
    }

    const size = overlap.getSize(new THREE.Vector3());
    return Math.min(size.x, size.z); // Return smallest penetration
  }

  public getTrafficDensity(): number {
    // Calculate traffic density as a value between 0 and 1
    const maxVehicles = 20; // Reasonable maximum for smooth gameplay
    return Math.min(this.activeVehicles.size / maxVehicles, 1);
  }

  public getActiveVehicleCount(): number {
    return this.activeVehicles.size;
  }

  public getTrafficState(): TrafficState {
    return { ...this.trafficState };
  }

  public dispose(): void {
    // Clean up all vehicles
    for (const vehicle of this.activeVehicles.values()) {
      vehicle.dispose();
    }
    this.activeVehicles.clear();
    this.trafficState.vehicles = [];
  }
}
