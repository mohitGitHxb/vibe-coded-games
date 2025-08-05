import * as THREE from "three";

export type CameraType = "perspective" | "orthographic";
export type LightType =
  | "ambient"
  | "directional"
  | "point"
  | "spot"
  | "hemisphere";
export type SkyboxType =
  | "gradient"
  | "stars"
  | "clouds"
  | "sunset"
  | "night"
  | "space";

export interface CameraConfig {
  type: CameraType;
  fov?: number; // For perspective camera
  aspect?: number;
  near?: number;
  far?: number;
  left?: number; // For orthographic camera
  right?: number;
  top?: number;
  bottom?: number;
  position?: [number, number, number];
  lookAt?: [number, number, number];
}

export interface LightConfig {
  type: LightType;
  color?: string | number;
  intensity?: number;
  position?: [number, number, number];
  target?: [number, number, number];
  castShadow?: boolean;
  // Point/Spot light specific
  distance?: number;
  decay?: number;
  angle?: number; // Spot light
  penumbra?: number; // Spot light
  // Hemisphere light specific
  groundColor?: string | number;
}

export interface SkyboxConfig {
  type: SkyboxType;
  colors?: string[]; // For gradient skyboxes
  intensity?: number;
  texture?: string; // Custom texture path
}

export interface WorldConfig {
  background?: string | number;
  fog?: {
    type: "linear" | "exponential";
    color: string | number;
    near?: number;
    far?: number;
    density?: number;
  };
  shadows?: {
    enabled: boolean;
    type?: THREE.ShadowMapType;
    mapSize?: number;
  };
  physics?: {
    gravity: [number, number, number];
    enabled: boolean;
  };
}

export interface WorldState {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer?: THREE.WebGLRenderer;
  lights: Map<string, THREE.Light>;
  objects: Map<string, THREE.Object3D>;
  skybox?: THREE.Object3D;
  controls?: any; // OrbitControls, FirstPersonControls, etc.
}

export interface SceneObject {
  id: string;
  object: THREE.Object3D;
  type: "mesh" | "group" | "light" | "camera" | "helper";
  metadata?: Record<string, any>;
}
