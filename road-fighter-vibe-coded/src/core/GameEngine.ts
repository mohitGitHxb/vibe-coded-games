import * as THREE from "three";
import { GameState, type GameScore } from "../types/GameTypes";
import { PlayerCar } from "../entities/PlayerCar";
import { InputManager } from "./InputManager";
import { CameraController } from "./CameraController";
import { RoadSystem } from "../systems/RoadSystem";
import { TrafficSystem } from "../systems/TrafficSystem";
import { CollisionSystem } from "../systems/CollisionSystem";
import { CheckpointSystem } from "../systems/CheckpointSystem";
import { Explosion } from "../entities/Explosion";
import { ScreenShake } from "../utils/ScreenShake";
import { HUD } from "../ui/HUD";
import { GAME_CONFIG } from "../utils/Constants";
import { PowerUpSystem, type PowerUpEffect } from "../systems/PowerUpSystem";
import { GameUI } from "../ui/GameUI";
import { AudioManager } from "../systems/AudioManager";

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private gameContainer: HTMLElement;
  private uiContainer: HTMLElement;
  private gameState: GameState = GameState.MAIN_MENU;
  private isRunning: boolean = false;

  // Game entities
  private playerCar: PlayerCar | null = null;
  private inputManager: InputManager;
  private cameraController: CameraController;
  private roadSystem: RoadSystem | null = null;
  private trafficSystem: TrafficSystem | null = null;
  private collisionSystem: CollisionSystem;
  private checkpointSystem: CheckpointSystem | null = null;
  private screenShake: ScreenShake;
  private hud: HUD | null = null;
  private powerUpSystem: PowerUpSystem | null = null;
  private gameUI: GameUI | null = null;

  // Game state
  private playerLives: number = GAME_CONFIG.PLAYER_LIVES;
  private respawnTimer: number = 0;
  private isInvulnerable: boolean = false;
  private invulnerabilityTimer: number = 0;

  // Power-up state tracking
  private speedBoostTimer: number = 0;
  private invincibilityBoostTimer: number = 0;
  private originalPlayerSpeed: number = GAME_CONFIG.LEVEL_1_SPEED;

  // Level progression
  private currentLevel: number = 1;
  private gameScore: GameScore = {
    level: 1,
    time: 0,
    lives: GAME_CONFIG.PLAYER_LIVES,
    collisions: 0,
    powerUpsCollected: 0,
  };
  private levelTransitionTimer: number = 0;
  private totalGameTime: number = 0;

  // Timing
  private lastTime: number = 0;
  // Add to existing properties
  private audioManager: AudioManager;
  constructor(container: HTMLElement, uiContainer: HTMLElement) {
    console.log("GameEngine constructor called with:", {
      container,
      uiContainer,
    });

    if (!container) {
      throw new Error("Game container element is required");
    }
    if (!uiContainer) {
      throw new Error("UI container element is required");
    }

    this.gameContainer = container;
    this.uiContainer = uiContainer;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    this.inputManager = new InputManager();
    this.cameraController = new CameraController(this.camera);
    this.collisionSystem = new CollisionSystem();
    this.screenShake = new ScreenShake(this.camera);
    this.audioManager = new AudioManager();
    this.initialize();
  }

  private initialize(): void {
    console.log("Initializing game engine...");

    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x87ceeb);
    this.gameContainer.appendChild(this.renderer.domElement);

    // Setup camera for pure top-down view
    this.camera.position.set(0, 50, 0);
    this.camera.lookAt(0, 0, 0);
    this.camera.up.set(0, 0, -1);

    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 20, 10);
    this.scene.add(directionalLight);

    // Create game systems
    try {
      this.roadSystem = new RoadSystem(this.scene);
      this.trafficSystem = new TrafficSystem(this.scene);
      this.checkpointSystem = new CheckpointSystem(
        this.scene,
        this.currentLevel
      );
      this.powerUpSystem = new PowerUpSystem(this.scene);
      this.hud = new HUD(this.uiContainer);
      this.gameUI = new GameUI(this.uiContainer);
      this.createPlayerCar();

      console.log("Game engine initialized successfully");
    } catch (error) {
      console.error("Failed to initialize game systems:", error);
      throw error;
    }

    // Handle window resize
    window.addEventListener("resize", this.onWindowResize.bind(this));
  }

  private createPlayerCar(): void {
    console.log("Creating player car...");
    this.playerCar = new PlayerCar(this.scene);
    console.log(
      "Player car created at position:",
      this.playerCar.getPosition()
    );
  }

  public start(): void {
    console.log("Starting game...");
    this.isRunning = true;
    this.gameState = GameState.RACING;
    this.lastTime = performance.now();

    // Resume audio context and start V12 engine sound
    this.audioManager.resumeAudio().then(() => {
      this.audioManager.startEngineSound();
      // No background music - just pure V12 engine roar!
    });

    this.gameLoop(performance.now());
    console.log("🏁 Road Fighter Clone started!");
  }
  private gameLoop = (currentTime: number): void => {
    if (!this.isRunning) return;

    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame(this.gameLoop);
  };

  private update(deltaTime: number): void {
    this.totalGameTime += deltaTime;
    this.gameScore.time = this.totalGameTime;

    // Handle level transition
    if (this.gameState === GameState.LEVEL_TRANSITION) {
      this.levelTransitionTimer -= deltaTime;
      if (this.levelTransitionTimer <= 0) {
        this.startLevel(this.currentLevel);
      }
      return;
    }

    // Handle respawn timer
    if (this.gameState === GameState.DESTROYED) {
      this.respawnTimer -= deltaTime;
      if (this.respawnTimer <= 0) {
        this.respawnPlayer();
      }
      return;
    }

    // Handle invulnerability
    if (this.isInvulnerable) {
      this.invulnerabilityTimer -= deltaTime;
      if (this.invulnerabilityTimer <= 0) {
        this.isInvulnerable = false;
        if (this.playerCar) {
          this.playerCar.mesh.visible = true;
        }
      } else {
        if (this.playerCar) {
          this.playerCar.mesh.visible =
            Math.floor(this.invulnerabilityTimer * 10) % 2 === 0;
        }
      }
    }

    // Handle power-up effects
    this.updatePowerUpEffects(deltaTime);

    if (this.playerCar && this.gameState === GameState.RACING) {
      const steeringInput = this.inputManager.getSteeringInput();
      this.playerCar.setSteeringInput(steeringInput);
      this.audioManager.updateEngineSound(this.playerCar.speed);
      this.playerCar.update(deltaTime);

      const playerPosition = this.playerCar.getPosition();

      // Update camera
      this.cameraController.followTarget(playerPosition);
      this.screenShake.update(this.camera.position);

      // Update power-up system
      if (this.powerUpSystem) {
        const powerUpEffect = this.powerUpSystem.update(
          deltaTime,
          playerPosition.z,
          this.playerCar
        );
        if (powerUpEffect) {
          this.handlePowerUpCollection(powerUpEffect);
        }
      }

      // Update road system
      if (this.roadSystem) {
        this.roadSystem.update(playerPosition.z);
      }

      // Update traffic system
      if (this.trafficSystem) {
        this.trafficSystem.update(deltaTime, playerPosition.z, this.playerCar);
      }

      // Update checkpoint system
      if (this.checkpointSystem) {
        const checkpointResult = this.checkpointSystem.update(
          deltaTime,
          this.playerCar
        );

        switch (checkpointResult) {
          case "checkpoint":
            this.hud?.showSideMessage("CHECKPOINT!", 1500);
            this.audioManager.playCheckpointSound(); // Add audio
            break;
          case "timeout":
            this.handleTimeOut();
            break;
          case "level_complete":
            this.handleLevelComplete();
            break;
        }
      }

      // Update HUD
      if (this.hud && this.checkpointSystem) {
        this.hud.updateTimer(this.checkpointSystem.getRemainingTime());
        this.hud.updateLives(this.playerLives);
        this.hud.updateCheckpoint(
          this.checkpointSystem.getCurrentCheckpointName()
        );
        this.hud.updateSpeed(this.playerCar.speed);
        this.hud.updateLevel(this.currentLevel);
      }

      // Check collisions (only if not invulnerable from power-up or respawn)
      const totalInvulnerability =
        this.isInvulnerable || this.invincibilityBoostTimer > 0;
      if (!totalInvulnerability) {
        const collisionResult = this.collisionSystem.checkProximityCollision(
          this.playerCar,
          this.trafficSystem?.getAllCars() || []
        );

        if (collisionResult.hasCollision) {
          this.handleCollision(collisionResult.collisionPoint!);
        }
      }
    }
  }
  private handleCollision(collisionPoint: THREE.Vector3): void {
    console.log("💥 COLLISION!");

    // Update score
    this.gameScore.collisions++;

    // Play collision sounds
    this.audioManager.playCollisionSound();
    setTimeout(() => {
      this.audioManager.playExplosionSound();
    }, 200);

    new Explosion(this.scene, collisionPoint);
    this.screenShake.shake(3, 0.8);

    this.playerLives--;
    this.gameScore.lives = this.playerLives;
    console.log(`Lives remaining: ${this.playerLives}`);

    if (this.playerLives <= 0) {
      this.gameState = GameState.GAME_OVER;
      this.hud?.showMessage("GAME OVER!", 5000);
      this.audioManager.stopEngineSound();
      this.audioManager.playGameOverSound();
      console.log("💀 GAME OVER!");
    } else {
      this.gameState = GameState.DESTROYED;
      this.respawnTimer = GAME_CONFIG.RESPAWN_TIME;

      if (this.playerCar) {
        this.playerCar.mesh.visible = false;
      }
    }
  }

  private handleTimeOut(): void {
    console.log("⏰ TIME UP!");
    this.gameState = GameState.GAME_OVER;
    this.hud?.showMessage("TIME UP! GAME OVER!", 5000);
  }

  private handleLevelComplete(): void {
    console.log("🏆 LEVEL COMPLETE!");

    // Play level complete sound
    this.audioManager.playLevelCompleteSound();

    if (this.currentLevel === 1) {
      // Go to Level 2
      this.currentLevel = 2;
      this.gameScore.level = 2;
      this.gameState = GameState.LEVEL_TRANSITION;
      this.levelTransitionTimer = 3; // 3 second transition

      this.hud?.showMessage("LEVEL 1 COMPLETE!\nPreparing Level 2...", 3000);
      // Clean up current level
      if (this.checkpointSystem) {
        this.checkpointSystem.destroy();
        this.checkpointSystem = null;
      }
      if (this.trafficSystem) {
        this.trafficSystem.destroy();
        this.trafficSystem = new TrafficSystem(this.scene);
      }
    } else {
      // Game Complete!
      this.gameState = GameState.VICTORY;
      this.gameScore.lives = this.playerLives;
      this.audioManager.stopEngineSound();
      this.audioManager.playVictorySound();
      this.gameUI?.showVictoryScreen(this.gameScore);
      console.log("🎉 ALL LEVELS COMPLETED! VICTORY!");
    }
  }
  private startLevel(level: number): void {
    console.log(`Starting Level ${level}...`);

    // Create new checkpoint system for this level
    this.checkpointSystem = new CheckpointSystem(this.scene, level);

    // Update player car speed for level 2
    if (level === 2 && this.playerCar) {
      this.originalPlayerSpeed = GAME_CONFIG.LEVEL_2_SPEED;
      this.playerCar.speed = this.originalPlayerSpeed;
    }

    // Show level transition screen
    this.gameUI?.showLevelTransition(level).then(() => {
      this.gameState = GameState.RACING;
      this.hud?.showSideMessage(`LEVEL ${level}!`, 2000);

      // Start background music for new level
      this.audioManager.startEngineSound();
    });
  }

  private respawnPlayer(): void {
    console.log("🔄 Respawning player...");

    if (this.playerCar) {
      this.playerCar.mesh.position.x = 0;
      this.playerCar.mesh.visible = true;

      this.isInvulnerable = true;
      this.invulnerabilityTimer = GAME_CONFIG.INVULNERABILITY_TIME;
    }

    this.gameState = GameState.RACING;
  }

  private updatePowerUpEffects(deltaTime: number): void {
    // Handle speed boost
    if (this.speedBoostTimer > 0) {
      this.speedBoostTimer -= deltaTime;
      if (this.speedBoostTimer <= 0 && this.playerCar) {
        this.playerCar.speed = this.originalPlayerSpeed;
        this.hud?.showSideMessage("Speed Normal", 1000);
      }
    }

    // Handle invincibility boost
    if (this.invincibilityBoostTimer > 0) {
      this.invincibilityBoostTimer -= deltaTime;
      if (this.invincibilityBoostTimer <= 0) {
        this.hud?.showSideMessage("Vulnerable", 1000);
      }
    }
  }

  private handlePowerUpCollection(effect: PowerUpEffect): void {
    this.gameScore.powerUpsCollected++;
    // Play power-up sound
    this.audioManager.playPowerUpSound();
    // Use side message to avoid blocking view
    this.hud?.showSideMessage(effect.message, 1500);

    switch (effect.type) {
      case "speed_boost":
        if (this.playerCar) {
          this.playerCar.speed = this.originalPlayerSpeed * 1.5;
          this.speedBoostTimer = effect.duration;
        }
        break;

      case "invincibility":
        this.invincibilityBoostTimer = effect.duration;
        break;

      case "extra_life":
        this.playerLives = Math.min(
          this.playerLives + 1,
          GAME_CONFIG.MAX_LIVES
        );
        this.gameScore.lives = this.playerLives;
        break;

      case "time_bonus":
        if (this.checkpointSystem) {
          this.checkpointSystem.addTimeBonus(GAME_CONFIG.TIME_BONUS_SECONDS);
        }
        break;
    }
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private onWindowResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public destroy(): void {
    this.isRunning = false;
    this.renderer.dispose();
    this.audioManager.destroy();
    this.inputManager.destroy();
    if (this.playerCar) {
      this.playerCar.destroy();
    }
    if (this.roadSystem) {
      this.roadSystem.destroy();
    }
    if (this.trafficSystem) {
      this.trafficSystem.destroy();
    }
    if (this.checkpointSystem) {
      this.checkpointSystem.destroy();
    }
    if (this.powerUpSystem) {
      this.powerUpSystem.destroy();
    }
    window.removeEventListener("resize", this.onWindowResize.bind(this));
  }
}
