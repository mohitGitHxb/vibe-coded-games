import * as THREE from "three";
import type {
  CameraConfig,
  LightConfig,
  WorldConfig,
  SkyboxConfig,
} from "../types/WorldTypes";

export const DEFAULT_CAMERA_CONFIG: CameraConfig = {
  type: "perspective",
  fov: 75,
  aspect: window.innerWidth / window.innerHeight,
  near: 0.1,
  far: 1000,
  position: [5, 5, 5],
  lookAt: [0, 0, 0],
};

export const DEFAULT_ORTHOGRAPHIC_CAMERA: CameraConfig = {
  type: "orthographic",
  left: -10,
  right: 10,
  top: 10,
  bottom: -10,
  near: 0.1,
  far: 1000,
  position: [5, 5, 5],
  lookAt: [0, 0, 0],
};

export const DEFAULT_LIGHTING_SETUP: Record<string, LightConfig> = {
  ambient: {
    type: "ambient",
    color: 0x404040,
    intensity: 0.4,
  },
  main: {
    type: "directional",
    color: 0xffffff,
    intensity: 1.0,
    position: [10, 10, 5],
    target: [0, 0, 0],
    castShadow: true,
  },
  fill: {
    type: "point",
    color: 0xffffff,
    intensity: 0.3,
    position: [-10, 5, -5],
    distance: 50,
    decay: 2,
  },
};

export const STUDIO_LIGHTING_SETUP: Record<string, LightConfig> = {
  ambient: {
    type: "ambient",
    color: 0x404040,
    intensity: 0.2,
  },
  key: {
    type: "directional",
    color: 0xffffff,
    intensity: 1.2,
    position: [10, 10, 5],
    castShadow: true,
  },
  fill: {
    type: "directional",
    color: 0x88aaff,
    intensity: 0.6,
    position: [-5, 5, 2],
  },
  rim: {
    type: "directional",
    color: 0xffffaa,
    intensity: 0.8,
    position: [-10, 5, -10],
  },
};

export const OUTDOOR_LIGHTING_SETUP: Record<string, LightConfig> = {
  sun: {
    type: "directional",
    color: 0xffffaa,
    intensity: 1.5,
    position: [100, 100, 50],
    castShadow: true,
  },
  sky: {
    type: "hemisphere",
    color: 0x87ceeb,
    groundColor: 0x654321,
    intensity: 0.6,
  },
};

export const DEFAULT_WORLD_CONFIG: WorldConfig = {
  background: 0x202020,
  fog: {
    type: "linear",
    color: 0x202020,
    near: 50,
    far: 200,
  },
  shadows: {
    enabled: true,
    type: THREE.PCFSoftShadowMap,
    mapSize: 2048,
  },
  physics: {
    gravity: [0, -9.81, 0],
    enabled: false,
  },
};

export const SKYBOX_PRESETS: Record<string, SkyboxConfig> = {
  gradient: {
    type: "gradient",
    colors: ["#87ceeb", "#ffffff", "#87ceeb"],
    intensity: 1.0,
  },
  sunset: {
    type: "sunset",
    colors: ["#ff6b35", "#f7931e", "#ffdc00", "#87ceeb"],
    intensity: 1.2,
  },
  night: {
    type: "night",
    colors: ["#0f0f23", "#1a1a3a", "#2d2d5a"],
    intensity: 0.8,
  },
  space: {
    type: "space",
    colors: ["#000011", "#000033", "#000055"],
    intensity: 0.6,
  },
};

export const RENDERER_DEFAULTS = {
  antialias: true,
  alpha: false,
  powerPreference: "high-performance" as const,
  stencil: false,
  depth: true,
  logarithmicDepthBuffer: false,
  premultipliedAlpha: true,
  preserveDrawingBuffer: false,
  failIfMajorPerformanceCaveat: false,
};
