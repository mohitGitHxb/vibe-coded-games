import * as THREE from "three";
import { GameScene } from "./Scene.js";
import { FPSCamera } from "./Camera.js";
import { PhysicsWorld } from "./Physics.js";
import { Player } from "../player/Player.js";
import { BulletSystem } from "../utils/BulletSystem.js";
import { EnemyManager } from "../enemies/EnemyManager.js";
import { GameUI } from "../ui/GameUI.js";
import { AudioManager } from "../audio/AudioManager.js";
import type { GameState } from "../types/GameTypes.js";
import { GAME_CONFIG } from "../utils/GameConfig.js";

export class Game {
  private scene: GameScene;
  private camera: FPSCamera;
  private physics: PhysicsWorld;
  private player: Player;
  private bulletSystem: BulletSystem;
  private enemyManager: EnemyManager;
  private gameUI: GameUI;
  private audioManager: AudioManager;
  private gameState: GameState;
  private animationId: number | null = null;
  private clock: THREE.Clock;
  private isInitialized: boolean = false;
  private enemiesKilled: number = 0;
  private lastFootstepTime: number = 0;
  private lowAmmoWarningPlayed: boolean = false;

  constructor() {
    this.scene = new GameScene();
    this.camera = new FPSCamera();
    this.physics = new PhysicsWorld();
    this.player = new Player();
    this.clock = new THREE.Clock();
    this.gameUI = new GameUI();
    this.audioManager = new AudioManager();

    this.bulletSystem = new BulletSystem(this.scene.scene, this.physics.world);
    this.enemyManager = new EnemyManager(
      this.scene.scene,
      this.physics.world,
      this.scene.getAssetLoader()
    );

    this.gameState = {
      isPlaying: false,
      isPaused: false,
      gameTime: 0,
      score: 0,
      playerHealth: 100,
    };
  }

  public async initialize(): Promise<void> {
    console.log("Initializing Combat Zone...");

    try {
      // Initialize audio system FIRST
      console.log("🎵 Initializing audio...");
      await this.audioManager.initialize();
      console.log("✅ Audio initialization complete");

      // Load assets (with fallbacks for missing models)
      await this.scene.loadAssets();

      // Load and setup weapon model
      try {
        const weaponModel = await this.scene
          .getAssetLoader()
          .loadModel("/Assault_Rifle.glb", "rifle");
        this.player.setWeaponModel(weaponModel, this.camera.camera);
        console.log("Weapon model loaded and attached");
      } catch (error) {
        console.warn("Could not load weapon model, using placeholder");
      }

      // Add player physics body to physics world
      this.physics.addBody(this.player.physicsBody);

      // Position camera in the center of the arena at player height
      this.camera.setPosition(0, 1.8, 0);

      // Start rendering immediately to show the scene
      this.isInitialized = true;
      this.startRenderLoop();

      console.log("Game initialized successfully!");
      this.showStartMessage();
    } catch (error) {
      console.error("Failed to initialize game:", error);
      throw error;
    }
  }

  private startRenderLoop(): void {
    const renderLoop = () => {
      if (!this.isInitialized) return;

      // Always render the scene
      this.scene.renderer.render(this.scene.scene, this.camera.camera);
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
  }

  private showStartMessage(): void {
    const startDiv = document.createElement("div");
    startDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.95);
        color: white;
        padding: 30px;
        border-radius: 15px;
        text-align: center;
        font-family: 'Courier New', monospace;
        z-index: 1000;
        border: 3px solid #00ff00;
        max-width: 600px;
      ">
        <h1 style="color: #00ff00; margin: 0 0 20px 0; text-shadow: 2px 2px 4px black;">🎯 COMBAT ZONE</h1>
        <div style="margin-bottom: 20px; font-size: 16px; line-height: 1.6;">
          <p>⚔️ <strong>Arena loaded and weapon systems online!</strong></p>
          <p>🤖 Enemy AI units will spawn and hunt you down!</p>
          <p>🎯 Your mission: Survive as long as possible!</p>
          <p>🔊 <strong>Audio systems armed and ready!</strong></p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin: 20px 0; font-size: 14px;">
          <div style="text-align: left;">
            <strong style="color: #ffff00;">🎮 CONTROLS:</strong><br>
            WASD - Move<br>
            Mouse - Look Around<br>
            Space - Jump<br>
            Shift - Sprint
          </div>
          <div style="text-align: right;">
            <strong style="color: #ffff00;">🔫 COMBAT:</strong><br>
            Left Click - Shoot<br>
            R - Reload<br>
            Aim for headshots!<br>
            Watch your ammo!
          </div>
        </div>
        
        <div style="margin: 20px 0; padding: 15px; background: rgba(255,0,0,0.1); border-radius: 5px;">
          <strong style="color: #ff4444;">⚠️ WARNING:</strong> Enemies get faster and more numerous over time!<br>
          Use cover wisely and keep moving to survive!
        </div>
        
        <div style="margin: 20px 0; padding: 10px; background: rgba(0,255,0,0.1); border-radius: 5px;">
          <strong style="color: #00ff00;">🔊 AUDIO TIP:</strong> Enable sound for the full combat experience!<br>
          Procedural audio effects will enhance your battlefield awareness.
        </div>
        
        <button id="startGame" style="
          padding: 15px 30px;
          font-size: 18px;
          background: linear-gradient(45deg, #00ff00, #004400);
          color: white;
          border: 2px solid #00ff00;
          border-radius: 10px;
          cursor: pointer;
          font-family: inherit;
          font-weight: bold;
          text-shadow: 1px 1px 2px black;
          transition: all 0.3s ease;
        ">🚀 BEGIN MISSION</button>
      </div>
    `;

    document.body.appendChild(startDiv);

    document
      .getElementById("startGame")
      ?.addEventListener("click", async () => {
        document.body.removeChild(startDiv);
        // Enable audio context on user interaction
        await this.audioManager.enableAudio();
        this.startGame();
      });
  }

  private startGame(): void {
    this.gameState.isPlaying = true;
    this.gameState.gameTime = 0;
    this.enemiesKilled = 0;
    this.lowAmmoWarningPlayed = false;

    // Start ambient audio
    this.audioManager.startAmbient();

    this.clock.start();
    this.gameLoop();
  }

  private gameLoop(): void {
    if (!this.gameState.isPlaying) return;

    const deltaTime = this.clock.getDelta();
    this.gameState.gameTime += deltaTime;

    this.update(deltaTime);
    this.updateUI();
    this.updateAudio();

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(deltaTime: number): void {
    // Update physics world
    this.physics.step(deltaTime);

    // Update player
    const cameraRotation = this.camera.getRotation();
    this.player.update(
      deltaTime,
      cameraRotation,
      this.camera.camera,
      this.scene.scene
    );

    // Check for enemy damage to player
    const enemyDamage = this.enemyManager.checkEnemyAttacks(
      this.player.getPosition()
    );
    if (enemyDamage > 0) {
      this.player.takeDamage(enemyDamage);
      this.gameUI.showDamageEffect();
      this.audioManager.playSound("playerDamage");
    }

    // Update enemy manager
    this.enemyManager.update(
      deltaTime,
      this.player.getPosition(),
      this.gameState.gameTime
    );

    // Handle weapon firing
    this.handleWeaponFiring();

    // Update camera position to follow player
    const playerPosition = this.player.getPosition();
    this.camera.setPosition(
      playerPosition.x,
      playerPosition.y + 0.6, // Camera offset from player center
      playerPosition.z
    );

    // Update game state
    this.gameState.playerHealth = this.player.getState().health;

    // Check for game over
    if (this.player.isDead()) {
      this.gameOver();
    }
  }

  private updateAudio(): void {
    // Play footstep sounds when moving
    const input = this.player.getInput();
    const movementVector = input.getMovementVector();
    const isMoving = movementVector.x !== 0 || movementVector.z !== 0;

    if (isMoving && this.gameState.gameTime - this.lastFootstepTime > 0.5) {
      this.audioManager.playSoundWithRandomization("footstep", 0.3);
      this.lastFootstepTime = this.gameState.gameTime;
    }

    // Low ammo warning
    const weapon = this.player.getWeapon();
    const currentAmmo = weapon.getCurrentAmmo();
    if (currentAmmo <= 5 && currentAmmo > 0 && !this.lowAmmoWarningPlayed) {
      this.audioManager.playSound("lowAmmo");
      this.lowAmmoWarningPlayed = true;
    }

    // Reset low ammo warning when reloaded
    if (currentAmmo > 10) {
      this.lowAmmoWarningPlayed = false;
    }
  }

  private updateUI(): void {
    const playerState = this.player.getState();
    const weaponState = this.player.getWeapon();

    // Update HUD elements
    this.gameUI.updateHealth(playerState.health, GAME_CONFIG.PLAYER_HEALTH);
    this.gameUI.updateAmmo(
      weaponState.getCurrentAmmo(),
      weaponState.getMaxAmmo()
    );
    this.gameUI.updateScore(this.gameState.score);
    this.gameUI.updateTimer(this.gameState.gameTime);
    this.gameUI.updateEnemyCount(this.enemyManager.getAliveEnemyCount());

    // Show/hide reload indicator
    if (weaponState.isCurrentlyReloading()) {
      this.gameUI.showReloadIndicator();
    } else {
      this.gameUI.hideReloadIndicator();
    }

    // Update minimap
    const playerPos = this.player.getPosition();
    const enemyPositions = this.enemyManager.getEnemyPositions();
    this.gameUI.updateMinimap(
      { x: playerPos.x, z: playerPos.z },
      enemyPositions.map((pos) => ({ x: pos.x, z: pos.z })),
      GAME_CONFIG.ARENA_SIZE
    );
  }

  private handleWeaponFiring(): void {
    const weapon = this.player.getWeapon();
    const input = this.player.getInput();

    if (input.isShooting() && weapon.canFire()) {
      const isMoving =
        input.getMovementVector().x !== 0 || input.getMovementVector().z !== 0;
      const ray = weapon.fire(this.camera.camera, this.scene.scene, isMoving);

      if (ray) {
        // Play gunshot sound with slight randomization
        this.audioManager.playSoundWithRandomization("gunshot", 0.15);

        // Check for enemy hits first
        const enemyHit = this.enemyManager.checkBulletHits(ray, 50); // 50 damage per shot

        if (enemyHit.hit) {
          this.gameState.score += 100; // Points for hitting enemy
          this.audioManager.playSoundWithRandomization("enemyHit", 0.2);

          if (enemyHit.enemyId) {
            // Check if enemy died for bonus points
            const enemy = this.enemyManager
              .getAllEnemies()
              .find((e) => e.id === enemyHit.enemyId);
            if (enemy && enemy.isDead()) {
              this.gameState.score += 200; // Bonus for kill
              this.enemiesKilled++;
              this.audioManager.playSoundWithRandomization("enemyDeath", 0.3);
            }
          }
          console.log(`Score: ${this.gameState.score}`);
        } else {
          // Check for wall/environment hits
          const hit = this.bulletSystem.raycast(ray);
          if (hit) {
            this.bulletSystem.createImpactEffect(hit.point, hit.normal);
            // Could add ricochet sound here
          }
        }
      }
    }

    // Handle reload sound
    if (
      input.isReloading() &&
      !weapon.isCurrentlyReloading() &&
      weapon.needsReload()
    ) {
      this.audioManager.playSound("reload", 0.5);
    }
  }

  private gameOver(): void {
    this.gameState.isPlaying = false;

    // Stop ambient audio and play game over sound
    this.audioManager.stopAmbient();
    this.audioManager.playSound("gameOver");

    // Show enhanced game over screen with stats
    this.gameUI.showGameOverScreen({
      survivalTime: this.gameState.gameTime,
      score: this.gameState.score,
      enemiesKilled: this.enemiesKilled,
    });

    console.log(
      `Game Over! Survived: ${Math.floor(this.gameState.gameTime)}s, Score: ${
        this.gameState.score
      }, Kills: ${this.enemiesKilled}`
    );
  }

  public destroy(): void {
    this.isInitialized = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.enemyManager.cleanup();
    this.gameUI.cleanup();
    this.audioManager.cleanup();
    this.scene.renderer.dispose();
  }
}
