import * as THREE from "three";
import { PlayerCar } from "./PlayerCar";
import { GAME_CONFIG, VISUAL_CONFIG } from "../utils/Constants";

export class EnemyCar {
  public mesh!: THREE.Mesh;
  public speed: number;
  private laneIndex: number;
  private aiType: "aggressive" | "defensive" | "random";
  private targetLane: number;
  private laneChangeTimer: number = 0;
  private isChangingLanes: boolean = false;
  private baseSpeed: number;

  constructor(
    scene: THREE.Scene,
    initialPosition: THREE.Vector3,
    laneIndex: number = 1,
    aiType: "aggressive" | "defensive" | "random" = "random"
  ) {
    this.laneIndex = laneIndex;
    this.targetLane = laneIndex;
    this.aiType = aiType;

    // ALL ENEMY CARS ARE SLOWER THAN PLAYER (Road Fighter style!)
    switch (aiType) {
      case "aggressive":
        this.baseSpeed =
          GAME_CONFIG.LEVEL_1_SPEED * GAME_CONFIG.ENEMY_AGGRESSIVE_SPEED_RATIO; // 85% - fast but not faster
        break;
      case "defensive":
        this.baseSpeed =
          GAME_CONFIG.LEVEL_1_SPEED * GAME_CONFIG.ENEMY_DEFENSIVE_SPEED_RATIO; // 40% - blocking
        break;
      default:
        const randomRatio =
          GAME_CONFIG.ENEMY_RANDOM_SPEED_MIN +
          Math.random() *
            (GAME_CONFIG.ENEMY_RANDOM_SPEED_MAX -
              GAME_CONFIG.ENEMY_RANDOM_SPEED_MIN);
        this.baseSpeed = GAME_CONFIG.LEVEL_1_SPEED * randomRatio; // 60-80%
    }

    this.speed = this.baseSpeed;
    this.createMesh(initialPosition);
    scene.add(this.mesh);
  }

  private createMesh(position: THREE.Vector3): void {
    const { width, height, length } = VISUAL_CONFIG.TRAFFIC_CAR_SIZE;
    const carGeometry = new THREE.BoxGeometry(width, height, length);

    // Use constants for colors
    let color: number;
    let emissive: number = 0x000000;
    let emissiveIntensity: number = 0;

    switch (this.aiType) {
      case "aggressive":
        color = VISUAL_CONFIG.ENEMY_AGGRESSIVE_COLOR;
        emissive = VISUAL_CONFIG.ENEMY_AGGRESSIVE_EMISSIVE;
        emissiveIntensity = 0.2;
        break;
      case "defensive":
        color = VISUAL_CONFIG.ENEMY_DEFENSIVE_COLOR;
        break;
      default:
        color =
          VISUAL_CONFIG.ENEMY_RANDOM_COLORS[
            Math.floor(Math.random() * VISUAL_CONFIG.ENEMY_RANDOM_COLORS.length)
          ];
    }

    const carMaterial = new THREE.MeshLambertMaterial({
      color,
      emissive,
      emissiveIntensity,
    });

    this.mesh = new THREE.Mesh(carGeometry, carMaterial);
    this.mesh.position.copy(position);
    this.mesh.position.y = height / 2;

    this.addCarDetails();
  }

  private addCarDetails(): void {
    // Rear lights using constants
    const rearLightGeometry = new THREE.SphereGeometry(
      VISUAL_CONFIG.REAR_LIGHT_SIZE,
      6,
      6
    );
    const rearLightMaterial = new THREE.MeshLambertMaterial({
      color: 0xff0000,
      emissive: 0x220000,
    });

    const leftRearLight = new THREE.Mesh(rearLightGeometry, rearLightMaterial);
    leftRearLight.position.set(-0.6, 0.1, -1.6);
    this.mesh.add(leftRearLight);

    const rightRearLight = new THREE.Mesh(rearLightGeometry, rearLightMaterial);
    rightRearLight.position.set(0.6, 0.1, -1.6);
    this.mesh.add(rightRearLight);

    // Special features for aggressive cars
    if (this.aiType === "aggressive") {
      // Add spoiler using constants
      const { width, height, length } = VISUAL_CONFIG.SPOILER_SIZE;
      const spoilerGeometry = new THREE.BoxGeometry(width, height, length);
      const spoilerMaterial = new THREE.MeshLambertMaterial({
        color: 0x222222,
      });
      const spoiler = new THREE.Mesh(spoilerGeometry, spoilerMaterial);
      spoiler.position.set(0, 0.4, -1.8);
      this.mesh.add(spoiler);

      // Add racing stripes using constants
      const stripeSize = VISUAL_CONFIG.RACING_STRIPE_SIZE;
      const stripeGeometry = new THREE.BoxGeometry(
        stripeSize.width,
        stripeSize.height,
        stripeSize.length
      );
      const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
      const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
      stripe.position.set(0, 0.31, 0);
      this.mesh.add(stripe);
    }
  }

  public update(deltaTime: number, playerCar: PlayerCar): void {
    // AI behavior - Road Fighter style (they try to eliminate but are slower)
    this.updateAI(deltaTime, playerCar);

    // Move forward (always slower than player)
    this.mesh.position.z -= this.speed * deltaTime;

    // Handle lane changing with smooth interpolation
    if (this.isChangingLanes) {
      const currentX = this.mesh.position.x;
      const targetX = GAME_CONFIG.LANE_POSITIONS[this.targetLane];
      const lerpSpeed = GAME_CONFIG.LANE_CHANGE_SPEED * deltaTime;

      this.mesh.position.x = THREE.MathUtils.lerp(currentX, targetX, lerpSpeed);

      // Check if lane change is complete
      if (Math.abs(currentX - targetX) < GAME_CONFIG.LANE_CHANGE_PRECISION) {
        this.mesh.position.x = targetX;
        this.laneIndex = this.targetLane;
        this.isChangingLanes = false;
      }
    }
  }

  private updateAI(deltaTime: number, playerCar: PlayerCar): void {
    this.laneChangeTimer -= deltaTime;
    const playerPos = playerCar.getPosition();
    const distance = this.mesh.position.distanceTo(playerPos);

    // AI decisions with constants
    if (this.laneChangeTimer <= 0 && !this.isChangingLanes) {
      switch (this.aiType) {
        case "aggressive":
          this.aggressiveAI(playerPos, distance);
          break;
        case "defensive":
          this.defensiveAI(playerPos, distance);
          break;
        default:
          this.randomAI();
      }

      // Reset timer using constants
      this.laneChangeTimer =
        GAME_CONFIG.ENEMY_LANE_CHANGE_COOLDOWN_MIN +
        Math.random() *
          (GAME_CONFIG.ENEMY_LANE_CHANGE_COOLDOWN_MAX -
            GAME_CONFIG.ENEMY_LANE_CHANGE_COOLDOWN_MIN);
    }

    // NO SPEED ADJUSTMENT - keep base speed (Road Fighter style)
    this.speed = this.baseSpeed;
  }

  private aggressiveAI(playerPos: THREE.Vector3, distance: number): void {
    // Try to get in player's way, but they're still slower
    if (distance < GAME_CONFIG.ENEMY_DETECTION_RANGE) {
      const playerLane = this.getPlayerLane(playerPos.x);

      // Try to target player's lane with chance
      if (Math.random() < GAME_CONFIG.ENEMY_AGGRESSIVE_CHANCE) {
        if (playerLane !== this.laneIndex) {
          this.changeLane(playerLane);
        }
      }
    }
  }

  private defensiveAI(playerPos: THREE.Vector3, distance: number): void {
    // Try to block player's path by staying in front
    if (distance < GAME_CONFIG.ENEMY_DETECTION_RANGE) {
      const playerLane = this.getPlayerLane(playerPos.x);

      // If in front of player and not in their lane, move to block
      if (
        this.mesh.position.z < playerPos.z &&
        Math.random() < GAME_CONFIG.ENEMY_DEFENSIVE_CHANCE
      ) {
        if (playerLane !== this.laneIndex) {
          this.changeLane(playerLane);
        }
      }
    }
  }

  private randomAI(): void {
    // Random lane changes
    if (Math.random() < GAME_CONFIG.ENEMY_RANDOM_CHANCE) {
      const newLane = Math.floor(Math.random() * GAME_CONFIG.LANE_COUNT);
      if (newLane !== this.laneIndex) {
        this.changeLane(newLane);
      }
    }
  }

  private getPlayerLane(playerX: number): number {
    const distances = GAME_CONFIG.LANE_POSITIONS.map((pos) =>
      Math.abs(pos - playerX)
    );
    return distances.indexOf(Math.min(...distances));
  }

  private changeLane(newLane: number): void {
    if (
      newLane >= 0 &&
      newLane < GAME_CONFIG.LANE_COUNT &&
      newLane !== this.laneIndex &&
      !this.isChangingLanes
    ) {
      this.targetLane = newLane;
      this.isChangingLanes = true;
      console.log(
        `${this.aiType} car changing from lane ${this.laneIndex} to ${newLane}`
      );
    }
  }

  public getPosition(): THREE.Vector3 {
    return this.mesh.position.clone();
  }

  public isOffScreen(playerZ: number): boolean {
    return (
      this.mesh.position.z > playerZ + GAME_CONFIG.TRAFFIC_DESPAWN_DISTANCE
    );
  }

  public destroy(): void {
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}
