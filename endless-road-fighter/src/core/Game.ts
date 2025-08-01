import Stats from "stats.js";
import * as THREE from "three";
import { ParticleSystem } from "../effects/ParticleEffect";
import { Player } from "../entities/Player";
import { CameraSystem } from "../systems/CameraSystem";
import { InputSystem } from "../systems/InputSystem";
import { PowerUpSystem } from "../systems/PowerUpSystem";
import { TrafficSystem } from "../systems/TrafficSystem";
import { HUD } from "../ui/HUD";
import { GAME_CONFIG } from "../utils/Constants";
import { type GameState } from "../utils/Types";
import { RoadSystem } from "../world/RoadSystem";
import { Environment } from "../world/Environment";

export class Game {
  // Core Three.js components
  private scene!: THREE.Scene;
  private cameraSystem!: CameraSystem;
  private renderer!: THREE.WebGLRenderer;

  // Game systems
  private inputSystem!: InputSystem;
  private player!: Player;
  private roadSystem!: RoadSystem;
  private trafficSystem!: TrafficSystem;
  private powerUpSystem!: PowerUpSystem;
  private environment!: Environment;
  private particleSystem!: ParticleSystem;
  private hud!: HUD;

  // Game state
  private gameState!: GameState;

  // Timing
  private clock: THREE.Clock;
  private lastTime: number = 0;
  private fixedTimeStep: number = 1 / 60; // 60 FPS
  private maxSubSteps: number = 3;

  // Performance monitoring
  private stats: Stats;

  // Animation frame ID
  private animationId: number | null = null;

  constructor() {
    this.initializeGameState();
    this.clock = new THREE.Clock();
    this.stats = new Stats();
  }

  private initializeGameState(): void {
    this.gameState = {
      isPlaying: false,
      isPaused: false,
      isGameOver: false,
      speed: GAME_CONFIG.STARTING_SPEED,
      distance: 0,
      score: 0,
      lives: 3,
      currentLanes: 3,
      nextLanes: 3,
      isInTransition: false,
      transitionProgress: 0,
      trafficDensity: 0,

      // Power-up system properties (simplified - no fuel)
      activeEffects: {
        speedBoost: { active: false, timeRemaining: 0 },
        invincibility: { active: false, timeRemaining: 0 },
        scoreMultiplier: { active: false, timeRemaining: 0, multiplier: 1 },
      },
      currentScoreMultiplier: 1,
    };
  }

  public async init(): Promise<void> {
    await this.initRenderer();
    this.initCamera();
    this.initScene();
    this.initSystems();
    this.initPerformanceMonitor();
    this.setupEventListeners();

    console.log("Endless Road Fighter initialized with enhanced visuals!");
  }

  private async initRenderer(): Promise<void> {
    // Create renderer with enhanced settings
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });

    // Use window dimensions for responsive design
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer.setSize(width, height);
    this.renderer.setClearColor(GAME_CONFIG.COLORS.BACKGROUND, 1);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Enable advanced rendering features
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Add canvas to DOM
    const canvas = this.renderer.domElement;
    canvas.style.display = "block";
    canvas.style.position = "fixed";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.style.zIndex = "1";

    // Clear body and add canvas
    document.body.innerHTML = "";
    document.body.appendChild(canvas);

    console.log(`Enhanced renderer initialized: ${width}x${height}`);
  }

  private initCamera(): void {
    // Initialize enhanced camera system with effects
    this.cameraSystem = new CameraSystem();
  }

  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(GAME_CONFIG.COLORS.BACKGROUND, 30, 150);

    // Enhanced lighting setup
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);
    // City glow effect
    const cityGlow = new THREE.HemisphereLight(0x1a1a2e, 0xff6b6b, 0.3);
    this.scene.add(cityGlow);
    // Main directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(20, 50, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);

    // Additional rim lighting
    const rimLight = new THREE.DirectionalLight(0x0088ff, 0.3);
    rimLight.position.set(-20, 30, -20);
    this.scene.add(rimLight);

    console.log("Scene initialized with enhanced lighting");
  }

  private initSystems(): void {
    // Initialize input system
    this.inputSystem = new InputSystem();
    console.log("Input system initialized");

    // Initialize player
    this.player = new Player();
    this.scene.add(this.player.mesh);
    console.log("Player initialized and added to scene");

    // Initialize road system
    this.roadSystem = new RoadSystem();
    this.roadSystem.addToScene(this.scene);
    console.log("Road system initialized");

    // Initialize environment system
    this.environment = new Environment();
    this.environment.setScene(this.scene);
    this.environment.setCamera(this.cameraSystem.getCamera()); // Pass camera reference
    console.log("Environment system initialized");

    // Initialize traffic system
    this.trafficSystem = new TrafficSystem();
    this.trafficSystem.setScene(this.scene);
    console.log("Traffic system initialized");

    // Initialize power-up system
    this.powerUpSystem = new PowerUpSystem();
    this.powerUpSystem.setScene(this.scene);
    console.log("Power-up system initialized");

    // Initialize particle system
    this.particleSystem = new ParticleSystem(this.scene);
    console.log("Particle system initialized");

    // Initialize HUD
    this.hud = new HUD();
    this.hud.showInstructions();
    console.log("HUD initialized");
  }

  private initPerformanceMonitor(): void {
    this.stats.showPanel(0); // Show FPS panel
    this.stats.dom.style.position = "fixed";
    this.stats.dom.style.top = "10px";
    this.stats.dom.style.right = "10px";
    this.stats.dom.style.zIndex = "1000";
    document.body.appendChild(this.stats.dom);
  }

  private setupEventListeners(): void {
    // Start game on any key press
    const startGame = (event: KeyboardEvent) => {
      if (!this.gameState.isPlaying && !this.gameState.isGameOver) {
        console.log("Starting game...");
        this.gameState.isPlaying = true;
        window.removeEventListener("keydown", startGame);
      }
    };
    window.addEventListener("keydown", startGame);

    // Restart game on R key
    window.addEventListener("keydown", (event) => {
      if (event.code === "KeyR" && this.gameState.isGameOver) {
        this.restartGame();
      }
    });
  }

  private restartGame(): void {
    console.log("Restarting game...");

    // Reset game state
    this.initializeGameState();

    // Reset player position
    this.player.transform.position.set(0, 0.25, 0);
    this.player.setSpeed(GAME_CONFIG.STARTING_SPEED);

    // Clear traffic
    this.trafficSystem.dispose();
    this.trafficSystem = new TrafficSystem();
    this.trafficSystem.setScene(this.scene);

    // Clear power-ups
    this.powerUpSystem.dispose();
    this.powerUpSystem = new PowerUpSystem();
    this.powerUpSystem.setScene(this.scene);
    // Clear environment
    this.environment.dispose();
    this.environment = new Environment();
    this.environment.setScene(this.scene);

    // Clear particles
    this.particleSystem.dispose();
    this.particleSystem = new ParticleSystem(this.scene);

    // Start game
    this.gameState.isPlaying = true;

    console.log("Game restarted successfully!");
  }

  public start(): void {
    console.log("Enhanced game loop starting...");
    this.gameLoop();
  }

  private gameLoop(): void {
    this.animationId = requestAnimationFrame(() => this.gameLoop());

    this.stats.begin();

    const currentTime = this.clock.getElapsedTime();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Fixed timestep updates
    this.updateFixed(
      Math.min(deltaTime, this.fixedTimeStep * this.maxSubSteps)
    );

    // Always render (even when not playing to show initial state)
    this.render();

    this.stats.end();
  }

  private updateFixed(deltaTime: number): void {
    // Update particle system always (for visual effects)
    this.particleSystem.update(deltaTime);

    // Always update camera to show player, even when not playing
    this.updateCamera();

    if (!this.gameState.isPlaying || this.gameState.isPaused) {
      return;
    }

    let timeRemaining = deltaTime;

    while (timeRemaining > 0) {
      const dt = Math.min(timeRemaining, this.fixedTimeStep);
      this.updateGame(dt);
      timeRemaining -= dt;
    }
  }

  private updateGame(deltaTime: number): void {
    // Update power-up effects first
    this.powerUpSystem.updateActiveEffects(this.gameState, deltaTime);

    // Update player invincibility visual effect
    this.player.setInvincible(
      this.gameState.activeEffects.invincibility.active
    );

    // Get current input state
    const inputState = this.inputSystem.getInputState();

    // Update player with speed boost if active
    const speedMultiplier = this.powerUpSystem.getCurrentSpeedMultiplier(
      this.gameState
    );
    const originalMaxSpeed = this.player.physics.maxSpeed;
    this.player.physics.maxSpeed = this.gameState.speed * speedMultiplier;

    this.player.update(deltaTime, inputState);

    // Restore original max speed for game state calculations
    this.player.physics.maxSpeed = originalMaxSpeed;

    // Create exhaust particles from player - fixed position
    if (this.gameState.speed > GAME_CONFIG.STARTING_SPEED * 0.8) {
      const exhaustPosition = this.player.getPosition().clone();
      exhaustPosition.y -= 0.1;
      exhaustPosition.z -= 0.8; // Behind the car (negative Z offset)

      const exhaustVelocity = new THREE.Vector3(
        0,
        0,
        this.gameState.speed * 0.5
      ); // Positive velocity (but particles will move backward)
      this.particleSystem.createExhaustSmoke(exhaustPosition, exhaustVelocity);
    }

    // Create speed trail effect when boosted - fixed position
    if (this.gameState.activeEffects.speedBoost.active) {
      const trailPosition = this.player.getPosition().clone();
      trailPosition.y += 0.1;
      this.particleSystem.createSpeedTrail(trailPosition);
    }

    // Update game state
    this.updateGameState(deltaTime);

    // Update road system
    this.roadSystem.update(
      this.player.getPosition().z,
      this.gameState.distance
    );

    // Update environment system
    this.environment.update(this.player.getPosition().z);

    // Update player road bounds based on current road state
    const roadBounds = this.roadSystem.getCurrentPlayerBounds();
    this.player.setRoadBounds(roadBounds);

    // Update game state with road information
    const roadState = this.roadSystem.getCurrentRoadState();
    this.gameState.currentLanes = Math.round(
      roadState.currentWidth / GAME_CONFIG.LANE_WIDTH
    );
    this.gameState.isInTransition = roadState.isTransitioning;
    this.gameState.transitionProgress = roadState.transitionProgress;

    // Update traffic system
    this.trafficSystem.update(
      deltaTime,
      this.player.getPosition(),
      this.gameState.speed,
      this.gameState.currentLanes,
      this.gameState.distance
    );

    // Update power-up system
    this.powerUpSystem.update(
      deltaTime,
      this.player.getPosition(),
      this.gameState.currentLanes,
      this.gameState.distance
    );

    // Update traffic density in game state
    this.gameState.trafficDensity = this.trafficSystem.getTrafficDensity();

    // Check for collisions (only if not invincible)
    if (!this.gameState.activeEffects.invincibility.active) {
      const playerBounds = this.player.getBoundingBox();
      const collisionInfo = this.trafficSystem.checkCollisions(
        this.player.getPosition(),
        playerBounds
      );

      if (collisionInfo.hasCollision) {
        this.handleCollision(collisionInfo);
      }
    }

    // Check for power-up collections
    const playerBounds = this.player.getBoundingBox();
    const collectionInfo = this.powerUpSystem.checkCollections(
      this.player.getPosition(),
      playerBounds
    );

    if (collectionInfo.hasCollection && collectionInfo.powerUp) {
      this.handlePowerUpCollection(collectionInfo.powerUp.type);
    }

    // Update HUD
    this.hud.update(this.gameState);
  }

  private handleCollision(collisionInfo: any): void {
    this.player.handleCollision(collisionInfo);

    // Create collision particle effects
    const collisionPosition = this.player.getPosition().clone();
    this.particleSystem.createCollisionSparks(collisionPosition);

    // Trigger screen shake
    this.cameraSystem.triggerScreenShake(0.8, 0.4);

    // Reduce lives
    this.gameState.lives--;

    if (this.gameState.lives <= 0) {
      this.gameOver();
    } else {
      console.log(`Lives remaining: ${this.gameState.lives}`);
    }
  }

  private handlePowerUpCollection(powerUpType: string): void {
    this.powerUpSystem.applyPowerUpEffect(this.gameState, powerUpType as any);

    // Create power-up collection particle effect
    const powerUpPosition = this.player.getPosition().clone();
    powerUpPosition.y += 0.5;

    // Color based on power-up type
    let effectColor = new THREE.Color(0xffffff);
    switch (powerUpType) {
      case "SPEED_BOOST":
        effectColor = new THREE.Color(0x0088ff);
        break;
      case "INVINCIBILITY":
        effectColor = new THREE.Color(0xffff00);
        break;
      case "SCORE_MULTIPLIER":
        effectColor = new THREE.Color(0xff00ff);
        break;
    }

    this.particleSystem.createPowerUpEffect(powerUpPosition, effectColor);

    // Mild screen shake for positive feedback
    this.cameraSystem.triggerScreenShake(0.2, 0.1);
  }

  private gameOver(): void {
    this.gameState.isPlaying = false;
    this.gameState.isGameOver = true;

    console.log(
      `Game Over! Final score: ${this.gameState.score}, Distance: ${(
        this.gameState.distance / 1000
      ).toFixed(1)}km`
    );

    // Show game over screen
    this.hud.showGameOver(this.gameState);
  }

  private updateGameState(deltaTime: number): void {
    // Update distance traveled
    this.gameState.distance += this.gameState.speed * deltaTime;

    // Update score based on distance, speed, and multipliers
    const basePoints = Math.floor(this.gameState.speed * deltaTime * 10);
    const multipliedPoints = basePoints * this.gameState.currentScoreMultiplier;
    this.gameState.score += multipliedPoints;

    // Progressive speed increase every interval
    const speedIncreaseThreshold = GAME_CONFIG.SPEED_INCREASE_INTERVAL;
    const currentPhase = Math.floor(
      this.gameState.distance / speedIncreaseThreshold
    );
    const targetSpeed =
      GAME_CONFIG.STARTING_SPEED + currentPhase * GAME_CONFIG.SPEED_INCREMENT;

    if (
      targetSpeed <= GAME_CONFIG.MAX_SPEED &&
      targetSpeed > this.gameState.speed
    ) {
      this.gameState.speed = Math.min(targetSpeed, GAME_CONFIG.MAX_SPEED);
      this.player.setSpeed(this.gameState.speed);
    }
  }

  private updateCamera(): void {
    // Use enhanced camera system with speed-based effects
    this.cameraSystem.update(this.player.getPosition(), this.gameState.speed);
  }

  private render(): void {
    this.renderer.render(this.scene, this.cameraSystem.getCamera());
  }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // Update camera through system
    this.cameraSystem.resize();

    // Update renderer
    this.renderer.setSize(width, height);

    console.log(`Game resized to: ${width}x${height}`);
  }

  public dispose(): void {
    // Stop animation loop
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
    }

    // Dispose of systems
    this.inputSystem?.dispose();
    this.player?.dispose();
    this.roadSystem?.dispose();
    this.trafficSystem?.dispose();
    this.powerUpSystem?.dispose();
    this.particleSystem?.dispose();
    this.hud?.dispose();
    this.cameraSystem?.dispose();

    // Dispose of Three.js objects
    this.renderer?.dispose();

    // Remove stats
    if (this.stats.dom.parentNode) {
      this.stats.dom.parentNode.removeChild(this.stats.dom);
    }

    console.log("Enhanced game disposed successfully");
  }
}
