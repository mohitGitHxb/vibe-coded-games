import * as THREE from "three";
import { Player } from "../entities/Player";
import { Enemy } from "../entities/Enemy";
import { Projectile } from "../entities/Projectile";
import { InputSystem } from "../systems/InputSystem";
import { CollisionSystem } from "../systems/CollisionSystem";
import { WaveSystem } from "../systems/WaveSystem";
import { Arena } from "../world/Arena";
import { HUD } from "../ui/HUD";
import { AssetManager } from "../managers/AssetManager";

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;

  // Systems
  private inputSystem: InputSystem;
  private collisionSystem: CollisionSystem;
  private waveSystem: WaveSystem;
  private hud: HUD;
  private assetManager: AssetManager;

  // Entities
  private player: Player;
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];

  // Game state
  private gameRunning: boolean = true;
  private score: number = 0;
  private assetsLoaded: boolean = false;

  constructor() {
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.initializeSystems();
    this.setupRenderer();
    this.setupCamera();
    this.setupLighting();
    this.createWorld();
    this.preloadAssets();
    this.setupWindowResize();

    this.start();
  }

  private initializeSystems(): void {
    this.inputSystem = new InputSystem();
    this.collisionSystem = new CollisionSystem();
    this.waveSystem = new WaveSystem();
    this.hud = new HUD();
    this.assetManager = AssetManager.getInstance();
  }

  private async preloadAssets(): Promise<void> {
    console.log("Preloading game assets...");

    const assetsToLoad = [
      { path: "/character-h.glb", name: "player" },
      // Add more assets here as needed
      // { path: '/enemy-model.glb', name: 'enemy' },
    ];

    try {
      await this.assetManager.preloadAssets(assetsToLoad);
      console.log("Assets preloaded successfully");
    } catch (error) {
      console.warn("Some assets failed to preload:", error);
    }

    this.assetsLoaded = true;
    this.spawnPlayer();
  }

  private setupRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x1a1a2e);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const appElement = document.querySelector<HTMLDivElement>("#app")!;
    appElement.innerHTML = "";
    appElement.appendChild(this.renderer.domElement);
  }

  private setupCamera(): void {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 1000;

    this.camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      1,
      1000
    );

    this.camera.position.set(0, 500, 0);
    this.camera.lookAt(0, 0, 0);
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(200, 400, 200);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    this.scene.add(directionalLight);
  }

  private createWorld(): void {
    new Arena(this.scene);
  }

  private spawnPlayer(): void {
    if (!this.assetsLoaded) return;

    this.player = new Player();
    this.scene.add(this.player.mesh);
    console.log("Player spawned");
  }

  private setupWindowResize(): void {
    window.addEventListener("resize", () => {
      const aspect = window.innerWidth / window.innerHeight;
      const frustumSize = 1000;

      this.camera.left = (frustumSize * aspect) / -2;
      this.camera.right = (frustumSize * aspect) / 2;
      this.camera.top = frustumSize / 2;
      this.camera.bottom = frustumSize / -2;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }
  private update(deltaTime: number): void {
    if (!this.gameRunning || !this.player) return;

    this.updatePlayer(deltaTime);
    this.updateWaves(deltaTime);
    this.updateEnemies(deltaTime);
    this.updateProjectiles(deltaTime);
    this.handleCollisions();
    this.updateHUD();
    this.cleanupEntities();
    this.checkGameState();
  }

  private updatePlayer(deltaTime: number): void {
    if (this.player.isDead()) return;

    const input = this.inputSystem.getInputState();

    // Movement
    const moveVector = new THREE.Vector3();
    if (this.inputSystem.isKeyPressed("keyw")) moveVector.z -= 1;
    if (this.inputSystem.isKeyPressed("keys")) moveVector.z += 1;
    if (this.inputSystem.isKeyPressed("keya")) moveVector.x -= 1;
    if (this.inputSystem.isKeyPressed("keyd")) moveVector.x += 1;

    this.player.move(moveVector, deltaTime);
    this.player.update(deltaTime);

    // Aiming
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(input.mousePosition, this.camera);
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const intersectionPoint = new THREE.Vector3();

    if (raycaster.ray.intersectPlane(groundPlane, intersectionPoint)) {
      this.player.aimAt(intersectionPoint);
    }

    // Shooting
    if (input.isMouseDown && this.player.canShoot()) {
      this.playerShoot();
      this.player.recordShot();
    }
  }

  private updateWaves(deltaTime: number): void {
    this.waveSystem.update(deltaTime, this.enemies, this.scene);

    // Check for new enemy spawns
    const newEnemy = this.waveSystem.getSpawnedEnemy(this.scene);
    if (newEnemy) {
      this.enemies.push(newEnemy);
      this.scene.add(newEnemy.mesh);
    }
  }

  private updateEnemies(deltaTime: number): void {
    this.enemies.forEach((enemy) => {
      const shouldShoot = enemy.update(deltaTime, this.player.position);

      if (shouldShoot) {
        this.enemyShoot(enemy);
      }
    });
  }

  private updateProjectiles(deltaTime: number): void {
    this.projectiles.forEach((projectile) => {
      projectile.update(deltaTime);
    });
  }

  private playerShoot(): void {
    const bulletPosition = this.player.getMuzzleWorldPosition();
    const direction = this.player.getShootDirection();
    const projectile = new Projectile(bulletPosition, direction, 25, "player");
    this.projectiles.push(projectile);
    this.scene.add(projectile.mesh);
  }

  private enemyShoot(enemy: Enemy): void {
    const direction = enemy.getShootDirection(this.player.position);
    const bulletPosition = enemy.position.clone();
    bulletPosition.y = 25;

    const projectile = new Projectile(
      bulletPosition,
      direction,
      enemy.damage,
      "enemy"
    );
    this.projectiles.push(projectile);
    this.scene.add(projectile.mesh);
  }

  private handleCollisions(): void {
    // Store original lengths to detect hits
    const originalEnemyCount = this.enemies.length;

    this.collisionSystem.checkProjectileEnemyCollisions(
      this.projectiles,
      this.enemies
    );

    // Check for player damage and show damage indicator
    this.collisionSystem.checkProjectilePlayerCollisions(
      this.projectiles,
      this.player
    );

    // Show damage indicator if player was hit
    if (
      this.projectiles.some((p) => p.owner === "enemy" && p.shouldBeDestroyed())
    ) {
      this.hud.showDamageIndicator();
    }

    // Check if enemies were destroyed for scoring
    const enemiesDestroyed =
      originalEnemyCount -
      this.enemies.filter((e) => !e.shouldBeDestroyed()).length;
    if (enemiesDestroyed > 0) {
      this.addScore(enemiesDestroyed * 100); // 100 points per enemy
    }
  }

  private updateHUD(): void {
    // Health display
    this.hud.updateHealth(Math.ceil(this.player.health), this.player.maxHealth);

    // Wave information
    this.hud.updateWave(this.waveSystem.getCurrentWave());
    this.hud.updateEnemyCount(this.enemies.length);

    // Wave progress
    const waveProgress = this.waveSystem.getWaveProgress();
    this.hud.updateWaveProgress(waveProgress.spawned, waveProgress.total);

    // Next wave timer
    const timeUntilNextWave = this.waveSystem.getTimeUntilNextWave();
    if (timeUntilNextWave > 0) {
      this.hud.showNextWaveTimer(timeUntilNextWave);
    } else {
      this.hud.showNextWaveTimer(0);
    }

    // Health effects
    const healthBar = document.querySelector(".health-fill") as HTMLElement;
    if (healthBar) {
      if (this.player.isHealthRegenerating()) {
        healthBar.classList.add("regenerating");
      } else {
        healthBar.classList.remove("regenerating");
      }
    }

    // Low health warning
    const healthBarContainer = document.querySelector(
      ".health-bar"
    ) as HTMLElement;
    if (healthBarContainer) {
      if (this.player.getHealthPercentage() < 0.3) {
        healthBarContainer.classList.add("low-health");
      } else {
        healthBarContainer.classList.remove("low-health");
      }
    }
  }

  private addScore(points: number): void {
    this.score += points;
    this.hud.addScore(points);
  }

  private checkGameState(): void {
    if (this.player.isDead()) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    this.gameRunning = false;
    console.log("Game Over! Final Score:", this.score);
    console.log("Waves Survived:", this.waveSystem.getCurrentWave());
    // TODO: Implement game over screen
  }

  private cleanupEntities(): void {
    // Clean up projectiles
    this.projectiles = this.projectiles.filter((projectile) => {
      if (projectile.shouldBeDestroyed()) {
        projectile.destroy();
        return false;
      }
      return true;
    });

    // Clean up enemies
    this.enemies = this.enemies.filter((enemy) => {
      if (enemy.shouldBeDestroyed()) {
        enemy.destroy();
        return false;
      }
      return true;
    });
  }

  private start(): void {
    this.animate();
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());

    const deltaTime = this.clock.getDelta();
    this.update(deltaTime);
    this.renderer.render(this.scene, this.camera);
  }
}
