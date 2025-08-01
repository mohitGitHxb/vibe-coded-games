import * as THREE from "three";
import { GAME_CONFIG } from "../utils/Constants";

export interface EnvironmentObject {
  id: number;
  mesh: THREE.Object3D;
  position: THREE.Vector3;
  type: string;
  side: "left" | "right";
}

export class Environment {
  private scene!: THREE.Scene;
  private camera!: THREE.Camera;
  private objects: EnvironmentObject[] = [];
  private nextObjectId: number = 0;
  private lastSpawnZ: number = 0;

  // Background elements that follow the camera
  private skybox!: THREE.Mesh;
  private distantCityLeft!: THREE.Mesh;
  private distantCityRight!: THREE.Mesh;
  private mountains!: THREE.Mesh;

  // Shared geometries and materials
  private treeGeometry!: THREE.BufferGeometry;
  private treeMaterial!: THREE.MeshLambertMaterial;
  private buildingGeometry!: THREE.BufferGeometry;
  private buildingMaterial!: THREE.MeshLambertMaterial;

  // Performance settings
  private maxTotalObjects = 80; // Reduced for better performance
  private spawnCounter = 0;

  constructor() {
    this.initializeOptimizedMaterials();
    this.createBackgroundElements();
  }

  public setScene(scene: THREE.Scene): void {
    this.scene = scene;
    this.addBackgroundToScene();
  }

  public setCamera(camera: THREE.Camera): void {
    this.camera = camera;
  }

  private initializeOptimizedMaterials(): void {
    // Optimized materials for roadside objects
    this.treeGeometry = new THREE.ConeGeometry(2, 6, 6);
    this.treeMaterial = new THREE.MeshLambertMaterial({
      color: 0x228b22,
      flatShading: true,
    });

    this.buildingGeometry = new THREE.BoxGeometry(6, 15, 8);
    this.buildingMaterial = new THREE.MeshLambertMaterial({
      color: 0x606060,
      flatShading: true,
    });

    console.log("Environment materials initialized");
  }

  private createBackgroundElements(): void {
    this.createSkybox();
    this.createDistantCityscape();
    this.createMountains();
  }

  private createSkybox(): void {
    // Create a large sphere that will always surround the camera
    const skyboxGeometry = new THREE.SphereGeometry(500, 16, 8);

    // Create dynamic gradient sky
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const context = canvas.getContext("2d")!;

    // Create beautiful city night sky gradient
    const gradient = context.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, "#0a0a1a"); // Very dark blue at top
    gradient.addColorStop(0.2, "#1a1a2e"); // Dark blue
    gradient.addColorStop(0.4, "#16213e"); // Medium blue
    gradient.addColorStop(0.7, "#2d1b3d"); // Purple
    gradient.addColorStop(0.9, "#4a2c3e"); // Dark red
    gradient.addColorStop(1, "#ff6b6b"); // Orange horizon

    context.fillStyle = gradient;
    context.fillRect(0, 0, 1024, 512);

    // Add stars
    context.fillStyle = "#ffffff";
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 200; // Only in upper part
      const size = Math.random() * 2;
      context.fillRect(x, y, size, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.repeat.x = 3;

    const skyboxMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.BackSide,
      fog: false,
    });

    this.skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
    console.log("Dynamic skybox created");
  }

  private createDistantCityscape(): void {
    // Left side distant city
    const leftCityGeometry = new THREE.PlaneGeometry(200, 60);
    const leftCityCanvas = this.createCityTexture(400, 120, "left");
    const leftCityTexture = new THREE.CanvasTexture(leftCityCanvas);
    const leftCityMaterial = new THREE.MeshBasicMaterial({
      map: leftCityTexture,
      transparent: true,
      opacity: 0.8,
      fog: false,
    });

    this.distantCityLeft = new THREE.Mesh(leftCityGeometry, leftCityMaterial);
    this.distantCityLeft.position.set(-150, 20, 0);

    // Right side distant city
    const rightCityGeometry = new THREE.PlaneGeometry(200, 60);
    const rightCityCanvas = this.createCityTexture(400, 120, "right");
    const rightCityTexture = new THREE.CanvasTexture(rightCityCanvas);
    const rightCityMaterial = new THREE.MeshBasicMaterial({
      map: rightCityTexture,
      transparent: true,
      opacity: 0.8,
      fog: false,
    });

    this.distantCityRight = new THREE.Mesh(
      rightCityGeometry,
      rightCityMaterial
    );
    this.distantCityRight.position.set(150, 20, 0);

    console.log("Distant cityscape created");
  }

  private createCityTexture(
    width: number,
    height: number,
    side: string
  ): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d")!;

    // Clear with transparent background
    context.clearRect(0, 0, width, height);

    // Create city silhouette
    const buildingCount = 15;
    for (let i = 0; i < buildingCount; i++) {
      const x = (i / buildingCount) * width;
      const buildingWidth = width / buildingCount + Math.random() * 20;
      const buildingHeight = 40 + Math.random() * 60;

      // Building outline
      context.fillStyle = "#0f0f23";
      context.fillRect(
        x,
        height - buildingHeight,
        buildingWidth,
        buildingHeight
      );

      // Add lit windows
      const windowRows = Math.floor(buildingHeight / 8);
      const windowCols = Math.floor(buildingWidth / 6);

      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowCols; col++) {
          if (Math.random() > 0.6) {
            // 40% chance for lit window
            context.fillStyle = Math.random() > 0.5 ? "#ffff88" : "#88aaff";
            const winX = x + col * 6 + 2;
            const winY = height - buildingHeight + row * 8 + 2;
            context.fillRect(winX, winY, 3, 4);
          }
        }
      }

      // Add antenna/details on some buildings
      if (Math.random() > 0.7) {
        context.fillStyle = "#ff4444";
        context.fillRect(
          x + buildingWidth / 2 - 1,
          height - buildingHeight - 5,
          2,
          5
        );
      }
    }

    return canvas;
  }

  private createMountains(): void {
    // Create distant mountain silhouette
    const mountainGeometry = new THREE.PlaneGeometry(600, 80);
    const mountainCanvas = document.createElement("canvas");
    mountainCanvas.width = 600;
    mountainCanvas.height = 80;
    const context = mountainCanvas.getContext("2d")!;

    // Create mountain silhouette
    context.fillStyle = "#1a1a2e";
    context.beginPath();
    context.moveTo(0, 80);

    for (let i = 0; i <= 600; i += 20) {
      const height = 20 + Math.sin(i * 0.02) * 15 + Math.sin(i * 0.005) * 25;
      context.lineTo(i, 80 - height);
    }

    context.lineTo(600, 80);
    context.closePath();
    context.fill();

    const mountainTexture = new THREE.CanvasTexture(mountainCanvas);
    const mountainMaterial = new THREE.MeshBasicMaterial({
      map: mountainTexture,
      transparent: true,
      opacity: 0.6,
      fog: false,
    });

    this.mountains = new THREE.Mesh(mountainGeometry, mountainMaterial);
    this.mountains.position.set(0, 10, -300);

    console.log("Mountain backdrop created");
  }

  private addBackgroundToScene(): void {
    this.scene.add(this.skybox);
    this.scene.add(this.distantCityLeft);
    this.scene.add(this.distantCityRight);
    this.scene.add(this.mountains);
    console.log("Background elements added to scene");
  }

  public update(playerZ: number): void {
    // Update background elements to follow camera
    this.updateBackgroundPosition(playerZ);

    // Spawn roadside objects (throttled)
    if (this.spawnCounter % 4 === 0) {
      // Even more throttled
      this.spawnRoadsideObjects(playerZ);
    }
    this.spawnCounter++;

    this.removeDistantObjects(playerZ);
  }

  private updateBackgroundPosition(playerZ: number): void {
    if (this.camera) {
      // Keep skybox centered on camera
      this.skybox.position.copy(this.camera.position);

      // Move distant city and mountains slightly to create parallax effect
      const parallaxOffset = playerZ * 0.1; // Slow parallax movement

      this.distantCityLeft.position.z = this.camera.position.z + parallaxOffset;
      this.distantCityRight.position.z =
        this.camera.position.z + parallaxOffset;
      this.mountains.position.z = this.camera.position.z + parallaxOffset * 0.5;
    }
  }

  private spawnRoadsideObjects(playerZ: number): void {
    if (this.objects.length >= this.maxTotalObjects) {
      return;
    }

    const spawnDistance = 120;
    const spawnInterval = 50; // Increased interval

    if (playerZ > this.lastSpawnZ + spawnInterval) {
      this.lastSpawnZ = playerZ;

      // Spawn simple roadside objects
      this.spawnRoadsideCluster(playerZ + spawnDistance, "left");
      this.spawnRoadsideCluster(playerZ + spawnDistance, "right");
    }
  }

  private spawnRoadsideCluster(z: number, side: "left" | "right"): void {
    const sideMultiplier = side === "left" ? -1 : 1;
    const roadWidth = GAME_CONFIG.MAX_LANES * GAME_CONFIG.LANE_WIDTH;
    const baseX = sideMultiplier * (roadWidth / 2 + 20);

    // Simple random choice between tree and building
    const spawnTree = Math.random() > 0.3; // 70% trees, 30% buildings

    if (spawnTree) {
      this.spawnSimpleTree(
        baseX + sideMultiplier * Math.random() * 25,
        z,
        side
      );
    } else {
      this.spawnSimpleBuilding(baseX + sideMultiplier * 35, z, side);
    }
  }

  private spawnSimpleTree(x: number, z: number, side: "left" | "right"): void {
    const tree = new THREE.Mesh(this.treeGeometry, this.treeMaterial);
    tree.position.set(x, 3, z);
    tree.rotation.y = Math.random() * Math.PI * 2;

    // Vary size
    const scale = 0.7 + Math.random() * 0.8;
    tree.scale.setScalar(scale);

    this.scene.add(tree);

    this.objects.push({
      id: this.nextObjectId++,
      mesh: tree,
      position: new THREE.Vector3(x, 0, z),
      type: "tree",
      side: side,
    });
  }

  private spawnSimpleBuilding(
    x: number,
    z: number,
    side: "left" | "right"
  ): void {
    const building = new THREE.Mesh(
      this.buildingGeometry,
      this.buildingMaterial.clone()
    );

    building.position.set(x, 7.5, z);

    // Random height variation
    const heightScale = 0.5 + Math.random() * 1.0;
    building.scale.y = heightScale;
    building.position.y = 7.5 * heightScale;

    // Slight color variation
    const colorVariation = 0.6 + Math.random() * 0.6;
    (building.material as THREE.MeshLambertMaterial).color.multiplyScalar(
      colorVariation
    );

    this.scene.add(building);

    this.objects.push({
      id: this.nextObjectId++,
      mesh: building,
      position: new THREE.Vector3(x, 0, z),
      type: "building",
      side: side,
    });
  }

  private removeDistantObjects(playerZ: number): void {
    const despawnDistance = -70;

    const objectsToRemove = this.objects.filter(
      (obj) => obj.position.z < playerZ + despawnDistance
    );

    if (objectsToRemove.length > 0) {
      for (const obj of objectsToRemove) {
        this.scene.remove(obj.mesh);

        // Dispose cloned materials
        if (
          obj.mesh instanceof THREE.Mesh &&
          obj.mesh.material !== this.treeMaterial &&
          obj.mesh.material !== this.buildingMaterial
        ) {
          (obj.mesh.material as THREE.Material).dispose();
        }
      }

      this.objects = this.objects.filter(
        (obj) => obj.position.z >= playerZ + despawnDistance
      );
    }
  }

  public dispose(): void {
    // Remove roadside objects
    for (const obj of this.objects) {
      this.scene.remove(obj.mesh);
      if (
        obj.mesh instanceof THREE.Mesh &&
        obj.mesh.material !== this.treeMaterial &&
        obj.mesh.material !== this.buildingMaterial
      ) {
        (obj.mesh.material as THREE.Material).dispose();
      }
    }
    this.objects = [];

    // Remove background elements
    if (this.skybox) {
      this.scene.remove(this.skybox);
      this.skybox.geometry.dispose();
      (this.skybox.material as THREE.Material).dispose();
    }

    if (this.distantCityLeft) {
      this.scene.remove(this.distantCityLeft);
      this.distantCityLeft.geometry.dispose();
      (this.distantCityLeft.material as THREE.Material).dispose();
    }

    if (this.distantCityRight) {
      this.scene.remove(this.distantCityRight);
      this.distantCityRight.geometry.dispose();
      (this.distantCityRight.material as THREE.Material).dispose();
    }

    if (this.mountains) {
      this.scene.remove(this.mountains);
      this.mountains.geometry.dispose();
      (this.mountains.material as THREE.Material).dispose();
    }

    // Dispose shared materials
    this.treeGeometry?.dispose();
    this.treeMaterial?.dispose();
    this.buildingGeometry?.dispose();
    this.buildingMaterial?.dispose();

    console.log("Environment with persistent background disposed");
  }
}
