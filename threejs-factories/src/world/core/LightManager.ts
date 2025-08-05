import * as THREE from "three";
import type { LightConfig } from "../types/WorldTypes";

export class LightManager {
  private lights: Map<string, THREE.Light> = new Map();

  createLight(id: string, config: LightConfig): THREE.Light {
    let light: THREE.Light;

    switch (config.type) {
      case "ambient":
        light = new THREE.AmbientLight(
          config.color || 0xffffff,
          config.intensity || 0.5
        );
        break;

      case "directional":
        light = new THREE.DirectionalLight(
          config.color || 0xffffff,
          config.intensity || 1.0
        );
        if (config.position) {
          light.position.set(...config.position);
        }
        if (config.target && light instanceof THREE.DirectionalLight) {
          light.target.position.set(...config.target);
        }
        if (config.castShadow) {
          light.castShadow = true;
          if (light.shadow) {
            light.shadow.mapSize.width = 2048;
            light.shadow.mapSize.height = 2048;
            // Set shadow camera frustum for directional light
            if (light.shadow.camera instanceof THREE.OrthographicCamera) {
              light.shadow.camera.near = 0.5;
              light.shadow.camera.far = 500;
              light.shadow.camera.left = -50;
              light.shadow.camera.right = 50;
              light.shadow.camera.top = 50;
              light.shadow.camera.bottom = -50;
            }
          }
        }
        break;

      case "point":
        light = new THREE.PointLight(
          config.color || 0xffffff,
          config.intensity || 1.0,
          config.distance || 0,
          config.decay || 2
        );
        if (config.position) {
          light.position.set(...config.position);
        }
        if (config.castShadow) {
          light.castShadow = true;
          if (
            light.shadow &&
            light.shadow.camera instanceof THREE.PerspectiveCamera
          ) {
            light.shadow.camera.near = 0.1;
            light.shadow.camera.far = 100;
          }
        }
        break;

      case "spot":
        light = new THREE.SpotLight(
          config.color || 0xffffff,
          config.intensity || 1.0,
          config.distance || 0,
          config.angle || Math.PI / 3,
          config.penumbra || 0,
          config.decay || 2
        );
        if (config.position) {
          light.position.set(...config.position);
        }
        if (config.target && light instanceof THREE.SpotLight) {
          light.target.position.set(...config.target);
        }
        if (config.castShadow) {
          light.castShadow = true;
          if (
            light.shadow &&
            light.shadow.camera instanceof THREE.PerspectiveCamera
          ) {
            light.shadow.camera.near = 0.1;
            light.shadow.camera.far = 100;
          }
        }
        break;

      case "hemisphere":
        light = new THREE.HemisphereLight(
          config.color || 0xffffff,
          config.groundColor || 0x444444,
          config.intensity || 1.0
        );
        if (config.position) {
          light.position.set(...config.position);
        }
        break;

      default:
        throw new Error(`Unsupported light type: ${config.type}`);
    }

    this.lights.set(id, light);
    return light;
  }

  getLight(id: string): THREE.Light | undefined {
    return this.lights.get(id);
  }

  removeLight(id: string): boolean {
    const light = this.lights.get(id);
    if (light) {
      // Clean up shadow maps if they exist
      if (light.shadow) {
        light.shadow.dispose();
      }
      this.lights.delete(id);
      return true;
    }
    return false;
  }

  getAllLights(): Map<string, THREE.Light> {
    return new Map(this.lights);
  }

  updateLightIntensity(id: string, intensity: number): boolean {
    const light = this.lights.get(id);
    if (light) {
      light.intensity = intensity;
      return true;
    }
    return false;
  }

  updateLightColor(id: string, color: string | number): boolean {
    const light = this.lights.get(id);
    if (light) {
      light.color.set(color);
      return true;
    }
    return false;
  }

  updateLightPosition(id: string, position: [number, number, number]): boolean {
    const light = this.lights.get(id);
    if (light) {
      light.position.set(...position);
      return true;
    }
    return false;
  }

  createLightingPreset(
    preset: "default" | "studio" | "outdoor" | "night"
  ): Map<string, THREE.Light> {
    // Clear existing lights
    this.lights.clear();

    switch (preset) {
      case "default":
        this.createLight("ambient", {
          type: "ambient",
          color: 0x404040,
          intensity: 0.4,
        });
        this.createLight("main", {
          type: "directional",
          color: 0xffffff,
          intensity: 1.0,
          position: [10, 10, 5],
          castShadow: true,
        });
        break;

      case "studio":
        this.createLight("ambient", {
          type: "ambient",
          color: 0x404040,
          intensity: 0.2,
        });
        this.createLight("key", {
          type: "directional",
          color: 0xffffff,
          intensity: 1.2,
          position: [10, 10, 5],
          castShadow: true,
        });
        this.createLight("fill", {
          type: "directional",
          color: 0x88aaff,
          intensity: 0.6,
          position: [-5, 5, 2],
        });
        this.createLight("rim", {
          type: "directional",
          color: 0xffffaa,
          intensity: 0.8,
          position: [-10, 5, -10],
        });
        break;

      case "outdoor":
        this.createLight("sun", {
          type: "directional",
          color: 0xffffaa,
          intensity: 1.5,
          position: [100, 100, 50],
          castShadow: true,
        });
        this.createLight("sky", {
          type: "hemisphere",
          color: 0x87ceeb,
          groundColor: 0x654321,
          intensity: 0.6,
        });
        break;

      case "night":
        this.createLight("ambient", {
          type: "ambient",
          color: 0x202040,
          intensity: 0.1,
        });
        this.createLight("moon", {
          type: "directional",
          color: 0xaaaaff,
          intensity: 0.5,
          position: [50, 100, 20],
          castShadow: true,
        });
        break;
    }

    return this.getAllLights();
  }

  dispose(): void {
    this.lights.forEach((light) => {
      if (light.shadow) {
        light.shadow.dispose();
      }
    });
    this.lights.clear();
  }
}
