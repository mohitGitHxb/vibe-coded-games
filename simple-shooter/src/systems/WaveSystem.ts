import * as THREE from "three";
import { Enemy } from "../entities/Enemy";
import type { EnemyType } from "../types";
import { GAME_CONFIG } from "../utils/Constants";

interface WaveConfig {
  waveNumber: number;
  enemyCount: number;
  enemyTypes: { type: EnemyType; count: number }[];
  spawnDelay: number; // seconds between spawns
  waveDelay: number; // seconds before next wave starts
}

export class WaveSystem {
  private currentWave: number = 0;
  private enemiesRemaining: number = 0;
  private enemiesSpawned: number = 0;
  private lastSpawnTime: number = 0;
  private waveActive: boolean = false;
  private waveCompleteTime: number = 0;
  private currentWaveConfig: WaveConfig | null = null;

  // Spawn points INSIDE the arena but near the edges
  private spawnPoints: THREE.Vector3[] = [
    // North edge (inside arena)
    new THREE.Vector3(-400, 0, -350),
    new THREE.Vector3(-200, 0, -350),
    new THREE.Vector3(0, 0, -350),
    new THREE.Vector3(200, 0, -350),
    new THREE.Vector3(400, 0, -350),

    // South edge (inside arena)
    new THREE.Vector3(-400, 0, 350),
    new THREE.Vector3(-200, 0, 350),
    new THREE.Vector3(0, 0, 350),
    new THREE.Vector3(200, 0, 350),
    new THREE.Vector3(400, 0, 350),

    // West edge (inside arena)
    new THREE.Vector3(-550, 0, -200),
    new THREE.Vector3(-550, 0, -100),
    new THREE.Vector3(-550, 0, 0),
    new THREE.Vector3(-550, 0, 100),
    new THREE.Vector3(-550, 0, 200),

    // East edge (inside arena)
    new THREE.Vector3(550, 0, -200),
    new THREE.Vector3(550, 0, -100),
    new THREE.Vector3(550, 0, 0),
    new THREE.Vector3(550, 0, 100),
    new THREE.Vector3(550, 0, 200),

    // Corner positions (inside arena)
    new THREE.Vector3(-450, 0, -300),
    new THREE.Vector3(450, 0, -300),
    new THREE.Vector3(-450, 0, 300),
    new THREE.Vector3(450, 0, 300),
  ];

  constructor() {
    this.validateSpawnPoints();
    this.startNextWave();
  }

  private validateSpawnPoints(): void {
    // Ensure all spawn points are within arena bounds
    const maxX = GAME_CONFIG.ARENA.WIDTH / 2 - 50; // 50 unit buffer from wall
    const maxZ = GAME_CONFIG.ARENA.HEIGHT / 2 - 50; // 50 unit buffer from wall

    this.spawnPoints = this.spawnPoints.filter((point) => {
      const isValid = Math.abs(point.x) <= maxX && Math.abs(point.z) <= maxZ;
      if (!isValid) {
        console.warn(`Invalid spawn point removed: ${point.x}, ${point.z}`);
      }
      return isValid;
    });

    console.log(`Validated ${this.spawnPoints.length} spawn points`);
  }

  update(deltaTime: number, enemies: Enemy[], scene: THREE.Scene): void {
    if (!this.waveActive) {
      // Check if it's time to start the next wave
      const currentTime = Date.now();
      if (
        this.currentWaveConfig &&
        currentTime - this.waveCompleteTime >=
          this.currentWaveConfig.waveDelay * 1000
      ) {
        this.startNextWave();
      }
      return;
    }

    // Check if wave is complete
    if (
      this.enemiesSpawned >= this.currentWaveConfig!.enemyCount &&
      enemies.length === 0
    ) {
      this.completeWave();
    }
  }

  private startNextWave(): void {
    this.currentWave++;
    this.currentWaveConfig = this.generateWaveConfig(this.currentWave);
    this.enemiesRemaining = this.currentWaveConfig.enemyCount;
    this.enemiesSpawned = 0;
    this.waveActive = true;
    this.lastSpawnTime = Date.now();

    console.log(
      `Starting Wave ${this.currentWave} - ${this.enemiesRemaining} enemies`
    );
  }

  private generateWaveConfig(waveNumber: number): WaveConfig {
    // Base configuration
    let baseEnemyCount = 4;
    let spawnDelay = 2.0; // seconds

    // Increase difficulty with each wave
    const enemyCount = baseEnemyCount + Math.floor(waveNumber * 1.5);
    const adjustedSpawnDelay = Math.max(0.5, spawnDelay - waveNumber * 0.1);

    // For now, only grunt enemies (will expand later)
    const enemyTypes: { type: EnemyType; count: number }[] = [
      { type: "grunt", count: enemyCount },
    ];

    return {
      waveNumber,
      enemyCount,
      enemyTypes,
      spawnDelay: adjustedSpawnDelay,
      waveDelay: 3.0, // 3 seconds between waves
    };
  }

  getSpawnedEnemy(scene: THREE.Scene): Enemy | null {
    if (!this.currentWaveConfig) return null;

    const currentTime = Date.now();
    const timeSinceLastSpawn = (currentTime - this.lastSpawnTime) / 1000;

    if (
      timeSinceLastSpawn >= this.currentWaveConfig.spawnDelay &&
      this.enemiesSpawned < this.currentWaveConfig.enemyCount
    ) {
      // Choose random spawn point
      const spawnPoint = this.getValidSpawnPoint();

      if (!spawnPoint) {
        console.error("No valid spawn points available!");
        return null;
      }

      // Add smaller random offset to avoid exact same positions
      const randomOffset = new THREE.Vector3(
        (Math.random() - 0.5) * 50, // Reduced from 100 to 50
        0,
        (Math.random() - 0.5) * 50
      );

      const finalSpawnPoint = spawnPoint.clone().add(randomOffset);

      // Ensure final position is still within bounds
      finalSpawnPoint.x = Math.max(
        -GAME_CONFIG.ARENA.WIDTH / 2 + 40,
        Math.min(GAME_CONFIG.ARENA.WIDTH / 2 - 40, finalSpawnPoint.x)
      );
      finalSpawnPoint.z = Math.max(
        -GAME_CONFIG.ARENA.HEIGHT / 2 + 40,
        Math.min(GAME_CONFIG.ARENA.HEIGHT / 2 - 40, finalSpawnPoint.z)
      );

      // Create enemy
      const enemy = new Enemy(finalSpawnPoint, "grunt");
      this.enemiesSpawned++;
      this.lastSpawnTime = currentTime;

      console.log(
        `Spawned enemy ${this.enemiesSpawned}/${
          this.currentWaveConfig.enemyCount
        } at wave ${this.currentWave} at position (${finalSpawnPoint.x.toFixed(
          1
        )}, ${finalSpawnPoint.z.toFixed(1)})`
      );

      return enemy;
    }

    return null;
  }

  private getValidSpawnPoint(): THREE.Vector3 | null {
    if (this.spawnPoints.length === 0) {
      console.error("No spawn points available!");
      return null;
    }

    // Select random spawn point
    const randomIndex = Math.floor(Math.random() * this.spawnPoints.length);
    return this.spawnPoints[randomIndex];
  }

  private completeWave(): void {
    this.waveActive = false;
    this.waveCompleteTime = Date.now();
    console.log(`Wave ${this.currentWave} completed!`);
  }

  getCurrentWave(): number {
    return this.currentWave;
  }

  isWaveActive(): boolean {
    return this.waveActive;
  }

  getWaveProgress(): { spawned: number; total: number } {
    return {
      spawned: this.enemiesSpawned,
      total: this.currentWaveConfig?.enemyCount || 0,
    };
  }

  getTimeUntilNextWave(): number {
    if (this.waveActive) return 0;

    const currentTime = Date.now();
    const timeElapsed = (currentTime - this.waveCompleteTime) / 1000;
    const waveDelay = this.currentWaveConfig?.waveDelay || 3;

    return Math.max(0, waveDelay - timeElapsed);
  }

  // Debug method to visualize spawn points (optional)
  visualizeSpawnPoints(scene: THREE.Scene): void {
    this.spawnPoints.forEach((point, index) => {
      const geometry = new THREE.SphereGeometry(5, 8, 8);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.5,
      });
      const marker = new THREE.Mesh(geometry, material);
      marker.position.copy(point);
      marker.name = `spawnPoint_${index}`;
      scene.add(marker);
    });
    console.log(
      `Added ${this.spawnPoints.length} spawn point markers to scene`
    );
  }
}
