/**
 * Physics Utils - Utility functions for physics calculations and conversions
 */

import * as THREE from "three";
import * as CANNON from "cannon-es";
import type { Vector3Like, PhysicsObject } from "../types/PhysicsTypes.js";

export class PhysicsUtils {
  /**
   * Convert Three.js Vector3 to CANNON Vec3
   */
  static threeToCannonVec3(vector: THREE.Vector3): CANNON.Vec3 {
    return new CANNON.Vec3(vector.x, vector.y, vector.z);
  }

  /**
   * Convert CANNON Vec3 to Three.js Vector3
   */
  static cannonToThreeVec3(vector: CANNON.Vec3): THREE.Vector3 {
    return new THREE.Vector3(vector.x, vector.y, vector.z);
  }

  /**
   * Convert Three.js Quaternion to CANNON Quaternion
   */
  static threeToCannonQuat(quaternion: THREE.Quaternion): CANNON.Quaternion {
    return new CANNON.Quaternion(
      quaternion.x,
      quaternion.y,
      quaternion.z,
      quaternion.w
    );
  }

  /**
   * Convert CANNON Quaternion to Three.js Quaternion
   */
  static cannonToThreeQuat(quaternion: CANNON.Quaternion): THREE.Quaternion {
    return new THREE.Quaternion(
      quaternion.x,
      quaternion.y,
      quaternion.z,
      quaternion.w
    );
  }

  /**
   * Sync Three.js object position and rotation with CANNON body
   */
  static syncThreeWithCannon(
    threeObject: THREE.Object3D,
    cannonBody: CANNON.Body
  ): void {
    threeObject.position.copy(cannonBody.position as any);
    threeObject.quaternion.copy(cannonBody.quaternion as any);
  }

  /**
   * Sync CANNON body position and rotation with Three.js object
   */
  static syncCannonWithThree(
    cannonBody: CANNON.Body,
    threeObject: THREE.Object3D
  ): void {
    cannonBody.position.copy(threeObject.position as any);
    cannonBody.quaternion.copy(threeObject.quaternion as any);
  }

  /**
   * Calculate distance between two Vector3-like objects
   */
  static distance(a: Vector3Like, b: Vector3Like): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Calculate squared distance (faster than distance when you don't need the exact value)
   */
  static distanceSquared(a: Vector3Like, b: Vector3Like): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * Lerp between two Vector3-like objects
   */
  static lerp(a: Vector3Like, b: Vector3Like, t: number): Vector3Like {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      z: a.z + (b.z - a.z) * t,
    };
  }

  /**
   * Normalize a Vector3-like object
   */
  static normalize(vector: Vector3Like): Vector3Like {
    const length = Math.sqrt(
      vector.x * vector.x + vector.y * vector.y + vector.z * vector.z
    );
    if (length === 0) return { x: 0, y: 0, z: 0 };
    return {
      x: vector.x / length,
      y: vector.y / length,
      z: vector.z / length,
    };
  }

  /**
   * Cross product of two Vector3-like objects
   */
  static cross(a: Vector3Like, b: Vector3Like): Vector3Like {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    };
  }

  /**
   * Dot product of two Vector3-like objects
   */
  static dot(a: Vector3Like, b: Vector3Like): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  /**
   * Scale a Vector3-like object
   */
  static scale(vector: Vector3Like, scalar: number): Vector3Like {
    return {
      x: vector.x * scalar,
      y: vector.y * scalar,
      z: vector.z * scalar,
    };
  }

  /**
   * Add two Vector3-like objects
   */
  static add(a: Vector3Like, b: Vector3Like): Vector3Like {
    return {
      x: a.x + b.x,
      y: a.y + b.y,
      z: a.z + b.z,
    };
  }

  /**
   * Subtract two Vector3-like objects (a - b)
   */
  static subtract(a: Vector3Like, b: Vector3Like): Vector3Like {
    return {
      x: a.x - b.x,
      y: a.y - b.y,
      z: a.z - b.z,
    };
  }

  /**
   * Calculate the center of mass for multiple objects
   */
  static calculateCenterOfMass(
    objects: Array<{ position: Vector3Like; mass: number }>
  ): Vector3Like {
    let totalMass = 0;
    let weightedPosition = { x: 0, y: 0, z: 0 };

    objects.forEach((obj) => {
      totalMass += obj.mass;
      weightedPosition.x += obj.position.x * obj.mass;
      weightedPosition.y += obj.position.y * obj.mass;
      weightedPosition.z += obj.position.z * obj.mass;
    });

    if (totalMass === 0) return { x: 0, y: 0, z: 0 };

    return {
      x: weightedPosition.x / totalMass,
      y: weightedPosition.y / totalMass,
      z: weightedPosition.z / totalMass,
    };
  }

  /**
   * Apply impulse to body in direction of target
   */
  static applyImpulseTowards(
    body: CANNON.Body,
    target: Vector3Like,
    impulseStrength: number
  ): void {
    const direction = this.subtract(target, body.position);
    const normalizedDirection = this.normalize(direction);
    const impulse = this.scale(normalizedDirection, impulseStrength);

    body.applyImpulse(new CANNON.Vec3(impulse.x, impulse.y, impulse.z));
  }

  /**
   * Apply force to body in direction away from target (explosion-like)
   */
  static applyExplosionForce(
    body: CANNON.Body,
    explosionCenter: Vector3Like,
    explosionStrength: number,
    explosionRadius: number
  ): void {
    const distance = this.distance(body.position, explosionCenter);
    if (distance > explosionRadius) return;

    const direction = this.subtract(body.position, explosionCenter);
    const normalizedDirection = this.normalize(direction);

    // Falloff based on distance
    const falloff = 1 - distance / explosionRadius;
    const force = this.scale(normalizedDirection, explosionStrength * falloff);

    body.applyForce(new CANNON.Vec3(force.x, force.y, force.z));
  }

  /**
   * Check if a point is inside a sphere
   */
  static isPointInSphere(
    point: Vector3Like,
    sphereCenter: Vector3Like,
    sphereRadius: number
  ): boolean {
    return this.distance(point, sphereCenter) <= sphereRadius;
  }

  /**
   * Check if a point is inside a box
   */
  static isPointInBox(
    point: Vector3Like,
    boxCenter: Vector3Like,
    boxHalfExtents: Vector3Like
  ): boolean {
    return (
      Math.abs(point.x - boxCenter.x) <= boxHalfExtents.x &&
      Math.abs(point.y - boxCenter.y) <= boxHalfExtents.y &&
      Math.abs(point.z - boxCenter.z) <= boxHalfExtents.z
    );
  }

  /**
   * Get velocity magnitude
   */
  static getVelocityMagnitude(body: CANNON.Body): number {
    const velocity = body.velocity;
    return Math.sqrt(
      velocity.x * velocity.x +
        velocity.y * velocity.y +
        velocity.z * velocity.z
    );
  }

  /**
   * Get angular velocity magnitude
   */
  static getAngularVelocityMagnitude(body: CANNON.Body): number {
    const angularVelocity = body.angularVelocity;
    return Math.sqrt(
      angularVelocity.x * angularVelocity.x +
        angularVelocity.y * angularVelocity.y +
        angularVelocity.z * angularVelocity.z
    );
  }

  /**
   * Stop all motion on a body
   */
  static stopBody(body: CANNON.Body): void {
    body.velocity.set(0, 0, 0);
    body.angularVelocity.set(0, 0, 0);
  }

  /**
   * Clamp velocity to maximum speed
   */
  static clampVelocity(body: CANNON.Body, maxSpeed: number): void {
    const speed = this.getVelocityMagnitude(body);
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      body.velocity.scale(scale, body.velocity);
    }
  }

  /**
   * Clamp angular velocity to maximum angular speed
   */
  static clampAngularVelocity(
    body: CANNON.Body,
    maxAngularSpeed: number
  ): void {
    const angularSpeed = this.getAngularVelocityMagnitude(body);
    if (angularSpeed > maxAngularSpeed) {
      const scale = maxAngularSpeed / angularSpeed;
      body.angularVelocity.scale(scale, body.angularVelocity);
    }
  }

  /**
   * Calculate kinetic energy of a body
   */
  static calculateKineticEnergy(body: CANNON.Body): number {
    const linearKE = 0.5 * body.mass * this.getVelocityMagnitude(body) ** 2;
    // Note: Rotational KE calculation would need inertia tensor, simplified here
    const angularKE =
      0.5 * body.mass * this.getAngularVelocityMagnitude(body) ** 2;
    return linearKE + angularKE;
  }

  /**
   * Calculate potential energy of a body in gravity
   */
  static calculatePotentialEnergy(
    body: CANNON.Body,
    gravity: Vector3Like
  ): number {
    const height = body.position.y;
    const gravityMagnitude = Math.sqrt(
      gravity.x ** 2 + gravity.y ** 2 + gravity.z ** 2
    );
    return body.mass * gravityMagnitude * height;
  }

  /**
   * Get bodies within a certain radius
   */
  static getBodiesInRadius(
    bodies: CANNON.Body[],
    center: Vector3Like,
    radius: number
  ): CANNON.Body[] {
    return bodies.filter(
      (body) => this.distance(body.position, center) <= radius
    );
  }

  /**
   * Get physics objects within a certain radius
   */
  static getPhysicsObjectsInRadius(
    objects: PhysicsObject[],
    center: Vector3Like,
    radius: number
  ): PhysicsObject[] {
    return objects.filter(
      (obj) => this.distance(obj.cannonBody.position, center) <= radius
    );
  }

  /**
   * Create a spring force between two bodies
   */
  static createSpringForce(
    bodyA: CANNON.Body,
    bodyB: CANNON.Body,
    restLength: number,
    stiffness: number,
    damping: number = 0
  ): Vector3Like {
    const displacement = this.subtract(bodyB.position, bodyA.position);
    const currentLength = Math.sqrt(
      displacement.x ** 2 + displacement.y ** 2 + displacement.z ** 2
    );

    if (currentLength === 0) return { x: 0, y: 0, z: 0 };

    const normalizedDisplacement = this.normalize(displacement);
    const extension = currentLength - restLength;

    // Spring force
    const springForce = this.scale(
      normalizedDisplacement,
      -stiffness * extension
    );

    // Damping force
    const relativeVelocity = this.subtract(bodyB.velocity, bodyA.velocity);
    const dampingForce = this.scale(relativeVelocity, -damping);

    return this.add(springForce, dampingForce);
  }

  /**
   * Convert degrees to radians
   */
  static degToRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   */
  static radToDeg(radians: number): number {
    return radians * (180 / Math.PI);
  }

  /**
   * Clamp a value between min and max
   */
  static clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Linear interpolation between two numbers
   */
  static lerpNumber(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Map a value from one range to another
   */
  static map(
    value: number,
    fromMin: number,
    fromMax: number,
    toMin: number,
    toMax: number
  ): number {
    const normalized = (value - fromMin) / (fromMax - fromMin);
    return toMin + normalized * (toMax - toMin);
  }
}
