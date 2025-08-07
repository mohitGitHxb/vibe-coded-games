import * as THREE from "three";

export interface ISkybox {
  create(): Promise<THREE.Object3D | THREE.Texture>;
}

export type SkyboxCategory =
  | "nature"
  | "time"
  | "weather"
  | "space"
  | "abstract"
  | "urban";

export interface SkyboxInfo {
  name: string;
  className: string;
  category: SkyboxCategory;
  description: string;
  skyboxClass: new () => ISkybox;
}
