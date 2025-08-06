/**
 * Materials Demo - Interactive 3D Materials Showcase
 *
 * Demonstrates all materials from the restructured system
 * on different 3D shapes with real-time switching
 */

import * as THREE from "three";
import { MaterialFactory } from "../MaterialFactory.js";
import { COMPLETE_MATERIALS_REGISTRY } from "../repository/materials-registry.js";

class MaterialsDemo {
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private factory: MaterialFactory;
  private currentMesh!: THREE.Mesh;
  private currentShape: string = "sphere";
  private currentMaterial: string = "grass";
  private rotationEnabled: boolean = true;

  // Geometries
  private geometries: { [key: string]: THREE.BufferGeometry } = {};

  // Materials registry - Complete collection from registry
  private materials = COMPLETE_MATERIALS_REGISTRY;

  constructor() {
    this.factory = new MaterialFactory();

    this.setupScene();
    this.setupGeometries();
    this.setupLighting();
    this.createInitialMesh();
    this.setupControls();
    this.animate();
  }

  private setupScene() {
    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0a);

    // Camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.camera.position.set(0, 0, 5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(this.renderer.domElement);

    // Handle resize
    window.addEventListener("resize", () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  private setupGeometries() {
    this.geometries = {
      sphere: new THREE.SphereGeometry(1.5, 32, 32),
      cube: new THREE.BoxGeometry(2, 2, 2),
      torus: new THREE.TorusGeometry(1.2, 0.4, 16, 100),
    };
  }

  private setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    // Main directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);

    // Fill lights
    const fillLight1 = new THREE.DirectionalLight(0x4fc3f7, 0.3);
    fillLight1.position.set(-5, 3, -2);
    this.scene.add(fillLight1);

    const fillLight2 = new THREE.DirectionalLight(0xff6b95, 0.2);
    fillLight2.position.set(2, -3, -5);
    this.scene.add(fillLight2);

    // Point light for extra sparkle
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 10);
    pointLight.position.set(-2, 2, 3);
    this.scene.add(pointLight);
  }

  private createInitialMesh() {
    const materialInstance = new this.materials[this.currentMaterial].class();
    const material = this.factory.create(materialInstance);
    const geometry = this.geometries[this.currentShape];

    this.currentMesh = new THREE.Mesh(geometry, material);
    this.currentMesh.castShadow = true;
    this.currentMesh.receiveShadow = true;
    this.scene.add(this.currentMesh);
  }

  private setupControls() {
    // Material buttons
    const materialButtons = document.querySelectorAll(".material-button");
    materialButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const materialKey = (e.target as HTMLElement).getAttribute(
          "data-material"
        );
        if (materialKey && this.materials[materialKey]) {
          this.switchMaterial(materialKey);

          // Update active state
          materialButtons.forEach((b) => b.classList.remove("active"));
          button.classList.add("active");
        }
      });
    });

    // Shape buttons
    const shapeButtons = document.querySelectorAll(".shape-button");
    shapeButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const shapeKey = (e.target as HTMLElement).getAttribute("data-shape");
        if (shapeKey && this.geometries[shapeKey]) {
          this.switchShape(shapeKey);

          // Update active state
          shapeButtons.forEach((b) => b.classList.remove("active"));
          button.classList.add("active");
        }
      });
    });

    // Camera controls
    const pauseBtn = document.getElementById("pause-rotation");
    pauseBtn?.addEventListener("click", () => {
      this.rotationEnabled = !this.rotationEnabled;
      pauseBtn.textContent = this.rotationEnabled ? "⏸️ Pause" : "▶️ Play";
    });

    const resetBtn = document.getElementById("reset-camera");
    resetBtn?.addEventListener("click", () => {
      this.camera.position.set(0, 0, 5);
      this.camera.lookAt(0, 0, 0);
    });

    // Mouse controls for camera
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener("mousemove", (event) => {
      mouseX = (event.clientX - window.innerWidth / 2) / window.innerWidth;
      mouseY = (event.clientY - window.innerHeight / 2) / window.innerHeight;

      if (this.rotationEnabled) {
        this.camera.position.x = mouseX * 2;
        this.camera.position.y = -mouseY * 2;
        this.camera.lookAt(0, 0, 0);
      }
    });
  }

  private switchMaterial(materialKey: string) {
    if (!this.materials[materialKey]) return;

    this.currentMaterial = materialKey;
    const materialData = this.materials[materialKey];

    // Create new material
    const materialInstance = new materialData.class();
    const newMaterial = this.factory.create(materialInstance);

    // Update mesh material
    if (this.currentMesh.material) {
      (this.currentMesh.material as THREE.Material).dispose();
    }
    this.currentMesh.material = newMaterial;

    // Update UI
    this.updateMaterialInfo(materialData.name, materialData.description);
  }

  private switchShape(shapeKey: string) {
    if (!this.geometries[shapeKey]) return;

    this.currentShape = shapeKey;

    // Update mesh geometry
    this.currentMesh.geometry = this.geometries[shapeKey];
  }

  private updateMaterialInfo(name: string, description: string) {
    const nameEl = document.getElementById("current-material-name");
    const infoEl = document.getElementById("current-material-info");

    if (nameEl) nameEl.textContent = name;
    if (infoEl) infoEl.textContent = description;
  }

  private animate() {
    requestAnimationFrame(() => this.animate());

    // Rotate the mesh
    if (this.rotationEnabled && this.currentMesh) {
      this.currentMesh.rotation.x += 0.005;
      this.currentMesh.rotation.y += 0.01;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Initialize demo when page loads
document.addEventListener("DOMContentLoaded", () => {
  new MaterialsDemo();
});
