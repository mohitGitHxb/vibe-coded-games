import * as THREE from "three";
import type { ILightingScene, LightingSetup } from "../types/LightingTypes";

export class IndoorCozy implements ILightingScene {
  create(scene: THREE.Scene): LightingSetup {
    const lights: THREE.Light[] = [];

    // Warm, dim ambient
    const ambientLight = new THREE.AmbientLight(0xffb347, 0.2);
    lights.push(ambientLight);

    // Fireplace/warm focal light
    const fireplaceLight = new THREE.PointLight(0xff6b35, 2.0, 8, 2);
    fireplaceLight.position.set(0, 1, 3);
    fireplaceLight.castShadow = true;
    lights.push(fireplaceLight);

    // Table lamp
    const tableLamp = new THREE.SpotLight(0xffeaa7, 1.5, 6, Math.PI / 6, 0.3);
    tableLamp.position.set(-2, 3, -1);
    tableLamp.target.position.set(-2, 0, -1);
    tableLamp.castShadow = true;
    lights.push(tableLamp);

    // Reading light
    const readingLight = new THREE.SpotLight(
      0xffe4b5,
      1.8,
      4,
      Math.PI / 8,
      0.2
    );
    readingLight.position.set(2, 2.5, 0);
    readingLight.target.position.set(1, 0, 0);
    lights.push(readingLight);

    return {
      lights,
      shadowSettings: {
        enabled: true,
        mapSize: 1024,
      },
    };
  }
}
