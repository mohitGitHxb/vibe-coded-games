import * as THREE from "three";
import type { GameEntity, Damageable, EnemyType } from "../types";
import { GAME_CONFIG, COLORS } from "../utils/Constants";

export class Enemy implements GameEntity, Damageable {
  public mesh!: THREE.Group;
  public position: THREE.Vector3;
  public health!: number;
  public maxHealth!: number;
  public speed!: number;
  public damage!: number;
  public fireInterval!: number;
  public type!: EnemyType;
  public collisionRadius!: number;

  private lastShotTime: number = 0;
  private shouldDestroy: boolean = false;

  constructor(position: THREE.Vector3, type: EnemyType = "grunt") {
    this.position = position.clone();
    this.type = type;

    this.initializeStats();
    this.createMesh();
  }

  private initializeStats(): void {
    const config = GAME_CONFIG.ENEMIES.GRUNT;
    this.health = config.HEALTH;
    this.maxHealth = config.HEALTH;
    this.speed = config.SPEED;
    this.damage = config.DAMAGE;
    this.fireInterval = config.FIRE_INTERVAL;
    this.collisionRadius = config.COLLISION_RADIUS;
  }

  private createMesh(): void {
    this.mesh = new THREE.Group();

    // Enemy body
    const geometry = new THREE.BoxGeometry(20, 30, 20);
    const material = new THREE.MeshLambertMaterial({
      color: COLORS.ENEMY_GRUNT,
    });
    const enemyMesh = new THREE.Mesh(geometry, material);

    enemyMesh.position.y = 15;
    enemyMesh.castShadow = true;
    this.mesh.add(enemyMesh);

    // Health bar
    this.createHealthBar();
    this.mesh.position.copy(this.position);
  }

  private createHealthBar(): void {
    // Background
    const bgGeometry = new THREE.PlaneGeometry(25, 3);
    const bgMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
    const healthBarBg = new THREE.Mesh(bgGeometry, bgMaterial);
    healthBarBg.position.set(0, 40, 0);
    healthBarBg.lookAt(0, 1000, 0);
    this.mesh.add(healthBarBg);

    // Fill
    const fillGeometry = new THREE.PlaneGeometry(23, 2);
    const fillMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const healthBarFill = new THREE.Mesh(fillGeometry, fillMaterial);
    healthBarFill.position.set(0, 40.1, 0);
    healthBarFill.lookAt(0, 1000, 0);
    healthBarFill.name = "healthBar";
    this.mesh.add(healthBarFill);
  }

  public update(deltaTime: number, playerPosition: THREE.Vector3): boolean {
    if (this.shouldDestroy) return false;

    this.moveTowardsPlayer(playerPosition, deltaTime);
    this.updateHealthBar();

    return this.tryShoot(playerPosition);
  }

  private moveTowardsPlayer(
    playerPosition: THREE.Vector3,
    deltaTime: number
  ): void {
    const direction = playerPosition.clone().sub(this.position);
    const distance = direction.length();

    if (distance > 50) {
      direction.normalize();
      const movement = direction.multiplyScalar(this.speed * deltaTime);
      this.position.add(movement);
      this.mesh.position.copy(this.position);

      // Face player
      const angle = Math.atan2(direction.x, direction.z);
      this.mesh.rotation.y = angle;
    }
  }

  private tryShoot(playerPosition: THREE.Vector3): boolean {
    const currentTime = Date.now();
    const distance = this.position.distanceTo(playerPosition);

    if (
      currentTime - this.lastShotTime >= this.fireInterval &&
      distance < 300
    ) {
      this.lastShotTime = currentTime;
      return true;
    }

    return false;
  }
  private createWeapon(): void {
    // Simple enemy weapon
    const weaponGeometry = new THREE.CylinderGeometry(1, 1, 15, 6);
    const weaponMaterial = new THREE.MeshLambertMaterial({
      color: 0x444444,
    });
    const weapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
    weapon.rotation.z = Math.PI / 2;
    weapon.position.set(12, 15, 0);
    weapon.castShadow = true;

    this.mesh.add(weapon);
  }
  getShootDirection(playerPosition: THREE.Vector3): THREE.Vector3 {
    const bulletSpawnOffset = new THREE.Vector3(0, 0, -25);
    bulletSpawnOffset.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.mesh.rotation.y
    );
    const bulletPosition = this.position.clone().add(bulletSpawnOffset);

    const direction = playerPosition.clone().sub(bulletPosition);
    direction.y = 0;
    return direction.normalize();
  }

  takeDamage(damage: number): boolean {
    this.health = Math.max(0, this.health - damage);
    this.updateHealthBar();
    return this.health <= 0;
  }

  private updateHealthBar(): void {
    const healthBar = this.mesh.getObjectByName("healthBar") as THREE.Mesh;
    if (healthBar) {
      const healthPercent = this.health / this.maxHealth;
      healthBar.scale.x = healthPercent;

      const material = healthBar.material as THREE.MeshBasicMaterial;
      if (healthPercent > 0.6) {
        material.color.setHex(0x00ff00);
      } else if (healthPercent > 0.3) {
        material.color.setHex(0xffff00);
      } else {
        material.color.setHex(0xff0000);
      }
    }
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
