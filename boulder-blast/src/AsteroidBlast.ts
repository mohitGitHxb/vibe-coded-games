/**
 * AsteroidBlast - Main game class
 * Manages game state, entities, and core gameplay loop
 */

import { GameEngine } from "./core/GameEngine";
import { Spaceship } from "./entities/Spaceship";
import { Projectile } from "./entities/Projectile";
import { Asteroid } from "./entities/Asteroid";
import type { AsteroidType } from "./entities/Asteroid";
import { PowerUp } from "./entities/PowerUp";
import type { PowerUpType, PowerUpProperties } from "./entities/PowerUp";
import { InputManager } from "./libs/input";
import { SkyboxFactory } from "./libs/skybox_restructured/SkyboxFactory";
import { SpaceSky } from "./libs/skybox_restructured/skyboxes/SpaceSky";
import { HUDManager } from "./utils/HUDManager";
import type { GameStats, PowerUpStatus } from "./utils/HUDManager";
import { IOSDebugger } from "./utils/IOSDebugger";
import {
  ParticleFactory,
  FireExplosion,
  Sparks,
} from "./libs/particles_restructured";
import { AudioFactory } from "./libs/audios";
import type { SoundType } from "./libs/audios";
import * as THREE from "three";

export class AsteroidBlast extends GameEngine {
  private spaceship!: Spaceship;
  private isInitialized: boolean = false;

  // Input management
  private inputManager: InputManager;

  // Projectile management
  private projectiles: Projectile[] = [];

  // Asteroid management
  private asteroids: Asteroid[] = [];
  private lastAsteroidSpawn: number = 0;
  private asteroidSpawnRate: number = 1500; // Initial spawn rate in ms (1.5 seconds)

  // Power-up management
  private powerUps: PowerUp[] = [];
  private lastPowerUpSpawn: number = 0;
  private powerUpSpawnRate: number = 8000; // Spawn every 8 seconds initially

  // Game progression
  private gameStartTime: number = 0;
  private difficultyLevel: number = 1;

  // Game scoring and stats
  private score: number = 0;
  private asteroidsDestroyed: number = 0;

  // Environment systems
  private skyboxFactory: SkyboxFactory;
  private particleFactory: ParticleFactory;
  private hudManager: HUDManager;
  private audioFactory: AudioFactory;

  // Audio system
  private audioListener: THREE.AudioListener;
  private sounds: Map<SoundType, THREE.Audio<GainNode>> = new Map();
  private backgroundMusic: THREE.Audio<GainNode> | null = null;

  // Power-up effects tracking
  private activePowerUps: PowerUpStatus = {
    rapidFire: 0,
    shield: 0,
    damage: 0,
  };

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);

    // iOS debugging and fixes
    if (IOSDebugger.isIOS()) {
      console.log("📱 iOS device detected - applying fixes");
      IOSDebugger.logIOSDebugInfo();
      IOSDebugger.applyIOSFixes(canvas);

      // Check for WebGL issues
      const webglCheck = IOSDebugger.checkWebGLCompatibility(canvas);
      if (webglCheck.issues.length > 0) {
        console.warn("⚠️ iOS WebGL Issues detected:", webglCheck.issues);
      }
    }

    this.inputManager = InputManager.getInstance();
    this.skyboxFactory = new SkyboxFactory();
    this.particleFactory = new ParticleFactory(this.getScene());
    this.hudManager = new HUDManager();

    // Initialize audio system
    this.audioListener = new THREE.AudioListener();
    this.audioFactory = new AudioFactory(this.audioListener);

    // Add audio listener to camera
    this.getCamera().add(this.audioListener);

    this.setupInputHandlers();
    this.setupMobileUI();
    this.setupGameEventListeners();
    this.setupFullscreenControls();
    this.setupAudioSystem();
    this.init();
  }

  /**
   * Initialize the game
   */
  private init(): void {
    // Create spaceship at bottom center
    const worldBounds = this.getWorldBounds();
    this.spaceship = new Spaceship(worldBounds);

    // Add spaceship to the scene
    this.addToScene(this.spaceship.getMesh());

    // Initialize game timer
    this.gameStartTime = performance.now();

    // Setup environment
    this.setupEnvironment();

    // Start background music
    this.startBackgroundMusic();

    this.isInitialized = true;
    console.log("🚀 Asteroid Blast initialized - Spaceship ready!");
  }

  /**
   * Setup input handlers using InputManager
   */
  private setupInputHandlers(): void {
    // Set canvas reference for touch coordinate calculation
    this.inputManager.setCanvas(this.getRenderer().domElement);

    // Connect InputManager to DOM events
    this.inputManager.connect();

    console.log("🎮 Input system connected (keyboard + touch)");
  }

  /**
   * Setup mobile UI elements and detection
   */
  private setupMobileUI(): void {
    // Mobile UI setup - removed touch feedback areas as movement is drag-based
    console.log("📱 Mobile UI configured for drag-based movement");
  }

  /**
   * Setup game event listeners for HUD interactions
   */
  private setupGameEventListeners(): void {
    // Listen for game restart event from HUD
    window.addEventListener("gameRestart", () => {
      this.restartGame();
    });
  }

  /**
   * Setup fullscreen controls for mobile devices
   */
  private setupFullscreenControls(): void {
    // Check if we're on a mobile device
    const isMobile = this.isMobileDevice();

    if (isMobile) {
      // Show the fullscreen button on mobile
      const fullscreenBtn = document.getElementById("fullscreenBtn");
      if (fullscreenBtn) {
        fullscreenBtn.style.display = "block";
        fullscreenBtn.addEventListener("click", () => this.toggleFullscreen());
      }

      // Auto-request fullscreen on first user interaction (after a short delay)
      const autoFullscreen = () => {
        setTimeout(() => {
          this.requestFullscreen();
        }, 1000); // 1 second delay to let game load

        // Remove the event listener after first use
        document.removeEventListener("touchstart", autoFullscreen);
        document.removeEventListener("click", autoFullscreen);
      };

      // Listen for first user interaction
      document.addEventListener("touchstart", autoFullscreen, { once: true });
      document.addEventListener("click", autoFullscreen, { once: true });

      console.log("📱 Mobile fullscreen controls initialized");
    }

    // Listen for fullscreen changes to update button state
    document.addEventListener("fullscreenchange", () =>
      this.updateFullscreenButton()
    );
    document.addEventListener("webkitfullscreenchange", () =>
      this.updateFullscreenButton()
    );
    document.addEventListener("mozfullscreenchange", () =>
      this.updateFullscreenButton()
    );
    document.addEventListener("MSFullscreenChange", () =>
      this.updateFullscreenButton()
    );
  }

  /**
   * Check if the device is mobile
   */
  private isMobileDevice(): boolean {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      (navigator.maxTouchPoints && navigator.maxTouchPoints > 2) ||
      window.innerWidth <= 768
    );
  }

  /**
   * Request fullscreen mode
   */
  private requestFullscreen(): void {
    const element = document.getElementById("app");
    if (!element) return;

    try {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        (element as any).msRequestFullscreen();
      }

      console.log("📱 Fullscreen requested");
    } catch (error) {
      console.warn("⚠️ Could not request fullscreen:", error);
    }
  }

  /**
   * Exit fullscreen mode
   */
  private exitFullscreen(): void {
    try {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }

      console.log("📱 Fullscreen exited");
    } catch (error) {
      console.warn("⚠️ Could not exit fullscreen:", error);
    }
  }

  /**
   * Toggle fullscreen mode
   */
  private toggleFullscreen(): void {
    if (this.isFullscreen()) {
      this.exitFullscreen();
    } else {
      this.requestFullscreen();
    }
  }

  /**
   * Check if currently in fullscreen
   */
  private isFullscreen(): boolean {
    return !!(
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }

  /**
   * Update fullscreen button appearance
   */
  private updateFullscreenButton(): void {
    const fullscreenBtn = document.getElementById("fullscreenBtn");
    if (!fullscreenBtn) return;

    const fullscreenIcon = fullscreenBtn.querySelector(".fullscreen-icon");
    if (!fullscreenIcon) return;

    if (this.isFullscreen()) {
      fullscreenIcon.textContent = "⛶"; // Exit fullscreen icon
      fullscreenBtn.title = "Exit Fullscreen";
    } else {
      fullscreenIcon.textContent = "⛶"; // Enter fullscreen icon
      fullscreenBtn.title = "Enter Fullscreen";
    }
  }

  /**
   * Setup audio system and preload sounds
   */
  private async setupAudioSystem(): Promise<void> {
    try {
      console.log("🔊 Setting up audio system...");

      // Preload commonly used sounds
      const soundTypes = [
        "laserShot" as SoundType,
        "explosion" as SoundType,
        "powerUpChime" as SoundType,
        "uiClick" as SoundType,
        "backgroundMusic" as SoundType,
      ];

      // Create and cache sounds
      for (const soundType of soundTypes) {
        const sound = await this.audioFactory.createSound(soundType);
        if (sound) {
          this.sounds.set(soundType, sound);
          console.log(`🔊 Loaded sound: ${soundType}`);
        }
      }

      // Setup background music
      this.backgroundMusic =
        this.sounds.get("backgroundMusic" as SoundType) || null;
      if (this.backgroundMusic) {
        this.backgroundMusic.setLoop(true);
        this.backgroundMusic.setVolume(0); // Muted background music
      }

      console.log("🔊 Audio system initialized successfully!");
    } catch (error) {
      console.warn("⚠️ Audio system setup failed:", error);
      // Game continues without audio
    }
  }

  /**
   * Play a sound effect (allows overlapping for rapid firing)
   */
  private playSound(
    soundType: SoundType,
    volume: number = 0.5,
    allowOverlap: boolean = false
  ): void {
    try {
      const sound = this.sounds.get(soundType);
      if (sound) {
        if (allowOverlap || !sound.isPlaying) {
          sound.setVolume(volume);

          // For overlapping sounds, clone the audio for simultaneous playback
          if (allowOverlap && sound.isPlaying) {
            const clonedSound = sound.clone();
            clonedSound.setVolume(volume);
            clonedSound.play();
          } else {
            sound.play();
          }
        }
      }
    } catch (error) {
      console.warn(`⚠️ Failed to play sound ${soundType}:`, error);
    }
  }

  /**
   * Play laser shot with rapid fire support and variation
   */
  private playLaserShot(volume: number = 0.1): void {
    try {
      // Create a new laser shot sound instance for each shot to allow overlapping
      this.audioFactory
        .createSound("laserShot" as SoundType)
        .then((laserSound) => {
          if (laserSound) {
            // Add slight pitch variation for more dynamic audio
            const pitchVariation = 0.4 + Math.random() * 0.2; // 0.4 to 0.6
            laserSound.setPlaybackRate(pitchVariation);

            // Vary volume slightly for more natural sound
            const volumeVariation = volume * (0.3 + Math.random() * 0.4); // ±20% variation
            laserSound.setVolume(volumeVariation);

            laserSound.play();

            // Clean up the sound after it finishes playing
            laserSound.onEnded = () => {
              // Audio cleanup is handled by THREE.js
            };
          }
        });
    } catch (error) {
      console.warn("⚠️ Failed to create laser shot sound:", error);
    }
  }

  /**
   * Play explosion sound immediately without delay
   */
  private playExplosionSound(volume: number = 1): void {
    try {
      // Try to use cached explosion sound first for immediate playback
      const cachedExplosion = this.sounds.get("explosion" as SoundType);
      if (cachedExplosion && !cachedExplosion.isPlaying) {
        cachedExplosion.setVolume(volume);
        cachedExplosion.play();
        return;
      }

      // If cached sound is playing or doesn't exist, create a new instance
      this.audioFactory
        .createSound("explosion" as SoundType)
        .then((explosionSound) => {
          if (explosionSound) {
            explosionSound.setVolume(volume);
            explosionSound.play();
          }
        });
    } catch (error) {
      console.warn("⚠️ Failed to play explosion sound:", error);
    }
  }

  /**
   * Start background music
   */
  private startBackgroundMusic(): void {
    try {
      if (this.backgroundMusic) {
        if (!this.backgroundMusic.isPlaying) {
          this.backgroundMusic.play();
          console.log("🎵 Background music started successfully");
        } else {
          console.log("🎵 Background music is already playing");
        }
      } else {
        console.warn("⚠️ Background music not loaded - attempting to reload");
        // Try to reload background music if it failed initially
        this.reloadBackgroundMusic();
      }
    } catch (error) {
      console.warn("⚠️ Failed to start background music:", error);
      console.warn("Attempting to reload background music...");
      this.reloadBackgroundMusic();
    }
  }

  /**
   * Attempt to reload background music
   */
  private async reloadBackgroundMusic(): Promise<void> {
    try {
      console.log("🔄 Reloading background music...");
      const bgMusic = await this.audioFactory.createSound(
        "backgroundMusic" as SoundType
      );
      if (bgMusic) {
        this.backgroundMusic = bgMusic;
        this.backgroundMusic.setLoop(true);
        this.backgroundMusic.setVolume(0); // Muted background music
        this.sounds.set("backgroundMusic" as SoundType, this.backgroundMusic);

        // Try to play it immediately
        if (!this.backgroundMusic.isPlaying) {
          this.backgroundMusic.play();
          console.log("🎵 Background music reloaded and started");
        }
      } else {
        console.warn(
          "⚠️ Failed to reload background music - file may be missing or corrupted"
        );
      }
    } catch (error) {
      console.warn("⚠️ Background music reload failed:", error);
    }
  }

  /**
   * Stop background music
   */
  private stopBackgroundMusic(): void {
    try {
      if (this.backgroundMusic && this.backgroundMusic.isPlaying) {
        this.backgroundMusic.stop();
        console.log("🎵 Background music stopped");
      }
    } catch (error) {
      console.warn("⚠️ Failed to stop background music:", error);
    }
  }

  /**
   * Setup space environment with skybox using libs
   */
  private async setupEnvironment(): Promise<void> {
    try {
      // Detect iOS for simplified skybox
      const isIOS =
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as any).MSStream;

      if (isIOS) {
        console.log("📱 iOS detected - using simplified space environment");
        // Use simpler background for iOS to prevent rendering issues
        this.getScene().background = new THREE.Color(0x000811);

        // Add simple starfield for iOS
        this.createSimpleStarfield();
      } else {
        // Use full SpaceSky for other devices
        const spaceSky = await this.skyboxFactory.create(new SpaceSky());
        this.skyboxFactory.applySkyboxToScene(this.getScene(), spaceSky);
        console.log("🌌 Full SpaceSky with animated starfield applied");
      }

      // Note: For 2D gameplay, we keep minimal lighting
      // The sprites will handle their own visual appearance
    } catch (error) {
      console.warn("⚠️ Environment setup failed:", error);
      // Fallback to simple background
      this.getScene().background = new THREE.Color(0x000811);
      this.createSimpleStarfield();
    }
  }

  /**
   * Create a simple starfield for iOS devices or as fallback
   */
  private createSimpleStarfield(): void {
    const starGeometry = new THREE.BufferGeometry();
    const starPositions: number[] = [];

    // Create fewer, simpler stars for iOS
    for (let i = 0; i < 500; i++) {
      const x = (Math.random() - 0.5) * 4000;
      const y = (Math.random() - 0.5) * 4000;
      const z = (Math.random() - 0.5) * 4000;
      starPositions.push(x, y, z);
    }

    starGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(starPositions, 3)
    );

    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 2,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.8,
    });

    const stars = new THREE.Points(starGeometry, starMaterial);
    this.getScene().add(stars);

    console.log("✨ Simple starfield created for iOS compatibility");
  }
  /**
   * Handle input for spaceship movement (keyboard and touch)
   */
  private handleInput(): void {
    if (!this.isInitialized) return;

    // Keyboard movement using InputManager
    const keyboardLeft =
      this.inputManager.isKeyDown("ArrowLeft") ||
      this.inputManager.isKeyDown("KeyA");
    const keyboardRight =
      this.inputManager.isKeyDown("ArrowRight") ||
      this.inputManager.isKeyDown("KeyD");

    // Touch movement using InputManager
    let touchLeft = false;
    let touchRight = false;

    if (this.inputManager.isTouchActive()) {
      const touchMovement = this.inputManager.getTouchMovementVector();
      const touchSensitivity = 0.1; // Dead zone for touch

      if (touchMovement.x < -touchSensitivity) {
        touchLeft = true;
      } else if (touchMovement.x > touchSensitivity) {
        touchRight = true;
      }
    }

    // Apply movement from keyboard or touch
    if (keyboardLeft || touchLeft) {
      this.spaceship.moveLeft();
    }
    if (keyboardRight || touchRight) {
      this.spaceship.moveRight();
    }
  }

  /**
   * Handle auto-firing projectiles (600 RPM = 10 shots/second)
   */
  private handleAutoFire(): void {
    if (!this.isInitialized) return;

    // Auto-fire projectiles at specified rate
    if (this.spaceship.canShoot()) {
      this.createProjectile();
      this.spaceship.shoot();
    }
  }

  /**
   * Create a new projectile from spaceship position
   */
  private createProjectile(): void {
    const spaceshipPos = this.spaceship.getPosition();

    // Calculate damage based on spaceship's damage multiplier
    const baseDamage = 1;
    const actualDamage = Math.ceil(
      baseDamage * this.spaceship.getDamageMultiplier()
    );

    // Fire from the tip of the spaceship (slightly above center)
    const projectile = new Projectile(
      spaceshipPos.x,
      spaceshipPos.y + 30,
      actualDamage
    );

    // Add to projectiles array and scene
    this.projectiles.push(projectile);
    this.addToScene(projectile.getMesh());

    // Play laser shot sound (allows overlapping for rapid fire) - volume reduced by 20%
    this.playLaserShot();

    console.log(
      `🔫 Projectile fired! Damage: ${actualDamage} | Total projectiles: ${this.projectiles.length}`
    );
  }

  /**
   * Update all projectiles and remove inactive ones
   */
  private updateProjectiles(deltaTime: number): void {
    const worldBounds = this.getWorldBounds();

    // Update existing projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.update(deltaTime, worldBounds);

      // Remove inactive projectiles
      if (!projectile.isActiveProjectile()) {
        this.removeFromScene(projectile.getMesh());
        projectile.dispose();
        this.projectiles.splice(i, 1);
      }
    }
  }

  /**
   * Handle asteroid spawning based on difficulty progression
   */
  private handleAsteroidSpawning(): void {
    if (!this.isInitialized) return;

    const currentTime = performance.now();

    // Check if it's time to spawn an asteroid
    if (currentTime - this.lastAsteroidSpawn >= this.asteroidSpawnRate) {
      this.spawnAsteroid();
      this.lastAsteroidSpawn = currentTime;
    }

    // Update difficulty every 30 seconds (as per GRD)
    this.updateDifficulty();
  }

  /**
   * Spawn a new asteroid at the top of the screen
   */
  private spawnAsteroid(): void {
    const worldBounds = this.getWorldBounds();

    // Random X position across the top of the screen
    const spawnX = worldBounds.left + Math.random() * worldBounds.width;
    const spawnY = worldBounds.top + 50; // Spawn above the visible area

    // Choose asteroid type based on difficulty level
    const asteroidType = this.chooseAsteroidType();

    // Create new asteroid
    const asteroid = new Asteroid(spawnX, spawnY, asteroidType);

    // Add to asteroids array and scene
    this.asteroids.push(asteroid);
    this.addToScene(asteroid.getMesh());

    console.log(
      `🪨 ${asteroidType} asteroid spawned! Total asteroids: ${this.asteroids.length}`
    );
  }

  /**
   * Choose asteroid type based on current difficulty
   */
  private chooseAsteroidType(): AsteroidType {
    const random = Math.random();

    if (this.difficultyLevel === 1) {
      // Early game: mostly small asteroids
      if (random < 0.7) return "small";
      if (random < 0.95) return "medium";
      return "large";
    } else if (this.difficultyLevel === 2) {
      // Mid game: more medium and large asteroids
      if (random < 0.4) return "small";
      if (random < 0.8) return "medium";
      return "large";
    } else {
      // Late game: more large asteroids
      if (random < 0.3) return "small";
      if (random < 0.6) return "medium";
      return "large";
    }
  }

  /**
   * Update game difficulty every 30 seconds
   */
  private updateDifficulty(): void {
    const currentTime = performance.now();
    const gameTime = (currentTime - this.gameStartTime) / 1000; // Convert to seconds

    // Increase difficulty every 30 seconds (as per GRD)
    const newDifficultyLevel = Math.floor(gameTime / 30) + 1;

    if (newDifficultyLevel > this.difficultyLevel) {
      this.difficultyLevel = newDifficultyLevel;

      // Increase spawn rate (decrease time between spawns)
      this.asteroidSpawnRate = Math.max(500, 1500 - this.difficultyLevel * 200); // Minimum 0.5s between spawns

      // Show level up message
      this.hudManager.showLevelUp(this.difficultyLevel);

      console.log(
        `🔥 Difficulty increased to level ${this.difficultyLevel}! Spawn rate: ${this.asteroidSpawnRate}ms`
      );
    }
  }

  /**
   * Update all asteroids and remove inactive ones
   */
  private updateAsteroids(deltaTime: number): void {
    const worldBounds = this.getWorldBounds();

    // Update existing asteroids
    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const asteroid = this.asteroids[i];
      asteroid.update(deltaTime, worldBounds);

      // Remove inactive asteroids
      if (!asteroid.isActiveAsteroid()) {
        this.removeFromScene(asteroid.getMesh());
        asteroid.dispose();
        this.asteroids.splice(i, 1);
      }
    }
  }

  /**
   * Handle power-up spawning
   */
  private handlePowerUpSpawning(): void {
    if (!this.isInitialized) return;

    const currentTime = performance.now();

    // Check if it's time to spawn a power-up
    if (currentTime - this.lastPowerUpSpawn >= this.powerUpSpawnRate) {
      this.spawnPowerUp();
      this.lastPowerUpSpawn = currentTime;
    }
  }

  /**
   * Spawn a new power-up at the top of the screen
   */
  private spawnPowerUp(): void {
    const worldBounds = this.getWorldBounds();

    // Random X position across the top of the screen
    const spawnX = worldBounds.left + Math.random() * worldBounds.width;
    const spawnY = worldBounds.top + 50; // Spawn above the visible area

    // Choose power-up type based on rarity
    const powerUpType = this.choosePowerUpType();

    // Create new power-up
    const powerUp = new PowerUp(spawnX, spawnY, powerUpType);

    // Add to power-ups array and scene
    this.powerUps.push(powerUp);
    this.addToScene(powerUp.getMesh());

    console.log(
      `⚡ Spawned ${powerUpType} power-up at (${spawnX.toFixed(
        0
      )}, ${spawnY.toFixed(0)})`
    );
  }

  /**
   * Choose power-up type based on rarity distribution
   */
  private choosePowerUpType(): PowerUpType {
    const rand = Math.random();

    // Rarity distribution (percentages) - 4 types only
    if (rand < 0.4) return "health"; // 40% - Common
    if (rand < 0.65) return "rapidFire"; // 25% - Uncommon
    if (rand < 0.85) return "shield"; // 20% - Uncommon
    return "damage"; // 15% - Rare
  }

  /**
   * Update all power-ups and remove inactive ones
   */
  private updatePowerUps(deltaTime: number): void {
    const worldBounds = this.getWorldBounds();

    // Update existing power-ups
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.update(deltaTime, worldBounds);

      // Remove inactive power-ups
      if (!powerUp.isActiveState()) {
        this.removeFromScene(powerUp.getMesh());
        powerUp.dispose();
        this.powerUps.splice(i, 1);
      }
    }
  }

  /**
   * Handle collision detection between projectiles and asteroids
   */
  private handleProjectileAsteroidCollisions(): void {
    // Check each projectile against each asteroid
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      if (!projectile.isActiveProjectile()) continue;

      for (let j = this.asteroids.length - 1; j >= 0; j--) {
        const asteroid = this.asteroids[j];
        if (!asteroid.isActiveAsteroid()) continue;

        // Check collision using sphere collision detection
        if (this.checkSphereCollision(projectile, asteroid)) {
          // Projectile hits asteroid
          this.handleProjectileHitsAsteroid(projectile, asteroid, i, j);
          break; // Projectile can only hit one asteroid
        }
      }
    }
  }

  /**
   * Handle collision detection between asteroids and spaceship
   */
  private handleAsteroidSpaceshipCollisions(): void {
    const spaceshipPos = this.spaceship.getPosition();
    const spaceshipRadius = 25; // Approximate spaceship collision radius

    for (let i = this.asteroids.length - 1; i >= 0; i--) {
      const asteroid = this.asteroids[i];
      if (!asteroid.isActiveAsteroid()) continue;

      const asteroidPos = asteroid.getPosition();
      const asteroidRadius = asteroid.getBoundingSphere().radius;
      const distance = spaceshipPos.distanceTo(asteroidPos);

      // Check collision
      if (distance < spaceshipRadius + asteroidRadius) {
        // Asteroid hits spaceship
        this.handleAsteroidHitsSpaceship(asteroid, i);
      }
    }
  }

  /**
   * Check sphere collision between two objects
   */
  private checkSphereCollision(
    projectile: Projectile,
    asteroid: Asteroid
  ): boolean {
    const projectilePos = projectile.getPosition();
    const asteroidPos = asteroid.getPosition();

    const projectileRadius = 4; // Small projectile radius
    const asteroidRadius = asteroid.getBoundingSphere().radius;

    const distance = projectilePos.distanceTo(asteroidPos);
    return distance < projectileRadius + asteroidRadius;
  }

  /**
   * Handle projectile hitting asteroid
   */
  private handleProjectileHitsAsteroid(
    projectile: Projectile,
    asteroid: Asteroid,
    projectileIndex: number,
    asteroidIndex: number
  ): void {
    // Projectile deals 1 HP damage (as per GRD)
    const damage = projectile.getDamage();
    const isDestroyed = asteroid.takeDamage(damage);

    // Remove projectile (it hit something)
    this.removeFromScene(projectile.getMesh());
    projectile.dispose();
    this.projectiles.splice(projectileIndex, 1);

    // If asteroid is destroyed
    if (isDestroyed) {
      // Add points to score (as per GRD)
      const points = asteroid.getPoints();
      const asteroidType = asteroid.getType();
      this.score += points;
      this.asteroidsDestroyed++;

      // Get asteroid position for particle effects
      const asteroidPosition = asteroid.getPosition().clone();

      // Create enhanced explosion particle effects with asteroid type scaling
      this.createExplosionEffects(asteroidPosition, asteroidType);

      // Play explosion sound immediately
      this.playExplosionSound(0.6);

      // Show HUD message
      this.hudManager.showAsteroidDestroyed(asteroidType, points);

      // Remove destroyed asteroid
      this.removeFromScene(asteroid.getMesh());
      asteroid.dispose();
      this.asteroids.splice(asteroidIndex, 1);

      console.log(
        `💥 ${asteroidType} asteroid destroyed! +${points} points (Score: ${this.score})`
      );
    } else {
      // Create smaller impact effect for non-destroying hits
      this.createImpactEffect(asteroid.getPosition());
      console.log(
        `🎯 ${asteroid.getType()} asteroid hit! Damaged but still active`
      );
    }
  }

  /**
   * Handle asteroid hitting spaceship
   */
  private handleAsteroidHitsSpaceship(
    asteroid: Asteroid,
    asteroidIndex: number
  ): void {
    // Spaceship takes damage based on asteroid type (as per GRD)
    const damage = asteroid.getDamageToShip();
    const spaceshipDestroyed = this.spaceship.takeDamage(damage);

    // Remove asteroid (it hit the spaceship)
    this.removeFromScene(asteroid.getMesh());
    asteroid.dispose();
    this.asteroids.splice(asteroidIndex, 1);

    console.log(
      `💔 Spaceship hit by ${asteroid.getType()} asteroid! -${damage} HP (HP: ${this.spaceship.getHP()})`
    );

    // Check if spaceship is destroyed
    if (spaceshipDestroyed) {
      this.handleGameOver();
    }
  }

  /**
   * Handle collision detection between spaceship and power-ups
   */
  private handleSpaceshipPowerUpCollisions(): void {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      if (!powerUp.isActiveState()) continue;

      // Check collision using sphere collision detection
      if (this.checkSpaceshipPowerUpCollision(powerUp)) {
        this.handleSpaceshipCollectsPowerUp(powerUp, i);
      }
    }
  }

  /**
   * Check collision between spaceship and power-up
   */
  private checkSpaceshipPowerUpCollision(powerUp: PowerUp): boolean {
    const spaceshipPos = this.spaceship.getPosition();
    const powerUpPos = powerUp.getPosition();

    const spaceshipRadius = 25; // Spaceship collision radius
    const powerUpRadius = powerUp.getBounds().radius;

    const distance = spaceshipPos.distanceTo(powerUpPos);
    return distance < spaceshipRadius + powerUpRadius;
  }

  /**
   * Handle spaceship collecting a power-up
   */
  private handleSpaceshipCollectsPowerUp(
    powerUp: PowerUp,
    powerUpIndex: number
  ): void {
    const powerUpType = powerUp.getType();
    const points = powerUp.getPoints();
    const properties = powerUp.getProperties();

    // Add points to score
    this.score += points;

    // Create power-up collection visual effect
    this.createPowerUpEffect(powerUp.getPosition(), powerUpType);

    // Apply power-up effect
    this.applyPowerUpEffect(powerUpType, properties);

    // Play power-up sound
    this.playSound("powerUpChime" as SoundType, 0.7);

    // Remove power-up
    this.removeFromScene(powerUp.getMesh());
    powerUp.dispose();
    this.powerUps.splice(powerUpIndex, 1);

    // Show HUD message
    this.hudManager.showPowerUpMessage(powerUpType, points);

    console.log(
      `⚡ Collected ${powerUpType} power-up! +${points} points (Score: ${this.score})`
    );
  }

  /**
   * Apply power-up effect to spaceship
   */
  private applyPowerUpEffect(
    type: PowerUpType,
    properties: PowerUpProperties
  ): void {
    switch (type) {
      case "health":
        // Instant healing - heal spaceship directly
        const healAmount = properties.value;
        this.spaceship.heal(healAmount);
        console.log(`💚 Healed for ${healAmount} HP!`);
        // Update HUD immediately to show health change
        this.hudManager.updateStats({
          health: this.spaceship.getHP(),
          maxHealth: this.spaceship.getMaxHP(),
          score: this.score,
          gameTime: Date.now() - this.gameStartTime,
        });
        break;

      case "rapidFire":
        this.activePowerUps.rapidFire = properties.effectDuration;
        this.spaceship.activateRapidFire(2); // 2x fire rate
        console.log(
          `🔥 Rapid Fire activated for ${properties.effectDuration}s!`
        );
        break;

      case "shield":
        this.activePowerUps.shield = properties.effectDuration;
        this.spaceship.activateShield(50); // 50 HP shield
        console.log(`🛡️ Shield activated for ${properties.effectDuration}s!`);
        break;

      case "damage":
        this.activePowerUps.damage = properties.effectDuration;
        this.spaceship.activateDamageBoost(2); // 2x damage multiplier
        console.log(
          `⚡ Damage Boost activated for ${properties.effectDuration}s!`
        );
        break;

      default:
        console.log(`Unknown power-up type: ${type}`);
    }
  }

  /**
   * Handle game over scenario
   */
  private handleGameOver(): void {
    console.log(`💀 GAME OVER! Final Score: ${this.score}`);

    // Show game over screen with final stats
    const finalStats: GameStats = {
      score: this.score,
      health: 0,
      maxHealth: this.spaceship.getMaxHP(),
      gameTime: (performance.now() - this.gameStartTime) / 1000,
    };

    this.hudManager.showGameOver(finalStats);

    // Stop background music
    this.stopBackgroundMusic();

    // Pause the game by setting it to not initialized
    this.isInitialized = false;
  }

  /**
   * Create enhanced explosion particle effects at given position
   */
  private async createExplosionEffects(
    position: THREE.Vector3,
    asteroidType?: string
  ): Promise<void> {
    console.log(
      "🎆 Creating enhanced explosion effects at position:",
      position
    );

    // Create multiple layered effects for more impressive explosion
    await Promise.all([
      this.createMainExplosion(position, asteroidType),
      this.createSparkEffect(position),
      this.createShockwaveEffect(position),
    ]);
  }

  /**
   * Create main fire explosion effect
   */
  private async createMainExplosion(
    position: THREE.Vector3,
    asteroidType?: string
  ): Promise<void> {
    try {
      // Scale particle count based on asteroid type
      let particleCount = 100;
      let explosionScale = 1.0;

      if (asteroidType === "large") {
        particleCount = 200;
        explosionScale = 1.5;
      } else if (asteroidType === "medium") {
        particleCount = 150;
        explosionScale = 1.2;
      } else if (asteroidType === "small") {
        particleCount = 80;
        explosionScale = 0.8;
      }

      // Create fire explosion using the particle factory
      await this.particleFactory.create(new FireExplosion(), position, {
        particleCount,
        emissionDuration: 0.4,
        color: [0xff2200, 0xff6600, 0xffaa00, 0xffffff],
        size: [0.1 * explosionScale, 0.6 * explosionScale],
        velocity: [
          new THREE.Vector3(-8 * explosionScale, 2, -8 * explosionScale),
          new THREE.Vector3(
            8 * explosionScale,
            12 * explosionScale,
            8 * explosionScale
          ),
        ],
        lifetime: [0.6, 1.2],
        spawnArea: { type: "sphere", size: 0.3 * explosionScale },
      });

      // The particle system is automatically added to the scene by the factory

      console.log(`💥 Main explosion created with ${particleCount} particles`);
    } catch (error) {
      console.warn(
        "⚠️ Failed to create main explosion, using fallback:",
        error
      );
      this.createSimpleExplosion(position);
    }
  }

  /**
   * Create spark effect for metallic debris
   */
  private async createSparkEffect(position: THREE.Vector3): Promise<void> {
    try {
      await this.particleFactory.create(new Sparks(), position, {
        particleCount: 30,
        emissionDuration: 0.2,
        color: [0xffff88, 0xffffff, 0xffffaa],
        size: [0.05, 0.15],
        velocity: [
          new THREE.Vector3(-10, -2, -10),
          new THREE.Vector3(10, 8, 10),
        ],
        lifetime: [0.8, 1.5],
        gravity: -15,
        spawnArea: { type: "sphere", size: 0.1 },
      });

      console.log("✨ Spark effect created");
    } catch (error) {
      console.warn("⚠️ Failed to create spark effect:", error);
    }
  }

  /**
   * Create shockwave effect using expanding ring of particles
   */
  private async createShockwaveEffect(position: THREE.Vector3): Promise<void> {
    try {
      // Create a ring of particles for shockwave
      const shockwaveParticles: THREE.Mesh[] = [];
      const particleCount = 24;
      const geometry = new THREE.RingGeometry(0.1, 0.3, 8);

      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const material = new THREE.MeshBasicMaterial({
          color: new THREE.Color(0x88ccff),
          transparent: true,
          opacity: 0.8,
          blending: THREE.AdditiveBlending,
        });

        const particle = new THREE.Mesh(geometry, material);
        particle.position.copy(position);
        particle.position.x += Math.cos(angle) * 5;
        particle.position.y += Math.sin(angle) * 5;

        shockwaveParticles.push(particle);
        this.addToScene(particle);
      }

      // Animate shockwave expansion
      this.animateShockwave(shockwaveParticles, position);

      console.log("🌊 Shockwave effect created");
    } catch (error) {
      console.warn("⚠️ Failed to create shockwave effect:", error);
    }
  }

  /**
   * Animate shockwave expansion and fade
   */
  private animateShockwave(
    particles: THREE.Mesh[],
    center: THREE.Vector3
  ): void {
    const startTime = performance.now();
    const duration = 800; // 0.8 seconds
    const maxRadius = 60;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress >= 1) {
        // Remove particles when animation is complete
        particles.forEach((particle) => {
          this.removeFromScene(particle);
          particle.geometry.dispose();
          if (particle.material instanceof THREE.Material) {
            particle.material.dispose();
          }
        });
        return;
      }

      // Update each particle
      particles.forEach((particle, index) => {
        const angle = (index / particles.length) * Math.PI * 2;
        const radius = progress * maxRadius;

        // Update position
        particle.position.x = center.x + Math.cos(angle) * radius;
        particle.position.y = center.y + Math.sin(angle) * radius;

        // Update opacity (fade out as it expands)
        if (particle.material instanceof THREE.MeshBasicMaterial) {
          particle.material.opacity = (1 - progress) * 0.6;
        }

        // Scale effect
        const scale = 1 + progress * 2;
        particle.scale.set(scale, scale, scale);
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Create impact effect for projectile hits that don't destroy asteroids
   */
  private async createImpactEffect(position: THREE.Vector3): Promise<void> {
    try {
      // Small spark burst for impact
      await this.particleFactory.create(new Sparks(), position, {
        particleCount: 15,
        emissionDuration: 0.1,
        color: [0xffff88, 0xffffff, 0xffffff],
        size: [0.02, 0.08],
        velocity: [new THREE.Vector3(-3, -1, -3), new THREE.Vector3(3, 4, 3)],
        lifetime: [0.3, 0.8],
        gravity: -8,
        spawnArea: { type: "sphere", size: 0.05 },
      });

      console.log("💫 Impact effect created");
    } catch (error) {
      console.warn("⚠️ Failed to create impact effect:", error);
    }
  }

  /**
   * Create power-up collection effect
   */
  private async createPowerUpEffect(
    position: THREE.Vector3,
    powerUpType: string
  ): Promise<void> {
    try {
      // Different colors based on power-up type
      let effectColors = [0x00ff88, 0x88ffff, 0xffffff]; // Default green-cyan

      switch (powerUpType) {
        case "health":
          effectColors = [0x00ff00, 0x88ff88, 0xffffff]; // Green
          break;
        case "rapidFire":
          effectColors = [0xff4400, 0xff8800, 0xffaa00]; // Orange-red
          break;
        case "shield":
          effectColors = [0x4488ff, 0x88aaff, 0xffffff]; // Blue
          break;
        case "damage":
          effectColors = [0xff0088, 0xff44aa, 0xffffff]; // Pink-purple
          break;
      }

      // Create upward flowing sparkle effect
      await this.particleFactory.create(new Sparks(), position, {
        particleCount: 25,
        emissionDuration: 0.3,
        color: effectColors,
        size: [0.1, 0.3],
        velocity: [new THREE.Vector3(-2, 8, -2), new THREE.Vector3(2, 15, 2)],
        lifetime: [1.0, 1.8],
        gravity: -2, // Light gravity for floating effect
        spawnArea: { type: "sphere", size: 0.2 },
        blending: THREE.AdditiveBlending,
      });

      console.log(`⚡ Power-up collection effect created for ${powerUpType}`);
    } catch (error) {
      console.warn("⚠️ Failed to create power-up effect:", error);
    }
  }

  // Engine trail timing control
  private lastEngineTrailTime: number = 0;
  private engineTrailInterval: number = 50; // 50ms between trail particles

  /**
   * Create continuous engine trail effect behind spaceship
   */
  private createEngineTrail(): void {
    const currentTime = performance.now();

    // Only create trail particles at intervals to avoid overwhelming
    if (currentTime - this.lastEngineTrailTime < this.engineTrailInterval) {
      return;
    }

    try {
      const spaceshipPos = this.spaceship.getPosition();

      // Create trail position slightly behind and below the spaceship
      const trailPosition = new THREE.Vector3(
        spaceshipPos.x + (Math.random() - 0.5) * 8, // Slight random spread
        spaceshipPos.y - 25, // Behind the spaceship
        spaceshipPos.z
      );

      // Create small, short-lived particles for engine trail
      this.createSimpleTrailParticles(trailPosition);

      this.lastEngineTrailTime = currentTime;
    } catch (error) {
      console.warn("⚠️ Failed to create engine trail:", error);
    }
  }

  /**
   * Create simple trail particles (optimized for performance)
   */
  private createSimpleTrailParticles(position: THREE.Vector3): void {
    const particleCount = 3; // Small number for performance
    const particles: THREE.Mesh[] = [];
    const geometry = new THREE.SphereGeometry(1, 4, 4);

    for (let i = 0; i < particleCount; i++) {
      // Blue-white engine flame colors
      const hue = 200 + Math.random() * 60; // Blue to cyan range
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(hue / 360, 0.8, 0.8),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });

      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(position);
      particle.position.x += (Math.random() - 0.5) * 4;
      particle.position.y += (Math.random() - 0.5) * 4;

      // Downward velocity for trailing effect
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        -50 - Math.random() * 30, // Downward motion
        (Math.random() - 0.5) * 10
      );

      (particle as any).velocity = velocity;
      (particle as any).life = 0.4; // Short lifetime

      particles.push(particle);
      this.addToScene(particle);
    }

    // Animate trail particles
    this.animateTrailParticles(particles);
  }

  /**
   * Animate trail particles (optimized)
   */
  private animateTrailParticles(particles: THREE.Mesh[]): void {
    const startTime = performance.now();
    const maxLifetime = 400; // 0.4 seconds

    const animate = () => {
      const elapsed = performance.now() - startTime;

      if (elapsed >= maxLifetime) {
        // Clean up particles
        particles.forEach((particle) => {
          this.removeFromScene(particle);
          particle.geometry.dispose();
          if (particle.material instanceof THREE.Material) {
            particle.material.dispose();
          }
        });
        return;
      }

      const deltaTime = 0.016; // ~60fps
      const lifeProgress = elapsed / maxLifetime;

      particles.forEach((particle) => {
        const velocity = (particle as any).velocity;

        // Update position
        particle.position.add(velocity.clone().multiplyScalar(deltaTime));

        // Fade out over time
        if (particle.material instanceof THREE.MeshBasicMaterial) {
          particle.material.opacity = (1 - lifeProgress) * 0.6;
        }

        // Slight scale reduction over time
        const scale = 1 - lifeProgress * 0.5;
        particle.scale.set(scale, scale, scale);
      });

      requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Create simple explosion effect using basic THREE.js
   */
  private createSimpleExplosion(position: THREE.Vector3): void {
    const particleCount = 20;
    const particles: THREE.Mesh[] = [];

    // Create simple particle geometry
    const geometry = new THREE.SphereGeometry(2, 4, 4);

    for (let i = 0; i < particleCount; i++) {
      // Create material with random color
      const hue = Math.random() * 60; // Orange to yellow range
      const material = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(hue / 360, 1.0, 0.6),
        transparent: true,
        opacity: 1.0,
      });

      const particle = new THREE.Mesh(geometry, material);

      // Position at explosion center
      particle.position.copy(position);

      // Random velocity
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 100
      );

      (particle as any).velocity = velocity;
      (particle as any).life = 1.0; // 1 second lifetime

      particles.push(particle);
      this.addToScene(particle);
    }

    // Animate particles
    const animateParticles = () => {
      const deltaTime = 0.016; // ~60fps

      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        const velocity = (particle as any).velocity;
        let life = (particle as any).life;

        // Update position
        particle.position.add(velocity.clone().multiplyScalar(deltaTime));

        // Update life and opacity
        life -= deltaTime;
        (particle as any).life = life;

        if (particle.material instanceof THREE.MeshBasicMaterial) {
          particle.material.opacity = Math.max(0, life);
        }

        // Apply gravity and damping
        velocity.y -= 300 * deltaTime; // gravity
        velocity.multiplyScalar(0.98); // damping

        // Remove dead particles
        if (life <= 0) {
          this.removeFromScene(particle);
          particle.geometry.dispose();
          if (particle.material instanceof THREE.Material) {
            particle.material.dispose();
          }
          particles.splice(i, 1);
        }
      }

      // Continue animation if particles exist
      if (particles.length > 0) {
        requestAnimationFrame(animateParticles);
      }
    };

    // Start animation
    animateParticles();
  }

  /**
   * Update game state - overrides GameEngine.update()
   */
  protected update(deltaTime: number): void {
    if (!this.isInitialized) return;

    // Handle player input
    this.handleInput();

    // Handle auto-firing projectiles
    this.handleAutoFire();

    // Handle asteroid spawning
    this.handleAsteroidSpawning();

    // Handle power-up spawning
    this.handlePowerUpSpawning();

    // Update spaceship
    const worldBounds = this.getWorldBounds();
    this.spaceship.update(deltaTime, worldBounds);

    // Add engine trail effect
    this.createEngineTrail();

    // Update projectiles
    this.updateProjectiles(deltaTime);

    // Update asteroids
    this.updateAsteroids(deltaTime);

    // Update power-ups
    this.updatePowerUps(deltaTime);

    // Update particle effects
    this.particleFactory.update(deltaTime);

    // Update power-up timers
    this.updatePowerUpTimers(deltaTime);

    // Update HUD
    this.updateHUD();

    // Handle collision detection
    this.handleProjectileAsteroidCollisions();
    this.handleAsteroidSpaceshipCollisions();
    this.handleSpaceshipPowerUpCollisions();
  }

  /**
   * Start the game
   */
  public startGame(): void {
    console.log("🎮 Starting Asteroid Blast...");
    this.start();
  }

  /**
   * Restart the game from beginning
   */
  public restartGame(): void {
    console.log("🔄 Restarting Asteroid Blast...");

    // Simple full page reload to ensure clean state
    // This prevents any potential issues with spaceship duplication or state management
    window.location.reload();
  }

  /**
   * Update HUD with current game statistics
   */
  private updateHUD(): void {
    const stats: GameStats = {
      score: this.score,
      health: this.spaceship.getHP(),
      maxHealth: this.spaceship.getMaxHP(),
      gameTime: (performance.now() - this.gameStartTime) / 1000,
    };

    this.hudManager.updateStats(stats);
    this.hudManager.updatePowerUps(this.activePowerUps);
  }

  /**
   * Update power-up effect timers
   */
  private updatePowerUpTimers(deltaTime: number): void {
    // Rapid Fire timer and deactivation
    if (this.activePowerUps.rapidFire > 0) {
      const wasActive = this.activePowerUps.rapidFire > 0;
      this.activePowerUps.rapidFire = Math.max(
        0,
        this.activePowerUps.rapidFire - deltaTime
      );

      // Deactivate when timer reaches 0
      if (wasActive && this.activePowerUps.rapidFire === 0) {
        this.spaceship.deactivateRapidFire();
      }
    }

    // Shield timer and deactivation
    if (this.activePowerUps.shield > 0) {
      this.activePowerUps.shield = Math.max(
        0,
        this.activePowerUps.shield - deltaTime
      );

      // Shield power-up has expired, but shield will deactivate
      // automatically when shield HP reaches 0
    }

    // Damage boost timer and deactivation
    if (this.activePowerUps.damage > 0) {
      const wasActive = this.activePowerUps.damage > 0;
      this.activePowerUps.damage = Math.max(
        0,
        this.activePowerUps.damage - deltaTime
      );

      // Deactivate when timer reaches 0
      if (wasActive && this.activePowerUps.damage === 0) {
        this.spaceship.deactivateDamageBoost();
      }
    }
  }

  /**
   * Get spaceship reference (for future collision detection)
   */
  public getSpaceship(): Spaceship {
    return this.spaceship;
  }

  /**
   * Get current score
   */
  public getScore(): number {
    return this.score;
  }

  /**
   * Get asteroids destroyed count
   */
  public getAsteroidsDestroyed(): number {
    return this.asteroidsDestroyed;
  }

  /**
   * Get current difficulty level
   */
  public getDifficultyLevel(): number {
    return this.difficultyLevel;
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    super.dispose();

    // Cleanup spaceship
    if (this.spaceship) {
      this.spaceship.dispose();
    }

    // Cleanup all projectiles
    this.projectiles.forEach((projectile) => {
      this.removeFromScene(projectile.getMesh());
      projectile.dispose();
    });
    this.projectiles.length = 0;

    // Cleanup all asteroids
    this.asteroids.forEach((asteroid) => {
      this.removeFromScene(asteroid.getMesh());
      asteroid.dispose();
    });
    this.asteroids.length = 0;

    // Disconnect input manager
    this.inputManager.disconnect();

    // Cleanup audio system
    this.stopBackgroundMusic();
    for (const sound of this.sounds.values()) {
      if (sound.isPlaying) {
        sound.stop();
      }
    }
    this.sounds.clear();
  }
}
