import * as THREE from "three";
import type { GameEntity, ProjectileOwner } from "../types";
import { GAME_CONFIG, COLORS } from "../utils/Constants";

export class Projectile implements GameEntity {
  public mesh!: THREE.Mesh;
  public velocity!: THREE.Vector3;
  public damage!: number;
  public owner!: ProjectileOwner;
  public position!: THREE.Vector3;

  private maxDistance: number;
  private traveledDistance: number = 0;
  private shouldDestroy: boolean = false;

  constructor(
    position: THREE.Vector3,
    direction: THREE.Vector3,
    damage: number,
    owner: ProjectileOwner
  ) {
    this.position = position.clone();
    this.damage = damage;
    this.owner = owner;

    this.createMesh();
    this.velocity = direction
      .normalize()
      .multiplyScalar(GAME_CONFIG.WEAPONS.ASSAULT_RIFLE.BULLET_SPEED);
    this.maxDistance =
      Math.max(GAME_CONFIG.ARENA.WIDTH, GAME_CONFIG.ARENA.HEIGHT) * 1.5;
  }

  private createMesh(): void {
    const geometry = new THREE.SphereGeometry(2, 8, 6);
    const color =
      this.owner === "player" ? COLORS.PLAYER_BULLET : COLORS.ENEMY_BULLET;

    const material = new THREE.MeshBasicMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.3,
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
  }

  update(deltaTime: number): void {
    if (this.shouldDestroy) return;

    // Move projectile
    const movement = this.velocity.clone().multiplyScalar(deltaTime);
    this.mesh.position.add(movement);
    this.position.copy(this.mesh.position);
    this.traveledDistance += movement.length();

    // Check if traveled too far or hit arena bounds
    if (this.traveledDistance >= this.maxDistance || this.checkArenaBounds()) {
      this.markForDestroy();
    }
  }

  private checkArenaBounds(): boolean {
    const { x, z } = this.position;
    return (
      x < -GAME_CONFIG.ARENA.WIDTH / 2 ||
      x > GAME_CONFIG.ARENA.WIDTH / 2 ||
      z < -GAME_CONFIG.ARENA.HEIGHT / 2 ||
      z > GAME_CONFIG.ARENA.HEIGHT / 2
    );
  }

  markForDestroy(): void {
    this.shouldDestroy = true;
  }

  shouldBeDestroyed(): boolean {
    return this.shouldDestroy;
  }

  destroy(): void {
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}
