import * as THREE from "three";
import * as CANNON from "cannon-es";
import { Enemy } from "./Enemy.js";
import { GAME_CONFIG } from "../utils/GameConfig.js";
import { PathfindingGrid } from "../utils/PathFinding.js";
import type { AssetLoader } from "../utils/AssetLoader.js";

export class EnemyManager {
  private enemies: Map<string, Enemy> = new Map();
  private scene: THREE.Scene;
  private physicsWorld: CANNON.World;
  private assetLoader: AssetLoader;
  private lastSpawnTime: number = 0;
  private enemyCounter: number = 0;
  private spawnPoints: THREE.Vector3[];
  private pathfinding: PathfindingGrid;

  constructor(
    scene: THREE.Scene,
    physicsWorld: CANNON.World,
    assetLoader: AssetLoader
  ) {
    this.scene = scene;
    this.physicsWorld = physicsWorld;
    this.assetLoader = assetLoader;
    this.pathfinding = new PathfindingGrid();

    // Define spawn points around the arena perimeter
    this.spawnPoints = this.createSpawnPoints();

    console.log(
      "EnemyManager initialized with",
      this.spawnPoints.length,
      "spawn points"
    );
  }

  private createSpawnPoints(): THREE.Vector3[] {
    const arenaSize = GAME_CONFIG.ARENA_SIZE;
    const points: THREE.Vector3[] = [];

    // Spawn points along the walls but inside the arena
    const margin = 8; // Distance from wall

    // North wall spawns
    for (
      let x = -arenaSize / 2 + margin;
      x <= arenaSize / 2 - margin;
      x += 10
    ) {
      points.push(new THREE.Vector3(x, 0, -arenaSize / 2 + margin));
    }

    // South wall spawns
    for (
      let x = -arenaSize / 2 + margin;
      x <= arenaSize / 2 - margin;
      x += 10
    ) {
      points.push(new THREE.Vector3(x, 0, arenaSize / 2 - margin));
    }

    // East wall spawns
    for (
      let z = -arenaSize / 2 + margin;
      z <= arenaSize / 2 - margin;
      z += 10
    ) {
      points.push(new THREE.Vector3(arenaSize / 2 - margin, 0, z));
    }

    // West wall spawns
    for (
      let z = -arenaSize / 2 + margin;
      z <= arenaSize / 2 - margin;
      z += 10
    ) {
      points.push(new THREE.Vector3(-arenaSize / 2 + margin, 0, z));
    }

    console.log("Created spawn points:", points);
    return points;
  }

  public update(
    deltaTime: number,
    playerPosition: THREE.Vector3,
    gameTime: number
  ): void {
    // Spawn new enemies if needed
    this.handleSpawning(gameTime, playerPosition);

    // Update all enemies
    const obstacles = this.scene.children.filter(
      (child) =>
        child.userData.obstacle === true ||
        child.name.includes("wall") ||
        child.name.includes("cover")
    );

    this.enemies.forEach((enemy) => {
      if (!enemy.isDead()) {
        enemy.update(deltaTime, playerPosition, obstacles);
      }
    });

    // Clean up dead enemies after some time
    this.cleanupDeadEnemies();
  }

  private handleSpawning(
    gameTime: number,
    playerPosition: THREE.Vector3
  ): void {
    const now = Date.now();

    // Don't spawn if at max capacity
    const aliveEnemies = Array.from(this.enemies.values()).filter(
      (enemy) => !enemy.isDead()
    );

    console.log(
      `Alive enemies: ${aliveEnemies.length}/${GAME_CONFIG.SPAWN.MAX_ENEMIES}`
    );

    if (aliveEnemies.length >= GAME_CONFIG.SPAWN.MAX_ENEMIES) {
      return;
    }

    // Calculate spawn delay (gets faster over time but starts slower)
    const baseDelay = GAME_CONFIG.SPAWN.INITIAL_DELAY; // Reset to normal delay
    const minDelay = GAME_CONFIG.SPAWN.MIN_DELAY;
    const currentDelay = Math.max(minDelay, baseDelay - gameTime * 50);

    console.log(
      `Time since last spawn: ${
        now - this.lastSpawnTime
      }, required delay: ${currentDelay}`
    );

    if (now - this.lastSpawnTime < currentDelay) {
      return;
    }

    console.log("Attempting to spawn enemy...");
    this.spawnEnemy(playerPosition);
    this.lastSpawnTime = now;
  }

  private async spawnEnemy(playerPosition: THREE.Vector3): Promise<void> {
    // Find a spawn point far enough from the player
    const validSpawnPoints = this.spawnPoints.filter(
      (point) => point.distanceTo(playerPosition) > 15 // Reduced minimum distance for easier testing
    );

    console.log(
      `Valid spawn points: ${validSpawnPoints.length} out of ${this.spawnPoints.length}`
    );
    console.log("Player position:", playerPosition);

    if (validSpawnPoints.length === 0) {
      console.warn("No valid spawn points found!");
      return;
    }

    const spawnPoint =
      validSpawnPoints[Math.floor(Math.random() * validSpawnPoints.length)];
    console.log("Selected spawn point:", spawnPoint);

    try {
      // Randomly choose enemy model
      const enemyModels = ["enemy1", "enemy2"];
      const modelName =
        enemyModels[Math.floor(Math.random() * enemyModels.length)];
      console.log("Loading enemy model:", modelName);

      const enemyModel = await this.assetLoader.loadModel(
        `/character-${modelName === "enemy1" ? "b" : "c"}.glb`,
        modelName
      );

      const enemyId = `enemy_${this.enemyCounter++}`;
      console.log("Creating enemy with ID:", enemyId);

      const enemy = new Enemy(
        enemyId,
        spawnPoint,
        enemyModel,
        this.pathfinding
      );

      // Add to scene and physics
      this.scene.add(enemy.mesh);
      this.physicsWorld.addBody(enemy.physicsBody);

      // Store enemy
      this.enemies.set(enemyId, enemy);

      console.log(
        `Successfully spawned enemy ${enemyId} at position:`,
        spawnPoint
      );
      console.log(`Total enemies now: ${this.enemies.size}`);
    } catch (error) {
      console.error("Failed to spawn enemy:", error);
    }
  }

  private cleanupDeadEnemies(): void {
    this.enemies.forEach((enemy, id) => {
      if (enemy.isDead()) {
        // Remove after 8 seconds (longer time to see dead bodies)
        setTimeout(() => {
          if (this.enemies.has(id)) {
            this.scene.remove(enemy.mesh);
            this.physicsWorld.removeBody(enemy.physicsBody);
            enemy.cleanup();
            this.enemies.delete(id);
            console.log(`Cleaned up dead enemy ${id}`);
          }
        }, 8000);
      }
    });
  }

  public checkBulletHits(
    ray: THREE.Ray,
    damage: number
  ): { hit: boolean; enemyId?: string } {
    const raycaster = new THREE.Raycaster(ray.origin, ray.direction);

    for (const [id, enemy] of this.enemies) {
      if (enemy.isDead()) continue;

      const intersections = raycaster.intersectObject(enemy.mesh, true);
      if (intersections.length > 0 && intersections[0].distance < 100) {
        const died = enemy.takeDamage(damage);
        console.log(`Hit enemy ${id}${died ? " - KILLED!" : ""}`);
        return { hit: true, enemyId: id };
      }
    }

    return { hit: false };
  }

  // Enemy attack system - damage only when very close
  public checkEnemyAttacks(playerPosition: THREE.Vector3): number {
    let totalDamage = 0;

    this.enemies.forEach((enemy) => {
      if (!enemy.isDead()) {
        const distance = enemy.getPosition().distanceTo(playerPosition);
        // Enemies must be very close to deal damage (melee range)
        if (distance < 3.0) {
          // Much closer range - almost touching
          // Damage chance per frame when in melee range
          if (Math.random() < 0.01) {
            // 1% chance per frame when very close
            totalDamage += 8; // Moderate damage when they get close
            console.log(
              `Player took melee damage from enemy ${
                enemy.id
              } at distance ${distance.toFixed(1)}!`
            );
          }
        }
      }
    });

    return totalDamage;
  }

  public getEnemyPositions(): THREE.Vector3[] {
    return Array.from(this.enemies.values())
      .filter((enemy) => !enemy.isDead())
      .map((enemy) => enemy.getPosition());
  }

  public getAliveEnemyCount(): number {
    return Array.from(this.enemies.values()).filter((enemy) => !enemy.isDead())
      .length;
  }

  public getAllEnemies(): Enemy[] {
    return Array.from(this.enemies.values());
  }

  public cleanup(): void {
    this.enemies.forEach((enemy) => {
      this.scene.remove(enemy.mesh);
      this.physicsWorld.removeBody(enemy.physicsBody);
      enemy.cleanup();
    });
    this.enemies.clear();
  }
}
