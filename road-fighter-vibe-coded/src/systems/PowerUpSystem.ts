import * as THREE from "three";
import { PowerUp, type PowerUpType } from "../entities/PowerUp";
import { PlayerCar } from "../entities/PlayerCar";
import { GAME_CONFIG } from "../utils/Constants";

export interface PowerUpEffect {
  type: PowerUpType;
  duration: number;
  message: string;
}

export class PowerUpSystem {
  private scene: THREE.Scene;
  private powerUps: PowerUp[] = [];
  private spawnTimer: number = 0;
  private spawnInterval: number = 8; // Spawn every 8 seconds

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public update(
    deltaTime: number,
    playerZ: number,
    playerCar: PlayerCar
  ): PowerUpEffect | null {
    this.spawnTimer += deltaTime;

    // Spawn power-ups
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnPowerUp(playerZ);
      this.spawnTimer = 0;
    }

    // Update existing power-ups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.update(deltaTime);

      // Check collection
      if (powerUp.checkPlayerCollision(playerCar.getPosition())) {
        const effect = this.collectPowerUp(powerUp);
        this.powerUps.splice(i, 1);
        return effect;
      }

      // Remove if off screen
      if (powerUp.isOffScreen(playerZ)) {
        powerUp.destroy();
        this.powerUps.splice(i, 1);
      }
    }

    return null;
  }

  private spawnPowerUp(playerZ: number): void {
    if (this.powerUps.length >= 2) return; // Max 2 power-ups on screen

    // Random lane
    const randomLaneIndex = Math.floor(
      Math.random() * GAME_CONFIG.LANE_POSITIONS.length
    );
    const lanePosition = GAME_CONFIG.LANE_POSITIONS[randomLaneIndex];

    const spawnPosition = new THREE.Vector3(
      lanePosition,
      2, // Elevated position
      playerZ - GAME_CONFIG.TRAFFIC_SPAWN_DISTANCE
    );

    // Random power-up type with weighted probability
    const powerUpTypes: PowerUpType[] = [
      "speed_boost",
      "speed_boost", // More common
      "invincibility",
      "invincibility", // More common
      "time_bonus",
      "time_bonus", // More common
      "extra_life", // Rare
    ];
    const randomType =
      powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];

    const powerUp = new PowerUp(this.scene, spawnPosition, randomType);
    this.powerUps.push(powerUp);
  }

  private collectPowerUp(powerUp: PowerUp): PowerUpEffect {
    powerUp.collect();

    switch (powerUp.type) {
      case "speed_boost":
        return {
          type: "speed_boost",
          duration: 5,
          message: "SPEED BOOST!",
        };
      case "invincibility":
        return {
          type: "invincibility",
          duration: 8,
          message: "INVINCIBLE!",
        };
      case "extra_life":
        return {
          type: "extra_life",
          duration: 0,
          message: "EXTRA LIFE!",
        };
      case "time_bonus":
        return {
          type: "time_bonus",
          duration: 0,
          message: "+10 SECONDS!",
        };
    }
  }

  public destroy(): void {
    this.powerUps.forEach((powerUp) => powerUp.destroy());
    this.powerUps = [];
  }
}
