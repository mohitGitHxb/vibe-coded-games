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

    // iOS-specific canvas preparation
    this.prepareCanvasForIOS();

    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.setupResizeHandler();

    // Validate WebGL context on iOS
    this.validateWebGLContext();
  }

  /**
   * Prepare canvas for iOS rendering
   */
  private prepareCanvasForIOS(): void {
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (isIOS) {
      // Force canvas size update to ensure proper initialization
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width * window.devicePixelRatio;
      this.canvas.height = rect.height * window.devicePixelRatio;
      this.canvas.style.width = rect.width + "px";
      this.canvas.style.height = rect.height + "px";

      console.log("📱 Canvas prepared for iOS rendering");
    }
  }

  /**
   * Validate WebGL context works properly
   */
  private validateWebGLContext(): void {
    if (!this.renderer || !this.renderer.getContext()) {
      console.error("❌ WebGL context failed to initialize");
      return;
    }

    const gl = this.renderer.getContext();
    if (gl.getError() !== gl.NO_ERROR) {
      console.warn("⚠️ WebGL context has errors, attempting recovery");
      this.renderer.setClearColor(0x000811, 1.0);
      gl.clearColor(0, 8 / 255, 17 / 255, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }

    console.log("✅ WebGL context validated successfully");
  }

  /**
   * Initialize Three.js scene
   */
  private initScene(): void {
    this.scene = new THREE.Scene();

    // iOS-specific background handling
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    if (isIOS) {
      // For iOS, use a more explicit color setup to prevent white patches
      const backgroundColor = new THREE.Color(0x000811);
      backgroundColor.convertSRGBToLinear(); // Ensure proper color space
      this.scene.background = backgroundColor;
    } else {
      this.scene.background = new THREE.Color(0x000811); // Dark space blue
    }
  }

  /**
   * Initialize orthographic camera for 2D gameplay
   */
  private initCamera(): void {
    // Start with a base viewport size that works well for gameplay
    this.updateCameraProjection();

    this.camera.position.set(0, 0, 10);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * Update camera projection based on current canvas size
   * Mobile-first approach: prioritize mobile experience
   */
  private updateCameraProjection(): void {
    const canvasWidth = Math.max(320, this.canvas.clientWidth); // Minimum 320px width
    const canvasHeight = Math.max(480, this.canvas.clientHeight); // Minimum 480px height
    const canvasAspect = canvasWidth / canvasHeight;

    let left, right, top, bottom;

    // Detect device type based on aspect ratio and screen size
    const isMobilePortrait =
      canvasAspect < 1 || Math.min(canvasWidth, canvasHeight) < 768;

    if (isMobilePortrait) {
      // Mobile/Portrait: Mobile-first approach
      // Use a viewport that makes game elements appropriately sized for mobile
      const baseViewportHeight = 800; // Optimized for mobile gameplay
      const height = baseViewportHeight / 2;
      top = height;
      bottom = -height;
      const width = height * canvasAspect;
      left = -width;
      right = width;
    } else {
      // Desktop/Landscape: Scale appropriately for larger screens
      const isTablet = canvasAspect > 1 && canvasAspect < 1.5; // Tablet landscape

      if (isTablet) {
        // Tablet landscape: Use medium scaling
        const baseViewportWidth = 1100;
        const width = baseViewportWidth / 2;
        left = -width;
        right = width;
        const height = width / canvasAspect;
        top = height;
        bottom = -height;
      } else {
        // Desktop: Use original game dimensions or scale up for very large screens
        const minViewportWidth = 1280;
        const scaleFactor = Math.max(1, Math.min(1.3, canvasWidth / 1280));
        const viewportWidth = minViewportWidth * scaleFactor;

        const width = viewportWidth / 2;
        const height = viewportWidth / canvasAspect / 2;

        left = -width;
        right = width;
        top = height;
        bottom = -height;
      }
    }

    if (this.camera) {
      this.camera.left = left;
      this.camera.right = right;
      this.camera.top = top;
      this.camera.bottom = bottom;
      this.camera.updateProjectionMatrix();
    } else {
      this.camera = new THREE.OrthographicCamera(
        left,
        right,
        top,
        bottom,
        0.1,
        5000 // near, far - increased for skybox visibility
      );
    }
  }

  /**
   * Initialize WebGL renderer
   */
  private initRenderer(): void {
    // iOS-specific WebGL context configuration
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !isIOS, // Disable antialiasing on iOS to prevent rendering issues
      alpha: false,
      premultipliedAlpha: false, // Critical for iOS - prevents white patches
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });

    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    // iOS-specific pixel ratio handling
    const pixelRatio = isIOS
      ? Math.min(window.devicePixelRatio, 2)
      : Math.min(window.devicePixelRatio, 2);
    this.renderer.setPixelRatio(pixelRatio);

    // Set clear color with explicit alpha
    this.renderer.setClearColor(0x000811, 1.0);

    // iOS-specific renderer settings
    if (isIOS) {
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      // Note: useLegacyLights removed in newer Three.js versions
      // Modern Three.js uses physically correct lighting by default
    }
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

    // Update camera projection to maintain proper aspect ratio
    this.updateCameraProjection();
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
   * Returns dynamic bounds based on current camera projection
   */
  public getWorldBounds() {
    const left = this.camera.left;
    const right = this.camera.right;
    const top = this.camera.top;
    const bottom = this.camera.bottom;

    return {
      left,
      right,
      top,
      bottom,
      width: right - left,
      height: top - bottom,
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
