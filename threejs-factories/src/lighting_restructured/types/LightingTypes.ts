import * as THREE from "three";

export interface ILightingScene {
  create(scene: THREE.Scene): LightingSetup;
}

export interface LightingSetup {
  lights: THREE.Light[];
  ambientColor?: number;
  fogSettings?: {
    color: number;
    near: number;
    far: number;
  };
  shadowSettings?: {
    enabled: boolean;
    mapSize: number;
    cameraSettings?: any;
  };
}

export type LightingCategory =
  | "indoor"
  | "outdoor"
  | "time"
  | "weather"
  | "mood"
  | "cinematic";

export interface LightingInfo {
  name: string;
  className: string;
  category: LightingCategory;
  description: string;
  lightingClass: new () => ILightingScene;
}
