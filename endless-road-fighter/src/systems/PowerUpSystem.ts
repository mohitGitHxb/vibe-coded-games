import * as THREE from "three";
import { PowerUp } from "../entities/PowerUp";
import { GAME_CONFIG } from "../utils/Constants";
import type {
  GameState,
  PowerUpCollectionInfo,
  PowerUpState,
  PowerUpType,
} from "../utils/Types";

export class PowerUpSystem {
  private powerUpState: PowerUpState;
  private activePowerUps: Map<number, PowerUp> = new Map();
  private scene: THREE.Scene | null = null;

  constructor() {
    this.powerUpState = {
      powerUps: [],
      nextPowerUpId: 0,
      lastSpawnDistance: 0,
      nextSpawnDistance: this.calculateNextSpawnDistance(),
    };

    console.log(
      "PowerUpSystem initialized with first spawn at:",
      this.powerUpState.nextSpawnDistance
    );
  }

  public setScene(scene: THREE.Scene): void {
    this.scene = scene;
  }

  public update(
    deltaTime: number,
    playerPosition: THREE.Vector3,
    currentLanes: number,
    gameDistance: number
  ): void {
    this.spawnPowerUps(gameDistance, currentLanes);
    this.updatePowerUps(deltaTime, currentLanes);
    this.despawnDistantPowerUps(playerPosition.z);
    this.updatePowerUpState();
  }

  private calculateNextSpawnDistance(): number {
    const min = GAME_CONFIG.POWERUP.SPAWN_INTERVAL.min;
    const max = GAME_CONFIG.POWERUP.SPAWN_INTERVAL.max;
    return min + Math.random() * (max - min);
  }

  private spawnPowerUps(gameDistance: number, currentLanes: number): void {
    // Fixed spawning logic - ensure continuous spawning
    if (gameDistance >= this.powerUpState.nextSpawnDistance) {
      const spawnZ = gameDistance + GAME_CONFIG.POWERUP.SPAWN_DISTANCE;
      const lane = Math.floor(Math.random() * currentLanes);

      console.log(
        `🎯 Spawning power-up at distance ${Math.round(
          gameDistance
        )}, z=${Math.round(spawnZ)}, lane=${lane}`
      );

      this.spawnPowerUp(lane, spawnZ, currentLanes);

      // IMPORTANT: Update spawn tracking AFTER spawning
      this.powerUpState.lastSpawnDistance = gameDistance;
      this.powerUpState.nextSpawnDistance =
        gameDistance + this.calculateNextSpawnDistance();

      console.log(
        `📍 Next power-up spawn scheduled at distance: ${Math.round(
          this.powerUpState.nextSpawnDistance
        )}`
      );
    }
  }

  private spawnPowerUp(
    lane: number,
    spawnZ: number,
    currentLanes: number
  ): void {
    const powerUpType = this.selectPowerUpType();
    const powerUp = new PowerUp(
      this.powerUpState.nextPowerUpId++,
      powerUpType,
      lane,
      spawnZ,
      currentLanes
    );

    this.activePowerUps.set(powerUp.data.id, powerUp);

    if (this.scene) {
      this.scene.add(powerUp.mesh);
      this.scene.add(powerUp.glowMesh);
      console.log(
        `✅ Power-up ${powerUpType} #${
          powerUp.data.id
        } spawned at z=${Math.round(spawnZ)}, lane=${lane} (Total active: ${
          this.activePowerUps.size
        })`
      );
    } else {
      console.error("❌ Scene not set! Cannot add power-up to scene");
    }
  }

  private selectPowerUpType(): PowerUpType {
    // Improved power-up type selection with better randomization
    const types = Object.keys(GAME_CONFIG.POWERUP_TYPES) as PowerUpType[];
    const weights: number[] = [];

    // Build weights array
    for (const type of types) {
      weights.push(GAME_CONFIG.POWERUP_TYPES[type].spawnWeight);
    }

    // Calculate total weight
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const random = Math.random() * totalWeight;

    let currentWeight = 0;
    for (let i = 0; i < types.length; i++) {
      currentWeight += weights[i];
      if (random <= currentWeight) {
        console.log(
          `🎲 Selected power-up type: ${types[i]} (${Math.round(
            random
          )}/${totalWeight})`
        );
        return types[i];
      }
    }

    // Fallback (should never reach here)
    console.log("🎲 Fallback power-up type: SPEED_BOOST");
    return "SPEED_BOOST";
  }

  private updatePowerUps(deltaTime: number, currentLanes: number): void {
    for (const powerUp of this.activePowerUps.values()) {
      powerUp.update(deltaTime, currentLanes);
    }
  }

  private despawnDistantPowerUps(playerZ: number): void {
    const despawnThreshold = playerZ + GAME_CONFIG.POWERUP.DESPAWN_DISTANCE;
    const powerUpsToRemove: number[] = [];

    for (const [id, powerUp] of this.activePowerUps.entries()) {
      if (
        powerUp.data.transform.position.z < despawnThreshold ||
        powerUp.data.isCollected
      ) {
        powerUpsToRemove.push(id);
      }
    }

    for (const id of powerUpsToRemove) {
      const powerUp = this.activePowerUps.get(id);
      if (powerUp) {
        if (this.scene) {
          this.scene.remove(powerUp.mesh);
          this.scene.remove(powerUp.glowMesh);
        }
        powerUp.dispose();
        this.activePowerUps.delete(id);
      }
    }

    if (powerUpsToRemove.length > 0) {
      console.log(
        `🧹 Despawned ${powerUpsToRemove.length} power-ups (${this.activePowerUps.size} remain active)`
      );
    }
  }

  private updatePowerUpState(): void {
    this.powerUpState.powerUps = Array.from(this.activePowerUps.values()).map(
      (p) => p.data
    );
  }

  public checkCollections(
    playerPosition: THREE.Vector3,
    playerBounds: THREE.Box3
  ): PowerUpCollectionInfo {
    for (const powerUp of this.activePowerUps.values()) {
      if (!powerUp.data.isCollected && powerUp.data.boundingBox) {
        const distance = playerPosition.distanceTo(
          powerUp.data.transform.position
        );

        if (distance <= GAME_CONFIG.POWERUP.PICKUP_DISTANCE) {
          powerUp.collect();

          console.log(
            `🎉 Collected ${powerUp.data.type} power-up #${powerUp.data.id}! (Active: ${this.activePowerUps.size})`
          );

          return {
            hasCollection: true,
            powerUp: powerUp.data,
          };
        }
      }
    }

    return {
      hasCollection: false,
    };
  }

  public updateActiveEffects(gameState: GameState, deltaTime: number): void {
    let scoreMultiplier = 1;

    // Update speed boost
    if (gameState.activeEffects.speedBoost.active) {
      gameState.activeEffects.speedBoost.timeRemaining -= deltaTime;
      if (gameState.activeEffects.speedBoost.timeRemaining <= 0) {
        gameState.activeEffects.speedBoost.active = false;
        console.log("Speed boost expired");
      } else {
        scoreMultiplier *=
          GAME_CONFIG.POWERUP.EFFECTS.SPEED_BOOST.scoreMultiplier;
      }
    }

    // Update invincibility
    if (gameState.activeEffects.invincibility.active) {
      gameState.activeEffects.invincibility.timeRemaining -= deltaTime;
      if (gameState.activeEffects.invincibility.timeRemaining <= 0) {
        gameState.activeEffects.invincibility.active = false;
        console.log("Invincibility expired");
      }
    }

    // Update score multiplier
    if (gameState.activeEffects.scoreMultiplier.active) {
      gameState.activeEffects.scoreMultiplier.timeRemaining -= deltaTime;
      if (gameState.activeEffects.scoreMultiplier.timeRemaining <= 0) {
        gameState.activeEffects.scoreMultiplier.active = false;
        console.log("Score multiplier expired");
      } else {
        scoreMultiplier *= gameState.activeEffects.scoreMultiplier.multiplier;
      }
    }

    gameState.currentScoreMultiplier = scoreMultiplier;
  }

  public applyPowerUpEffect(
    gameState: GameState,
    powerUpType: PowerUpType
  ): void {
    const effects = GAME_CONFIG.POWERUP.EFFECTS;

    switch (powerUpType) {
      case "SPEED_BOOST":
        gameState.activeEffects.speedBoost.active = true;
        gameState.activeEffects.speedBoost.timeRemaining =
          effects.SPEED_BOOST.duration;
        console.log(
          `🚀 Speed boost activated for ${effects.SPEED_BOOST.duration}s`
        );
        break;

      case "INVINCIBILITY":
        gameState.activeEffects.invincibility.active = true;
        gameState.activeEffects.invincibility.timeRemaining =
          effects.INVINCIBILITY.duration;
        console.log(
          `🛡️ Invincibility activated for ${effects.INVINCIBILITY.duration}s`
        );
        break;

      case "SCORE_MULTIPLIER":
        gameState.activeEffects.scoreMultiplier.active = true;
        gameState.activeEffects.scoreMultiplier.timeRemaining =
          effects.SCORE_MULTIPLIER.duration;
        gameState.activeEffects.scoreMultiplier.multiplier =
          effects.SCORE_MULTIPLIER.multiplier;
        console.log(
          `💰 Score multiplier activated: ${effects.SCORE_MULTIPLIER.multiplier}x for ${effects.SCORE_MULTIPLIER.duration}s`
        );
        break;
    }
  }

  public getCurrentSpeedMultiplier(gameState: GameState): number {
    if (gameState.activeEffects.speedBoost.active) {
      return GAME_CONFIG.POWERUP.EFFECTS.SPEED_BOOST.speedMultiplier;
    }
    return 1;
  }

  public getActivePowerUpCount(): number {
    return this.activePowerUps.size;
  }

  public getPowerUpState(): PowerUpState {
    return { ...this.powerUpState };
  }

  public dispose(): void {
    // Clean up all power-ups
    for (const powerUp of this.activePowerUps.values()) {
      if (this.scene) {
        this.scene.remove(powerUp.mesh);
        this.scene.remove(powerUp.glowMesh);
      }
      powerUp.dispose();
    }
    this.activePowerUps.clear();
    this.powerUpState.powerUps = [];

    // Reset spawning state
    this.powerUpState.lastSpawnDistance = 0;
    this.powerUpState.nextSpawnDistance = this.calculateNextSpawnDistance();

    console.log("🧹 PowerUpSystem disposed and reset");
  }
}
