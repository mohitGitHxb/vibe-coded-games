import * as THREE from "three";

export interface GameEntity {
  mesh: THREE.Object3D;
  position: THREE.Vector3;
  update(deltaTime: number, ...args: any[]): void;
  destroy(): void;
}

export interface Damageable {
  health: number;
  maxHealth: number;
  takeDamage(damage: number): boolean;
}

export interface InputState {
  keys: { [key: string]: boolean };
  mousePosition: THREE.Vector2;
  isMouseDown: boolean;
}

export type EnemyType = "grunt";
export type ProjectileOwner = "player" | "enemy";
