import * as THREE from "three";
import type { PBRMaterialConfig } from "../types/MaterialTypes.js";
import { MATERIAL_CACHE_CONFIG } from "../constants/MaterialConstants.js";

/**
 * Core utilities for material creation and texture management
 */
export class MaterialCore {
  private textureLoader: THREE.TextureLoader;
  private textureCache: Map<string, THREE.Texture>;
  private defaultTextureBasePath: string;

  constructor(
    textureBasePath: string = MATERIAL_CACHE_CONFIG.DEFAULT_TEXTURE_BASE_PATH,
    textureLoader?: THREE.TextureLoader
  ) {
    this.textureLoader = textureLoader || new THREE.TextureLoader();
    this.textureCache = new Map();
    this.defaultTextureBasePath = textureBasePath;
  }

  /**
   * Loads a texture with caching support
   */
  async loadTexture(
    url: string,
    wrapS: THREE.Wrapping = THREE.RepeatWrapping,
    wrapT: THREE.Wrapping = THREE.RepeatWrapping,
    repeatX: number = 1,
    repeatY: number = 1
  ): Promise<THREE.Texture | null> {
    const cacheKey = `${url}${MATERIAL_CACHE_CONFIG.CACHE_KEY_SEPARATOR}${wrapS}${MATERIAL_CACHE_CONFIG.CACHE_KEY_SEPARATOR}${wrapT}${MATERIAL_CACHE_CONFIG.CACHE_KEY_SEPARATOR}${repeatX}${MATERIAL_CACHE_CONFIG.CACHE_KEY_SEPARATOR}${repeatY}`;

    if (this.textureCache.has(cacheKey)) {
      return this.textureCache.get(cacheKey)!;
    }

    try {
      const texture = await new Promise<THREE.Texture>((resolve, reject) => {
        this.textureLoader.load(url, resolve, undefined, reject);
      });

      texture.wrapS = wrapS;
      texture.wrapT = wrapT;
      texture.repeat.set(repeatX, repeatY);

      this.textureCache.set(cacheKey, texture);
      return texture;
    } catch (error) {
      console.warn(`Failed to load texture: ${url}`, error);
      return null;
    }
  }

  /**
   * Applies texture configuration to a material
   */
  async applyTextureConfiguration(
    material: THREE.MeshStandardMaterial,
    config: PBRMaterialConfig,
    textureDefaults: { [key: string]: string }
  ): Promise<void> {
    const basePath = config.textureBasePath || this.defaultTextureBasePath;
    const textures = { ...textureDefaults, ...config.customTextures };
    const repeat = config.textureRepeat || MATERIAL_CACHE_CONFIG.DEFAULT_REPEAT;

    // Load and apply textures
    if (textures.map) {
      material.map = await this.loadTexture(
        basePath + textures.map,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping,
        repeat.x,
        repeat.y
      );
    }

    if (textures.normalMap) {
      material.normalMap = await this.loadTexture(
        basePath + textures.normalMap,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping,
        repeat.x,
        repeat.y
      );
      if (config.normalScale !== undefined) {
        material.normalScale.setScalar(config.normalScale);
      }
    }

    if (textures.roughnessMap) {
      material.roughnessMap = await this.loadTexture(
        basePath + textures.roughnessMap,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping,
        repeat.x,
        repeat.y
      );
    }

    if (textures.metalnessMap) {
      material.metalnessMap = await this.loadTexture(
        basePath + textures.metalnessMap,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping,
        repeat.x,
        repeat.y
      );
    }

    if (textures.aoMap) {
      material.aoMap = await this.loadTexture(
        basePath + textures.aoMap,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping,
        repeat.x,
        repeat.y
      );
      if (config.aoIntensity !== undefined) {
        material.aoMapIntensity = config.aoIntensity;
      }
    }

    if (textures.displacementMap) {
      material.displacementMap = await this.loadTexture(
        basePath + textures.displacementMap,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping,
        repeat.x,
        repeat.y
      );
      if (config.displacementScale !== undefined) {
        material.displacementScale = config.displacementScale;
      }
    }

    if (textures.emissiveMap) {
      material.emissiveMap = await this.loadTexture(
        basePath + textures.emissiveMap,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping,
        repeat.x,
        repeat.y
      );
    }
  }

  /**
   * Disposes of all cached textures and clears the cache
   */
  dispose(): void {
    this.textureCache.forEach((texture) => {
      texture.dispose();
    });
    this.textureCache.clear();
  }

  /**
   * Gets information about the current texture cache
   */
  getCacheInfo(): { size: number; urls: string[] } {
    return {
      size: this.textureCache.size,
      urls: Array.from(this.textureCache.keys()),
    };
  }

  /**
   * Gets the default texture base path
   */
  getTextureBasePath(): string {
    return this.defaultTextureBasePath;
  }

  /**
   * Sets a new texture base path
   */
  setTextureBasePath(newBasePath: string): void {
    this.defaultTextureBasePath = newBasePath;
  }
}
