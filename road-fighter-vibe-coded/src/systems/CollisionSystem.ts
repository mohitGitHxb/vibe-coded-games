import * as THREE from "three";
import { PlayerCar } from "../entities/PlayerCar";
import { TrafficCar } from "../entities/TrafficCar";
import { GAME_CONFIG } from "../utils/Constants";
import type { EnemyCar } from "../entities/EnemyCar";

export interface CollisionResult {
  hasCollision: boolean;
  collisionType: "traffic" | "boundary" | "none";
  collisionPoint?: THREE.Vector3;
}

export class CollisionSystem {
  private playerBoundingBox: THREE.Box3 = new THREE.Box3();
  private trafficBoundingBox: THREE.Box3 = new THREE.Box3();

  public checkCollisions(
    playerCar: PlayerCar,
    trafficCars: TrafficCar[]
  ): CollisionResult {
    // Update player bounding box
    this.playerBoundingBox.setFromObject(playerCar.mesh);

    // Check collision with road boundaries
    const boundaryCollision = this.checkBoundaryCollision(playerCar);
    if (boundaryCollision.hasCollision) {
      return boundaryCollision;
    }

    // Check collision with traffic cars
    for (const trafficCar of trafficCars) {
      this.trafficBoundingBox.setFromObject(trafficCar.mesh);

      if (this.playerBoundingBox.intersectsBox(this.trafficBoundingBox)) {
        return {
          hasCollision: true,
          collisionType: "traffic",
          collisionPoint: playerCar.getPosition(),
        };
      }
    }

    return { hasCollision: false, collisionType: "none" };
  }

  private checkBoundaryCollision(playerCar: PlayerCar): CollisionResult {
    const position = playerCar.getPosition();
    const roadHalfWidth = GAME_CONFIG.ROAD_WIDTH / 2;

    // Check if player is outside road boundaries
    if (Math.abs(position.x) > roadHalfWidth - 1) {
      return {
        hasCollision: true,
        collisionType: "boundary",
        collisionPoint: position,
      };
    }

    return { hasCollision: false, collisionType: "none" };
  }

  // Helper method for distance-based collision (more forgiving)
  public checkProximityCollision(
    playerCar: PlayerCar,
    trafficCars: (TrafficCar | EnemyCar)[],
    threshold: number = GAME_CONFIG.COLLISION_DETECTION_RADIUS
  ): CollisionResult {
    const playerPos = playerCar.getPosition();

    for (const trafficCar of trafficCars) {
      const trafficPos = trafficCar.getPosition();
      const distance = playerPos.distanceTo(trafficPos);

      if (distance < threshold) {
        return {
          hasCollision: true,
          collisionType: "traffic",
          collisionPoint: playerPos,
        };
      }
    }

    return { hasCollision: false, collisionType: "none" };
  }
}
