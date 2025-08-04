import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export class AssetLoader {
  private loader: GLTFLoader;
  private textureLoader: THREE.TextureLoader;
  private loadedModels: Map<string, THREE.Group> = new Map();
  private loadedTextures: Map<string, THREE.Texture> = new Map();

  constructor() {
    this.loader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();
  }

  async loadModel(path: string, name: string): Promise<THREE.Group> {
    if (this.loadedModels.has(name)) {
      const cached = this.loadedModels.get(name)!;
      console.log(`Using cached model: ${name}`);
      return cached.clone();
    }

    try {
      console.log(`Loading model: ${path}`);
      const gltf = await this.loader.loadAsync(path);
      const model = gltf.scene;

      // Debug model info
      console.log(`Loaded model ${name}:`, model);
      console.log("Model children:", model.children);
      console.log("Model bounding box:", new THREE.Box3().setFromObject(model));

      // Ensure all materials are properly set up
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          console.log(
            `Mesh found: ${child.name}`,
            child.material,
            child.geometry
          );

          // Ensure materials exist and are visible
          if (!child.material) {
            child.material = new THREE.MeshLambertMaterial({ color: 0x888888 });
          }

          // Make sure the mesh is visible
          child.visible = true;
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      this.loadedModels.set(name, model);
      console.log(`Successfully loaded and cached model: ${name}`);
      return model.clone();
    } catch (error) {
      console.warn(`Could not load model: ${path}`, error);
      // Return a more visible placeholder
      const geometry = new THREE.BoxGeometry(0.5, 0.2, 1.0);
      const material = new THREE.MeshLambertMaterial({
        color: 0xff0000,
        transparent: false,
        side: THREE.DoubleSide,
      });
      const placeholder = new THREE.Mesh(geometry, material);
      placeholder.name = `placeholder-${name}`;
      const group = new THREE.Group();
      group.add(placeholder);
      group.name = `placeholder-group-${name}`;
      console.log(`Created placeholder for ${name}:`, group);
      return group;
    }
  }

  async loadTexture(path: string, name: string): Promise<THREE.Texture> {
    if (this.loadedTextures.has(name)) {
      return this.loadedTextures.get(name)!;
    }

    try {
      const texture = await this.textureLoader.loadAsync(path);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      this.loadedTextures.set(name, texture);
      return texture;
    } catch (error) {
      console.warn(`Could not load texture: ${path}`, error);
      // Return a default white texture
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, 1, 1);
      const texture = new THREE.CanvasTexture(canvas);
      this.loadedTextures.set(name, texture);
      return texture;
    }
  }

  async loadGameAssets(): Promise<void> {
    console.log("Loading game assets...");

    try {
      // Load character models (with fallbacks)
      await this.loadModel("/character-a.glb", "player");
      await this.loadModel("/character-b.glb", "enemy1");
      await this.loadModel("/character-c.glb", "enemy2");

      // Load weapon models (with fallbacks)
      await this.loadModel("/Assault_Rifle.glb", "rifle");
      await this.loadModel("/Assault_Rifle-Bgvuu4CUMV.glb", "enemy-weapon");

      // Load textures (with fallbacks)
      await this.loadTexture("/Textures/texture-a.png", "arena-floor");
      await this.loadTexture("/Textures/texture-b.png", "arena-wall");
      await this.loadTexture("/Textures/texture-c.png", "cover");

      console.log("Assets loaded successfully!");
    } catch (error) {
      console.warn("Some assets failed to load, using placeholders");
    }
  }
}
