import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

interface AssetCache {
  [key: string]: THREE.Group;
}

export class AssetManager {
  private static instance: AssetManager;
  private loader: GLTFLoader;
  private cache: AssetCache = {};
  private loadingPromises: Map<string, Promise<THREE.Group>> = new Map();

  private constructor() {
    this.loader = new GLTFLoader();
  }

  static getInstance(): AssetManager {
    if (!AssetManager.instance) {
      AssetManager.instance = new AssetManager();
    }
    return AssetManager.instance;
  }

  async loadModel(path: string, name: string): Promise<THREE.Group | null> {
    // Return cached model if available
    if (this.cache[name]) {
      return this.cache[name].clone();
    }

    // Return existing loading promise if in progress
    if (this.loadingPromises.has(name)) {
      const result = await this.loadingPromises.get(name);
      return result ? result.clone() : null;
    }

    // Start new loading process
    const loadingPromise = this.loadModelInternal(path, name);
    this.loadingPromises.set(name, loadingPromise);

    try {
      const result = await loadingPromise;
      this.loadingPromises.delete(name);
      return result ? result.clone() : null;
    } catch (error) {
      this.loadingPromises.delete(name);
      console.error(`Failed to load model ${name} from ${path}:`, error);
      return null;
    }
  }

  private async loadModelInternal(
    path: string,
    name: string
  ): Promise<THREE.Group> {
    const gltf = await this.loader.loadAsync(path);

    if (!gltf || !gltf.scene) {
      throw new Error(`Invalid GLTF file: ${path}`);
    }

    // Setup shadows and materials
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.MeshStandardMaterial) {
                mat.needsUpdate = true;
              }
            });
          } else if (child.material instanceof THREE.MeshStandardMaterial) {
            child.material.needsUpdate = true;
          }
        }
      }
    });

    // Cache the model
    this.cache[name] = gltf.scene;
    console.log(`Successfully loaded and cached model: ${name}`);

    return gltf.scene;
  }

  preloadAssets(assets: { path: string; name: string }[]) {
    const promises = assets.map((asset) =>
      this.loadModel(asset.path, asset.name).catch((error) => {
        console.warn(`Failed to preload ${asset.name}:`, error);
        return null;
      })
    );

    return Promise.all(promises);
  }

  getModel(name: string): THREE.Group | null {
    return this.cache[name] ? this.cache[name].clone() : null;
  }

  hasModel(name: string): boolean {
    return !!this.cache[name];
  }

  clearCache(): void {
    this.cache = {};
    this.loadingPromises.clear();
  }
}
