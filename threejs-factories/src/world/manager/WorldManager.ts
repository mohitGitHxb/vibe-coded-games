import * as THREE from "three";
import type {
  WorldConfig,
  WorldState,
  CameraConfig,
  LightConfig,
  SkyboxConfig,
  SceneObject,
} from "../types/WorldTypes";
import { CameraManager } from "../core/CameraManager";
import { LightManager } from "../core/LightManager";
import { SkyboxGenerator } from "../core/SkyboxGenerator";
import {
  DEFAULT_WORLD_CONFIG,
  DEFAULT_CAMERA_CONFIG,
} from "../constants/WorldDefaults";

export class WorldManager {
  private state: WorldState;
  private cameraManager: CameraManager;
  private lightManager: LightManager;
  private skyboxGenerator: SkyboxGenerator;
  private renderer?: THREE.WebGLRenderer;

  constructor(config: Partial<WorldConfig> = {}) {
    const finalConfig = { ...DEFAULT_WORLD_CONFIG, ...config };

    // Initialize core managers
    this.cameraManager = new CameraManager();
    this.lightManager = new LightManager();
    this.skyboxGenerator = new SkyboxGenerator();

    // Initialize world state
    this.state = {
      scene: new THREE.Scene(),
      camera: this.cameraManager.createCamera(DEFAULT_CAMERA_CONFIG),
      lights: new Map(),
      objects: new Map(),
    };

    // Apply world configuration
    this.applyWorldConfig(finalConfig);
  }

  // Core scene management
  getScene(): THREE.Scene {
    return this.state.scene;
  }

  getCamera(): THREE.Camera {
    return this.state.camera;
  }

  getRenderer(): THREE.WebGLRenderer | undefined {
    return this.renderer;
  }

  // Renderer management
  createRenderer(
    canvas?: HTMLCanvasElement,
    config: any = {}
  ): THREE.WebGLRenderer {
    const rendererConfig = {
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
      ...config,
    };

    this.renderer = new THREE.WebGLRenderer(rendererConfig);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Enable shadows if configured
    if (DEFAULT_WORLD_CONFIG.shadows?.enabled) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type =
        DEFAULT_WORLD_CONFIG.shadows.type || THREE.PCFSoftShadowMap;
    }

    this.state.renderer = this.renderer;
    return this.renderer;
  }

  // Camera management
  useCamera(config: Partial<CameraConfig>): THREE.Camera {
    this.state.camera = this.cameraManager.createCamera(config);
    return this.state.camera;
  }

  usePerspectiveCamera(
    fov = 75,
    aspect?: number,
    near = 0.1,
    far = 1000
  ): THREE.PerspectiveCamera {
    this.state.camera = this.cameraManager.createPerspectiveCamera(
      fov,
      aspect,
      near,
      far
    );
    return this.state.camera as THREE.PerspectiveCamera;
  }

  useOrthographicCamera(
    left = -10,
    right = 10,
    top = 10,
    bottom = -10,
    near = 0.1,
    far = 1000
  ): THREE.OrthographicCamera {
    this.state.camera = this.cameraManager.createOrthographicCamera(
      left,
      right,
      top,
      bottom,
      near,
      far
    );
    return this.state.camera as THREE.OrthographicCamera;
  }

  updateCameraAspect(aspect: number): void {
    this.cameraManager.updateAspect(this.state.camera, aspect);
  }

  animateCameraTo(
    targetPosition: THREE.Vector3,
    targetLookAt?: THREE.Vector3,
    duration = 1000
  ): Promise<void> {
    return this.cameraManager.animateCameraTo(
      this.state.camera,
      targetPosition,
      targetLookAt,
      duration
    );
  }

  // Lighting management
  addLight(id: string, config: LightConfig): THREE.Light {
    const light = this.lightManager.createLight(id, config);
    this.state.scene.add(light);

    // Add target for directional/spot lights
    if (
      (light instanceof THREE.DirectionalLight ||
        light instanceof THREE.SpotLight) &&
      light.target
    ) {
      this.state.scene.add(light.target);
    }

    this.state.lights.set(id, light);
    return light;
  }

  removeLight(id: string): boolean {
    const light = this.state.lights.get(id);
    if (light) {
      this.state.scene.remove(light);

      // Remove target if it exists
      if (
        (light instanceof THREE.DirectionalLight ||
          light instanceof THREE.SpotLight) &&
        light.target
      ) {
        this.state.scene.remove(light.target);
      }

      this.lightManager.removeLight(id);
      this.state.lights.delete(id);
      return true;
    }
    return false;
  }

  getLight(id: string): THREE.Light | undefined {
    return this.state.lights.get(id);
  }

  addDefaultLighting(): Map<string, THREE.Light> {
    // Clear existing lights first
    this.clearLights();

    // Create default lighting setup
    const defaultLights = this.lightManager.createLightingPreset("default");

    // Add each light to the scene and state
    defaultLights.forEach((light, id) => {
      this.state.scene.add(light);
      if (light instanceof THREE.DirectionalLight && light.target) {
        this.state.scene.add(light.target);
      }
      this.state.lights.set(id, light);
    });

    return this.state.lights;
  }

  addStudioLighting(): Map<string, THREE.Light> {
    // Clear existing lights first
    this.clearLights();

    // Create studio lighting setup
    const studioLights = this.lightManager.createLightingPreset("studio");

    // Add each light to the scene and state
    studioLights.forEach((light, id) => {
      this.state.scene.add(light);
      if (light instanceof THREE.DirectionalLight && light.target) {
        this.state.scene.add(light.target);
      }
      this.state.lights.set(id, light);
    });

    return this.state.lights;
  }

  addOutdoorLighting(): Map<string, THREE.Light> {
    // Clear existing lights first
    this.clearLights();

    // Create outdoor lighting setup
    const outdoorLights = this.lightManager.createLightingPreset("outdoor");

    // Add each light to the scene and state
    outdoorLights.forEach((light, id) => {
      this.state.scene.add(light);
      if (light instanceof THREE.DirectionalLight && light.target) {
        this.state.scene.add(light.target);
      }
      this.state.lights.set(id, light);
    });

    return this.state.lights;
  }

  clearLights(): void {
    this.state.lights.forEach((_light, id) => {
      this.removeLight(id);
    });
  }

  // Object management
  addObject(
    id: string,
    object: THREE.Object3D,
    metadata?: Record<string, any>
  ): void {
    this.state.scene.add(object);

    // Store metadata for future use
    if (metadata) {
      (object as any).__metadata = {
        id,
        type: this.determineObjectType(object),
        ...metadata,
      };
    }

    this.state.objects.set(id, object);
  }

  removeObject(id: string): boolean {
    const object = this.state.objects.get(id);
    if (object) {
      this.state.scene.remove(object);
      this.state.objects.delete(id);
      return true;
    }
    return false;
  }

  getObject(id: string): THREE.Object3D | undefined {
    return this.state.objects.get(id);
  }

  getAllObjects(): Map<string, THREE.Object3D> {
    return this.state.objects;
  }

  clearObjects(): void {
    this.state.objects.forEach((_object, id) => {
      this.removeObject(id);
    });
  }

  // Skybox management
  async addSkybox(config: SkyboxConfig): Promise<void> {
    // Remove existing skybox
    if (this.state.skybox) {
      this.state.scene.remove(this.state.skybox);
    }

    const skybox = await this.skyboxGenerator.createSkybox(config);

    if (skybox instanceof THREE.Object3D) {
      this.state.scene.add(skybox);
      this.state.skybox = skybox;
    } else if (skybox instanceof THREE.Texture) {
      this.state.scene.background = skybox;
    }
  }

  removeSkybox(): void {
    if (this.state.skybox) {
      this.state.scene.remove(this.state.skybox);
      this.state.skybox = undefined;
    }
    this.state.scene.background = null;
  }

  // Environment management
  setBackground(color: string | number | THREE.Color): void {
    this.state.scene.background = new THREE.Color(color);
  }

  setFog(
    type: "linear" | "exponential",
    color: string | number,
    near?: number,
    far?: number,
    density?: number
  ): void {
    if (type === "linear") {
      this.state.scene.fog = new THREE.Fog(color, near || 1, far || 1000);
    } else {
      this.state.scene.fog = new THREE.FogExp2(color, density || 0.002);
    }
  }

  removeFog(): void {
    this.state.scene.fog = null;
  }

  // Utility methods
  render(): void {
    if (this.renderer) {
      this.renderer.render(this.state.scene, this.state.camera);
    }
  }

  resize(width: number, height: number): void {
    if (this.renderer) {
      this.renderer.setSize(width, height);
      this.updateCameraAspect(width / height);
    }
  }

  // Helper methods
  private applyWorldConfig(config: WorldConfig): void {
    if (config.background) {
      this.setBackground(config.background);
    }

    if (config.fog) {
      this.setFog(
        config.fog.type,
        config.fog.color,
        config.fog.near,
        config.fog.far,
        config.fog.density
      );
    }
  }

  private determineObjectType(object: THREE.Object3D): SceneObject["type"] {
    if (object instanceof THREE.Mesh) return "mesh";
    if (object instanceof THREE.Light) return "light";
    if (object instanceof THREE.Camera) return "camera";
    if (object instanceof THREE.Group) return "group";
    return "mesh"; // Default fallback
  }

  // Cleanup
  dispose(): void {
    // Dispose of lights
    this.lightManager.dispose();

    // Dispose of objects
    this.state.objects.forEach((object) => {
      if (object instanceof THREE.Mesh) {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((material) => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      }
    });

    // Dispose of renderer
    if (this.renderer) {
      this.renderer.dispose();
    }

    // Clear all references
    this.state.objects.clear();
    this.state.lights.clear();
  }
}
