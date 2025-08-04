import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GAME_CONFIG } from "../utils/GameConfig.js";
import type { EnemyData } from "../types/GameTypes.js";
import type { PathfindingGrid } from "../utils/PathFinding.js"; // Fixed import path

export class Enemy {
  public id: string;
  public position: THREE.Vector3;
  public physicsBody: CANNON.Body;
  public mesh: THREE.Group;
  private health: number;
  private maxHealth: number;
  private lastShotTime: number = 0;
  private target: THREE.Vector3 | null = null;
  private state: "idle" | "moving" | "attacking" | "dead" = "idle";
  private moveDirection: THREE.Vector3 = new THREE.Vector3();
  private lastDirectionChange: number = 0;
  private currentPath: THREE.Vector3[] = [];
  private currentPathIndex: number = 0;
  private lastPathUpdate: number = 0;
  private pathfinding: PathfindingGrid;

  constructor(
    id: string,
    spawnPosition: THREE.Vector3,
    model: THREE.Group,
    pathfinding: PathfindingGrid
  ) {
    this.id = id;
    this.position = spawnPosition.clone();
    this.health = GAME_CONFIG.ENEMY.HEALTH;
    this.maxHealth = GAME_CONFIG.ENEMY.HEALTH;
    this.pathfinding = pathfinding;

    // Create visual representation
    this.mesh = this.createEnemyMesh(model);
    this.mesh.position.copy(spawnPosition);

    // Create physics body
    this.createPhysicsBody();

    // Initialize random movement direction
    this.changeDirection();

    console.log(`Enemy ${this.id} created at position:`, this.position);
  }

  private createEnemyMesh(model: THREE.Group): THREE.Group {
    const enemyGroup = model.clone();

    // Make enemy more visible with bright red color
    enemyGroup.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = new THREE.MeshLambertMaterial({
          color: 0xff3333, // Bright red for visibility
          side: THREE.DoubleSide,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Scale and position
    enemyGroup.scale.setScalar(0.8);

    // Add health bar above enemy
    this.addHealthBar(enemyGroup);

    return enemyGroup;
  }

  private addHealthBar(group: THREE.Group): void {
    const barWidth = 1.0;
    const barHeight = 0.1;

    // Background bar (red)
    const bgGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
    const bgMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const bgBar = new THREE.Mesh(bgGeometry, bgMaterial);
    bgBar.position.set(0, 2.5, 0);
    bgBar.name = "healthBarBg";
    group.add(bgBar);

    // Health bar (green)
    const healthGeometry = new THREE.PlaneGeometry(barWidth, barHeight);
    const healthMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const healthBar = new THREE.Mesh(healthGeometry, healthMaterial);
    healthBar.position.set(0, 2.5, 0.01);
    healthBar.name = "healthBar";
    group.add(healthBar);
  }

  private createPhysicsBody(): void {
    const radius = 0.3;
    const height = 1.6;

    const shape = new CANNON.Cylinder(radius, radius, height, 8);
    this.physicsBody = new CANNON.Body({
      mass: 50,
      shape: shape,
      position: new CANNON.Vec3(
        this.position.x,
        this.position.y + height / 2, // Position body center at correct height
        this.position.z
      ),
      material: new CANNON.Material("enemy"),
    });

    this.physicsBody.fixedRotation = true;
    this.physicsBody.updateMassProperties();

    // Increased damping to slow down movement
    this.physicsBody.linearDamping = 0.8; // Increased from 0.4
    this.physicsBody.angularDamping = 0.8; // Increased from 0.4
  }

  public update(
    deltaTime: number,
    playerPosition: THREE.Vector3,
    obstacles: THREE.Object3D[]
  ): void {
    if (this.state === "dead") return;

    const distanceToPlayer = this.position.distanceTo(playerPosition);

    // State machine
    if (distanceToPlayer < 12) {
      this.state = "attacking";
      this.target = playerPosition.clone();
    } else if (distanceToPlayer < 30) {
      this.state = "moving";
      this.target = playerPosition.clone();
    } else {
      this.state = "idle";
      this.target = null;
    }

    // Clear previous forces
    this.physicsBody.force.set(0, 0, 0);

    // Update based on state
    switch (this.state) {
      case "attacking":
        this.attackPlayer(playerPosition);
        this.updatePathToTarget(playerPosition);
        this.followPath(deltaTime);
        break;
      case "moving":
        this.updatePathToTarget(playerPosition);
        this.followPath(deltaTime);
        break;
      case "idle":
        this.wanderAround(deltaTime);
        break;
    }

    // Update physics and visual position
    this.updatePosition();
    this.updateHealthBar();
  }

  private updatePathToTarget(targetPosition: THREE.Vector3): void {
    const now = Date.now();

    // Update path every 1000ms (slower updates) or if no current path
    if (now - this.lastPathUpdate > 1000 || this.currentPath.length === 0) {
      this.currentPath = this.pathfinding.findPath(
        this.position,
        targetPosition
      );
      this.currentPathIndex = 0;
      this.lastPathUpdate = now;

      if (this.currentPath.length > 0) {
        console.log(
          `Enemy ${this.id} found path with ${this.currentPath.length} waypoints`
        );
      }
    }
  }

  private followPath(deltaTime: number): void {
    if (
      this.currentPath.length === 0 ||
      this.currentPathIndex >= this.currentPath.length
    ) {
      return;
    }

    const currentWaypoint = this.currentPath[this.currentPathIndex];
    const direction = currentWaypoint.clone().sub(this.position);
    const distance = direction.length();

    // Move to next waypoint if close enough
    if (distance < 1.5) {
      this.currentPathIndex++;
      if (this.currentPathIndex >= this.currentPath.length) {
        this.currentPath = [];
        return;
      }
      return;
    }

    // Apply movement force towards waypoint - REDUCED FORCES
    direction.normalize();
    const speed = GAME_CONFIG.ENEMY.SPEED * 0.3; // Reduced to 30% of config speed
    const forceMultiplier = this.state === "attacking" ? 250 : 200; // Much lower force

    const forceX = direction.x * speed * forceMultiplier;
    const forceZ = direction.z * speed * forceMultiplier;

    this.physicsBody.force.x += forceX;
    this.physicsBody.force.z += forceZ;

    // Face the movement direction
    const angle = Math.atan2(direction.x, direction.z);
    this.mesh.rotation.y = angle;

    // Lower velocity limits for slower movement
    const maxVel = this.state === "attacking" ? 1.5 : 1.0; // Much slower max velocity
    if (Math.abs(this.physicsBody.velocity.x) > maxVel) {
      this.physicsBody.velocity.x =
        Math.sign(this.physicsBody.velocity.x) * maxVel;
    }
    if (Math.abs(this.physicsBody.velocity.z) > maxVel) {
      this.physicsBody.velocity.z =
        Math.sign(this.physicsBody.velocity.z) * maxVel;
    }
  }

  private wanderAround(deltaTime: number): void {
    const now = Date.now();

    // Change direction every 5-8 seconds (longer intervals)
    if (now - this.lastDirectionChange > 5000 + Math.random() * 3000) {
      this.changeDirection();
      this.lastDirectionChange = now;
    }

    // Move in current direction - MUCH SLOWER
    const speed = GAME_CONFIG.ENEMY.SPEED * 0.15; // Only 15% speed when wandering
    const forceMultiplier = 150; // Much lower force

    const forceX = this.moveDirection.x * speed * forceMultiplier;
    const forceZ = this.moveDirection.z * speed * forceMultiplier;

    this.physicsBody.force.x += forceX;
    this.physicsBody.force.z += forceZ;

    // Very low velocity limit for wandering
    const maxVel = 0.8; // Very slow wandering speed
    if (Math.abs(this.physicsBody.velocity.x) > maxVel) {
      this.physicsBody.velocity.x =
        Math.sign(this.physicsBody.velocity.x) * maxVel;
    }
    if (Math.abs(this.physicsBody.velocity.z) > maxVel) {
      this.physicsBody.velocity.z =
        Math.sign(this.physicsBody.velocity.z) * maxVel;
    }

    // Check if we hit a wall and change direction
    if (
      !this.pathfinding.isWalkable(
        this.position.clone().add(this.moveDirection.clone().multiplyScalar(2))
      )
    ) {
      this.changeDirection();
    }
  }

  private changeDirection(): void {
    let attempts = 0;
    let newDirection: THREE.Vector3;

    // Try to find a walkable direction
    do {
      const angle = Math.random() * Math.PI * 2;
      newDirection = new THREE.Vector3(
        Math.cos(angle),
        0,
        Math.sin(angle)
      ).normalize();
      attempts++;
    } while (
      !this.pathfinding.isWalkable(
        this.position.clone().add(newDirection.clone().multiplyScalar(2))
      ) &&
      attempts < 10
    );

    this.moveDirection = newDirection;
    console.log(`Enemy ${this.id} changed direction to:`, this.moveDirection);
  }

  private attackPlayer(playerPosition: THREE.Vector3): boolean {
    const now = Date.now();
    const timeSinceLastShot = now - this.lastShotTime;

    if (timeSinceLastShot < GAME_CONFIG.ENEMY.FIRE_RATE) {
      return false;
    }

    // Check if player is in line of sight and range
    const distance = this.position.distanceTo(playerPosition);
    if (distance > 15) return false;

    // Face the player
    const direction = playerPosition.clone().sub(this.position).normalize();
    const angle = Math.atan2(direction.x, direction.z);
    this.mesh.rotation.y = angle;

    // Simple accuracy check
    if (Math.random() > GAME_CONFIG.ENEMY.ACCURACY) {
      this.lastShotTime = now;
      return false;
    }

    this.lastShotTime = now;

    // Create muzzle flash effect
    this.createMuzzleFlash();

    console.log(
      `Enemy ${this.id} is shooting at player! Distance: ${distance.toFixed(2)}`
    );

    // Return true to indicate successful shot (can damage player)
    return true;
  }

  private createMuzzleFlash(): void {
    const flash = new THREE.PointLight(0xff4400, 3, 5);
    flash.position.copy(this.position);
    flash.position.y += 1.5;

    this.mesh.add(flash);

    setTimeout(() => {
      this.mesh.remove(flash);
    }, 100);
  }

  private updatePosition(): void {
    // Copy physics position to visual position
    this.position.copy(this.physicsBody.position as any);
    this.position.y -= 0.8; // Adjust for physics body center vs visual base
    this.mesh.position.copy(this.position);

    // Keep enemy upright
    this.mesh.rotation.x = 0;
    this.mesh.rotation.z = 0;

    // Ensure enemy doesn't fall below ground
    if (this.physicsBody.position.y < 1.6) {
      this.physicsBody.position.y = 1.6;
    }
  }

  private updateHealthBar(): void {
    const healthBar = this.mesh.getObjectByName("healthBar") as THREE.Mesh;
    if (healthBar) {
      const healthPercent = this.health / this.maxHealth;
      healthBar.scale.x = healthPercent;
      healthBar.position.x = -(1.0 - healthPercent) * 0.5;
    }
  }

  public takeDamage(amount: number): boolean {
    if (this.state === "dead") return false;

    this.health = Math.max(0, this.health - amount);

    console.log(
      `Enemy ${this.id} took ${amount} damage. Health: ${this.health}/${this.maxHealth}`
    );

    if (this.health <= 0) {
      this.die();
      return true; // Enemy died
    }

    return false;
  }

  private die(): void {
    this.state = "dead";

    // Death animation - fall over
    this.mesh.rotation.z = Math.PI / 2;

    // Change color to dark red
    this.mesh.traverse((child) => {
      if (
        child instanceof THREE.Mesh &&
        child.name !== "healthBar" &&
        child.name !== "healthBarBg"
      ) {
        (child.material as THREE.MeshLambertMaterial).color.setHex(0x660000);
      }
    });

    // Hide health bar
    const healthBar = this.mesh.getObjectByName("healthBar");
    const healthBarBg = this.mesh.getObjectByName("healthBarBg");
    if (healthBar) healthBar.visible = false;
    if (healthBarBg) healthBarBg.visible = false;

    console.log(`Enemy ${this.id} has died!`);
  }

  public isDead(): boolean {
    return this.state === "dead";
  }

  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  public getData(): EnemyData {
    return {
      id: this.id,
      position: { x: this.position.x, y: this.position.y, z: this.position.z },
      health: this.health,
      isAlive: !this.isDead(),
    };
  }

  public cleanup(): void {
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }

    // Dispose of geometries and materials
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((material) => material.dispose());
        } else {
          child.material.dispose();
        }
      }
    });
  }
}
