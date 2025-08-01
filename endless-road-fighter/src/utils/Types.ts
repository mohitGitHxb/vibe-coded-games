import * as THREE from "three";

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  speed: number; // Current speed in m/s
  distance: number; // Distance traveled in meters
  score: number;
  lives: number;
  currentLanes: number; // Current number of lanes
  nextLanes: number; // Next number of lanes
  isInTransition: boolean; // Whether currently in a width transition
  transitionProgress: number; // 0-1 progress through transition
  trafficDensity: number; // Current traffic density (0-1)

  // Active power-up effects (simplified)
  activeEffects: {
    speedBoost: { active: boolean; timeRemaining: number };
    invincibility: { active: boolean; timeRemaining: number };
    scoreMultiplier: {
      active: boolean;
      timeRemaining: number;
      multiplier: number;
    };
  };

  // Current score multiplier (combined from all sources)
  currentScoreMultiplier: number;
}

export interface Transform {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  scale: THREE.Vector3;
}

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  restart: boolean;
}

export interface VehiclePhysics {
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  maxSpeed: number;
  steeringSpeed: number;
}

export interface RoadSegment {
  startDistance: number;
  endDistance: number;
  startLanes: number;
  endLanes: number;
  type: "normal" | "warning" | "transition";
}

export interface RoadState {
  currentWidth: number;
  targetWidth: number;
  transitionProgress: number;
  isTransitioning: boolean;
  nextTransitionDistance: number;
}

export type VehicleType = "CAR" | "TRUCK" | "BUS";

export interface VehicleData {
  id: number;
  type: VehicleType;
  transform: Transform;
  physics: VehiclePhysics;
  currentLane: number;
  targetLane: number;
  isChangingLanes: boolean;
  laneChangeProgress: number;
  color: number;
  mesh?: THREE.Mesh;
  boundingBox?: THREE.Box3;
}

export interface CollisionInfo {
  hasCollision: boolean;
  vehicle?: VehicleData;
  penetrationDepth: number;
  collisionNormal: THREE.Vector3;
}

export interface TrafficState {
  vehicles: VehicleData[];
  nextVehicleId: number;
  lastSpawnTime: number;
  currentSpawnRate: number;
}

export type PowerUpType = "SPEED_BOOST" | "INVINCIBILITY" | "SCORE_MULTIPLIER";

export interface PowerUpData {
  id: number;
  type: PowerUpType;
  transform: Transform;
  lane: number;
  isCollected: boolean;
  mesh?: THREE.Mesh;
  glowMesh?: THREE.Mesh;
  boundingBox?: THREE.Box3;
  animationTime: number;
}

export interface PowerUpState {
  powerUps: PowerUpData[];
  nextPowerUpId: number;
  lastSpawnDistance: number;
  nextSpawnDistance: number;
}

export interface PowerUpCollectionInfo {
  hasCollection: boolean;
  powerUp?: PowerUpData;
}
