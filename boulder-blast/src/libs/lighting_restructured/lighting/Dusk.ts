import * as THREE from "three";
import type { ILightingScene, LightingSetup } from "../types/LightingTypes";

export class Dusk implements ILightingScene {
  create(scene: THREE.Scene): LightingSetup {
    const lights: THREE.Light[] = [];

    // Warm ambient for dusk atmosphere
    const ambientLight = new THREE.AmbientLight(0x6c5ce7, 0.25);
    lights.push(ambientLight);

    // Setting sun - warm orange/red
    const sunLight = new THREE.DirectionalLight(0xff6348, 1.2);
    sunLight.position.set(-8, 2, 1); // Low, opposite side from dawn
    sunLight.target.position.set(0, 0, 0);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    sunLight.shadow.camera.left = -20;
    sunLight.shadow.camera.right = 20;
    sunLight.shadow.camera.top = 20;
    sunLight.shadow.camera.bottom = -20;
    lights.push(sunLight);

    // Evening sky colors
    const hemisphereLight = new THREE.HemisphereLight(0x74b9ff, 0x2d3436, 0.7);
    hemisphereLight.position.set(0, 10, 0);
    lights.push(hemisphereLight);

    // Early artificial lights starting to turn on
    const earlyStreetLight = new THREE.PointLight(0xffdd59, 1.0, 12, 1.5);
    earlyStreetLight.position.set(2, 3, 1);
    lights.push(earlyStreetLight);

    return {
      lights,
      fogSettings: {
        color: 0x6c5ce7,
        near: 10,
        far: 40,
      },
      shadowSettings: {
        enabled: true,
        mapSize: 2048,
      },
    };
  }
}
