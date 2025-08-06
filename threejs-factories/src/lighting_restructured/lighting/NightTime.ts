import * as THREE from "three";
import { ILightingScene, LightingSetup } from "../types/LightingTypes";

export class NightTime implements ILightingScene {
  create(scene: THREE.Scene): LightingSetup {
    const lights: THREE.Light[] = [];

    // Very dim ambient - night atmosphere
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.15);
    lights.push(ambientLight);

    // Moonlight - soft, cool directional
    const moonLight = new THREE.DirectionalLight(0x6a7b8a, 0.8);
    moonLight.position.set(-5, 10, 3);
    moonLight.target.position.set(0, 0, 0);
    moonLight.castShadow = true;
    moonLight.shadow.mapSize.width = 1024;
    moonLight.shadow.mapSize.height = 1024;
    moonLight.shadow.camera.near = 0.5;
    moonLight.shadow.camera.far = 30;
    moonLight.shadow.camera.left = -15;
    moonLight.shadow.camera.right = 15;
    moonLight.shadow.camera.top = 15;
    moonLight.shadow.camera.bottom = -15;
    lights.push(moonLight);

    // Street lamp effect - warm point lights
    const streetLamp1 = new THREE.PointLight(0xffaa55, 2.0, 15, 2);
    streetLamp1.position.set(-3, 4, 2);
    streetLamp1.castShadow = true;
    lights.push(streetLamp1);

    const streetLamp2 = new THREE.PointLight(0xffaa55, 2.0, 15, 2);
    streetLamp2.position.set(3, 4, -2);
    streetLamp2.castShadow = true;
    lights.push(streetLamp2);

    return {
      lights,
      fogSettings: {
        color: 0x1a1a2e,
        near: 5,
        far: 25,
      },
      shadowSettings: {
        enabled: true,
        mapSize: 1024,
      },
    };
  }
}
