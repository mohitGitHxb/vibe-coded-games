import * as THREE from "three";
import { AssetLoader } from "../utils/AssetLoader.js";
import { GAME_CONFIG } from "../utils/GameConfig.js";

export class GameScene {
  public scene: THREE.Scene;
  public renderer!: THREE.WebGLRenderer;
  private assetLoader: AssetLoader;

  constructor() {
    this.scene = new THREE.Scene();
    this.assetLoader = new AssetLoader();

    this.initializeRenderer();
    this.setupLighting();
    this.createArena();
  }

  private initializeRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
    });

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x87ceeb, 1); // Sky blue background
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Append to body instead of app div to ensure visibility
    const appDiv = document.querySelector("#app");
    if (appDiv) {
      appDiv.appendChild(this.renderer.domElement);
    } else {
      document.body.appendChild(this.renderer.domElement);
    }

    // Handle window resize
    window.addEventListener("resize", () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private setupLighting(): void {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    this.scene.add(ambientLight);

    // Directional light (sun) with shadows
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(50, 100, 50);
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

    // Add a point light for additional illumination
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
    pointLight.position.set(0, 10, 0);
    this.scene.add(pointLight);
  }

  private createArena(): void {
    const arenaSize = GAME_CONFIG.ARENA_SIZE;

    // Create arena floor with visible texture
    const floorGeometry = new THREE.PlaneGeometry(arenaSize, arenaSize);
    const floorMaterial = new THREE.MeshLambertMaterial({
      color: 0x90ee90, // Light green for visibility
      transparent: false,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Create arena walls with different colors for visibility
    this.createArenaWalls(arenaSize);

    // Add some basic cover objects
    this.createCoverObjects();

    console.log("Arena created with floor and walls");
  }

  private createArenaWalls(size: number): void {
    const wallHeight = GAME_CONFIG.ARENA_HEIGHT;
    const wallThickness = 1;

    // Different colored walls for easy identification
    const wallColors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4]; // Red, Cyan, Blue, Green
    const wallConfigs = [
      {
        pos: [0, wallHeight / 2, -size / 2],
        size: [size, wallHeight, wallThickness],
      }, // North (Red)
      {
        pos: [0, wallHeight / 2, size / 2],
        size: [size, wallHeight, wallThickness],
      }, // South (Cyan)
      {
        pos: [size / 2, wallHeight / 2, 0],
        size: [wallThickness, wallHeight, size],
      }, // East (Blue)
      {
        pos: [-size / 2, wallHeight / 2, 0],
        size: [wallThickness, wallHeight, size],
      }, // West (Green)
    ];

    wallConfigs.forEach((config, index) => {
      const wallMaterial = new THREE.MeshLambertMaterial({
        color: wallColors[index],
      });
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(config.size[0], config.size[1], config.size[2]),
        wallMaterial
      );
      wall.position.set(config.pos[0], config.pos[1], config.pos[2]);
      wall.castShadow = true;
      wall.receiveShadow = true;
      this.scene.add(wall);
    });
  }

  private createCoverObjects(): void {
    const coverMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 }); // Brown

    // Create 4 cover boxes in the center area
    const positions = [
      { x: -8, z: -8 },
      { x: 8, z: -8 },
      { x: -8, z: 8 },
      { x: 8, z: 8 },
    ];

    positions.forEach((pos) => {
      const cover = new THREE.Mesh(
        new THREE.BoxGeometry(3, 2, 3),
        coverMaterial
      );
      cover.position.set(pos.x, 1, pos.z);
      cover.castShadow = true;
      cover.receiveShadow = true;
      this.scene.add(cover);
    });

    console.log("Cover objects created");
  }

  public async loadAssets(): Promise<void> {
    await this.assetLoader.loadGameAssets();
  }

  public getAssetLoader(): AssetLoader {
    return this.assetLoader;
  }
}
