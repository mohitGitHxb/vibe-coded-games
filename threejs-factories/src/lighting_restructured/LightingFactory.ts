import * as THREE from "three";
import type { ILightingScene, LightingSetup } from "./types/LightingTypes";

export class LightingFactory {
  create<T extends ILightingScene>(
    lightingScene: T,
    scene: THREE.Scene
  ): LightingSetup {
    const setup = lightingScene.create(scene);

    // Apply lighting setup to scene
    setup.lights.forEach((light) => {
      scene.add(light);
      // Handle lights with targets (DirectionalLight, SpotLight)
      if (
        light instanceof THREE.DirectionalLight ||
        light instanceof THREE.SpotLight
      ) {
        if (!scene.children.includes(light.target)) {
          scene.add(light.target);
        }
      }
    });

    // Apply fog if specified
    if (setup.fogSettings) {
      scene.fog = new THREE.Fog(
        setup.fogSettings.color,
        setup.fogSettings.near,
        setup.fogSettings.far
      );
    }

    return setup;
  }

  createBatch<T extends ILightingScene>(
    lightingScenes: T[],
    scenes: THREE.Scene[]
  ): LightingSetup[] {
    if (lightingScenes.length !== scenes.length) {
      throw new Error("Number of lighting scenes must match number of scenes");
    }

    return lightingScenes.map((lightingScene, index) =>
      this.create(lightingScene, scenes[index])
    );
  }

  clearLighting(scene: THREE.Scene): void {
    // Remove all lights from scene
    const lightsToRemove: THREE.Light[] = [];
    scene.traverse((object) => {
      if (object instanceof THREE.Light) {
        lightsToRemove.push(object);
      }
    });

    lightsToRemove.forEach((light) => {
      scene.remove(light);
      if (
        light instanceof THREE.DirectionalLight ||
        light instanceof THREE.SpotLight
      ) {
        scene.remove(light.target);
      }
    });

    // Clear fog
    scene.fog = null;
  }
}
