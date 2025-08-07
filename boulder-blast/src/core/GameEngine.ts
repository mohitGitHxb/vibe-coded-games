/**
 * GameEngine - Core game engine for Asteroid Blast
 * Manages Three.js scene, camera, renderer, and game loop
 */

import * as THREE from "three";

export class GameEngine {
  private scene!: THREE.Scene;
  private camera!: THREE.OrthographicCamera;
  private renderer!: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;
  private isRunning: boolean = false;
  private lastTime: number = 0;

  // Game world dimensions (2D space)
  public readonly WORLD_WIDTH = 1280;
  public readonly WORLD_HEIGHT = 720;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.setupResizeHandler();
  }

  /**
   * Initialize Three.js scene
   */
  private initScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000811); // Dark space blue
  }

  /**
   * Initialize orthographic camera for 2D gameplay
   */
  private initCamera(): void {
    const aspect = this.WORLD_WIDTH / this.WORLD_HEIGHT;
    const height = this.WORLD_HEIGHT / 2;
    const width = height * aspect;

    this.camera = new THREE.OrthographicCamera(
      -width,
      width, // left, right
      height,
      -height, // top, bottom
      0.1,
      5000 // near, far - increased for skybox visibility
    );

    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Initialize WebGL renderer
   */
  private initRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false,
    });

    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000811, 1.0);
  }

  /**
   * Handle window resize events
   */
  private setupResizeHandler(): void {
    window.addEventListener("resize", () => {
      this.handleResize();
    });
  }

  /**
   * Handle canvas resize
   */
  private handleResize(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  /**
   * Add object to the scene
   */
  public addToScene(object: THREE.Object3D): void {
    this.scene.add(object);
  }

  /**
   * Remove object from the scene
   */
  public removeFromScene(object: THREE.Object3D): void {
    this.scene.remove(object);
  }

  /**
   * Start the game loop
   */
  public start(): void {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  /**
   * Stop the game loop
   */
  public stop(): void {
    this.isRunning = false;
  }

  /**
   * Main game loop
   */
  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Update game logic (will be expanded)
    this.update(deltaTime);

    // Render the scene
    this.render();

    // Continue the loop
    requestAnimationFrame(this.gameLoop);
  };

  /**
   * Update game state (override in game implementations)
   */
  protected update(_deltaTime: number): void {
    // To be implemented by game-specific logic
  }

  /**
   * Render the current frame
   */
  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Get the scene reference
   */
  public getScene(): THREE.Scene {
    return this.scene;
  }

  /**
   * Get the camera reference
   */
  public getCamera(): THREE.OrthographicCamera {
    return this.camera;
  }

  /**
   * Get the renderer reference
   */
  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  /**
   * Get world bounds for positioning objects
   */
  public getWorldBounds() {
    return {
      left: -this.WORLD_WIDTH / 2,
      right: this.WORLD_WIDTH / 2,
      top: this.WORLD_HEIGHT / 2,
      bottom: -this.WORLD_HEIGHT / 2,
      width: this.WORLD_WIDTH,
      height: this.WORLD_HEIGHT,
    };
  }

  /**
   * Cleanup resources
   */
  public dispose(): void {
    this.stop();
    this.renderer.dispose();
    window.removeEventListener("resize", this.handleResize);
  }
}
