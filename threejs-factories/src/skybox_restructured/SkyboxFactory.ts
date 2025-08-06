import * as THREE from "three";
import type { ISkybox } from "./types/SkyboxTypes";

export class SkyboxFactory {
  async create<T extends ISkybox>(
    skybox: T
  ): Promise<THREE.Object3D | THREE.Texture> {
    return await skybox.create();
  }

  async createBatch<T extends ISkybox>(
    skyboxes: T[]
  ): Promise<(THREE.Object3D | THREE.Texture)[]> {
    const promises = skyboxes.map((skybox) => this.create(skybox));
    return Promise.all(promises);
  }

  applySkyboxToScene(
    scene: THREE.Scene,
    skybox: THREE.Object3D | THREE.Texture
  ): void {
    if (skybox instanceof THREE.Texture) {
      // Environment map
      scene.environment = skybox;
      scene.background = skybox;
    } else {
      // Skybox mesh
      scene.add(skybox);
    }
  }

  clearSkybox(scene: THREE.Scene): void {
    // Remove skybox meshes
    const skyboxesToRemove: THREE.Object3D[] = [];
    scene.traverse((object) => {
      if (object.userData.skybox === true) {
        skyboxesToRemove.push(object);
      }
    });

    skyboxesToRemove.forEach((skybox) => {
      scene.remove(skybox);
    });

    // Clear environment and background
    scene.environment = null;
    scene.background = null;
  }
}
