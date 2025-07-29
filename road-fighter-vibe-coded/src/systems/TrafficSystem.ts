import * as THREE from "three";
import { TrafficCar } from "../entities/TrafficCar";
import { EnemyCar } from "../entities/EnemyCar";
import { PlayerCar } from "../entities/PlayerCar";
import { GAME_CONFIG } from "../utils/Constants";

export class TrafficSystem {
  private scene: THREE.Scene;
  private trafficCars: TrafficCar[] = [];
  private enemyCars: EnemyCar[] = [];
  private spawnTimer: number = 0;
  private enemySpawnTimer: number = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public update(
    deltaTime: number,
    playerZ: number,
    playerCar: PlayerCar
  ): void {
    this.spawnTimer += deltaTime;
    this.enemySpawnTimer += deltaTime;

    // Spawn regular traffic using constants
    if (this.spawnTimer >= GAME_CONFIG.TRAFFIC_SPAWN_INTERVAL) {
      this.spawnTrafficCar(playerZ);
      this.spawnTimer = 0;
    }

    // Spawn enemy cars less frequently using constants
    if (
      this.enemySpawnTimer >=
      GAME_CONFIG.TRAFFIC_SPAWN_INTERVAL *
        GAME_CONFIG.ENEMY_SPAWN_INTERVAL_MULTIPLIER
    ) {
      this.spawnEnemyCar(playerZ);
      this.enemySpawnTimer = 0;
    }

    // Update regular traffic cars
    for (let i = this.trafficCars.length - 1; i >= 0; i--) {
      const car = this.trafficCars[i];
      car.update(deltaTime);

      if (car.isOffScreen(playerZ)) {
        car.destroy();
        this.trafficCars.splice(i, 1);
      }
    }

    // Update enemy cars with AI
    for (let i = this.enemyCars.length - 1; i >= 0; i--) {
      const car = this.enemyCars[i];
      car.update(deltaTime, playerCar);

      if (car.isOffScreen(playerZ)) {
        car.destroy();
        this.enemyCars.splice(i, 1);
      }
    }
  }

  private spawnTrafficCar(playerZ: number): void {
    if (this.trafficCars.length >= GAME_CONFIG.MAX_ACTIVE_TRAFFIC) return;

    const randomLaneIndex = Math.floor(
      Math.random() * GAME_CONFIG.LANE_POSITIONS.length
    );
    const lanePosition = GAME_CONFIG.LANE_POSITIONS[randomLaneIndex];

    const spawnPosition = new THREE.Vector3(
      lanePosition,
      0,
      playerZ - GAME_CONFIG.TRAFFIC_SPAWN_DISTANCE
    );

    const speedVariation =
      GAME_CONFIG.SLOW_TRAFFIC_SPEED_RATIO +
      Math.random() *
        (GAME_CONFIG.TRAFFIC_SPEED_RATIO -
          GAME_CONFIG.SLOW_TRAFFIC_SPEED_RATIO);
    const trafficCar = new TrafficCar(
      this.scene,
      spawnPosition,
      randomLaneIndex,
      speedVariation
    );
    this.trafficCars.push(trafficCar);
  }

  private spawnEnemyCar(playerZ: number): void {
    // Reduced max enemies to prevent spawn trapping
    if (this.enemyCars.length >= GAME_CONFIG.MAX_ACTIVE_ENEMIES) return;

    const randomLaneIndex = Math.floor(
      Math.random() * GAME_CONFIG.LANE_POSITIONS.length
    );
    const lanePosition = GAME_CONFIG.LANE_POSITIONS[randomLaneIndex];

    const spawnPosition = new THREE.Vector3(
      lanePosition,
      0,
      playerZ - GAME_CONFIG.TRAFFIC_SPAWN_DISTANCE - 30 // Spawn further ahead
    );

    // Balanced AI distribution (less aggressive spam)
    const aiTypes: ("aggressive" | "defensive" | "random")[] = [
      "aggressive",
      "aggressive", // 40% aggressive
      "defensive", // 20% defensive
      "random",
      "random", // 40% random
    ];
    const aiType = aiTypes[Math.floor(Math.random() * aiTypes.length)];

    const enemyCar = new EnemyCar(
      this.scene,
      spawnPosition,
      randomLaneIndex,
      aiType
    );
    this.enemyCars.push(enemyCar);

    console.log(
      `Spawned ${aiType} enemy car in lane ${randomLaneIndex} (${this.enemyCars.length}/${GAME_CONFIG.MAX_ACTIVE_ENEMIES})`
    );
  }

  public getAllCars(): (TrafficCar | EnemyCar)[] {
    return [...this.trafficCars, ...this.enemyCars];
  }

  public getTrafficCars(): TrafficCar[] {
    return this.trafficCars;
  }

  public destroy(): void {
    this.trafficCars.forEach((car) => car.destroy());
    this.enemyCars.forEach((car) => car.destroy());
    this.trafficCars = [];
    this.enemyCars = [];
  }
}
