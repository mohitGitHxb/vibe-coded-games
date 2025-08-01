import * as THREE from "three";
import { GAME_CONFIG } from "../utils/Constants";
import type { RoadSegment, RoadState } from "../utils/Types";
import { EnhancedMaterials } from "../entities/EnhancedMaterials";

export class RoadSystem {
  private roadMeshes: THREE.Mesh[] = [];
  private laneMeshes: THREE.Mesh[] = [];
  private warningMeshes: THREE.Mesh[] = [];

  private roadState!: RoadState;
  private roadSegments: RoadSegment[] = [];

  // Materials
  private roadMaterial!: THREE.MeshLambertMaterial;
  private transitionRoadMaterial!: THREE.MeshLambertMaterial;
  private lineMaterial!: THREE.MeshBasicMaterial;
  private boundaryMaterial!: THREE.MeshBasicMaterial;
  private warningLineMaterial!: THREE.MeshBasicMaterial;

  // Fixed geometries for different road widths
  private roadGeometries: Map<number, THREE.PlaneGeometry> = new Map();
  private lineGeometry!: THREE.PlaneGeometry;
  private boundaryGeometry!: THREE.PlaneGeometry;

  // Track current lane configuration for line recreation
  private currentLaneConfiguration: number = 3;

  constructor() {
    this.initializeRoadState();
    this.createMaterials();
    this.createGeometries();
    this.createRoadSections();
  }

  private initializeRoadState(): void {
    this.roadState = {
      currentWidth: GAME_CONFIG.LANE_WIDTH * 3, // Start with 3 lanes
      targetWidth: GAME_CONFIG.LANE_WIDTH * 3,
      transitionProgress: 0,
      isTransitioning: false,
      nextTransitionDistance: GAME_CONFIG.ROAD_WIDTH_CHANGE_INTERVAL,
    };
  }

  private createMaterials(): void {
    this.roadMaterial = new THREE.MeshLambertMaterial({
      color: GAME_CONFIG.COLORS.ROAD,
      transparent: false,
    });

    this.transitionRoadMaterial = new THREE.MeshLambertMaterial({
      color: GAME_CONFIG.COLORS.TRANSITION_ROAD,
      transparent: false,
    });

    this.lineMaterial = new THREE.MeshBasicMaterial({
      color: GAME_CONFIG.COLORS.LANE_LINES,
      transparent: false,
    });

    this.boundaryMaterial = new THREE.MeshBasicMaterial({
      color: GAME_CONFIG.COLORS.ROAD_BOUNDARIES,
      transparent: false,
    });

    this.warningLineMaterial = new THREE.MeshBasicMaterial({
      color: GAME_CONFIG.COLORS.WARNING_LINES,
      transparent: false,
    });
  }

  private createGeometries(): void {
    // Create road geometries for each possible width
    for (let lanes = 2; lanes <= 5; lanes++) {
      const width = lanes * GAME_CONFIG.LANE_WIDTH;
      this.roadGeometries.set(lanes, new THREE.PlaneGeometry(width, 100));
    }

    // Lane line geometry (thin white lines)
    this.lineGeometry = new THREE.PlaneGeometry(0.1, 100);

    // Boundary geometry (thicker red lines)
    this.boundaryGeometry = new THREE.PlaneGeometry(0.2, 100);
  }

  private createRoadSections(): void {
    const sectionLength = 100;
    const numberOfSections = 20;

    for (let i = 0; i < numberOfSections; i++) {
      const zPosition = i * sectionLength;
      this.createRoadSection(zPosition);
    }

    // Create initial lane lines
    this.createLaneLines();
  }

  private createRoadSection(zPosition: number): void {
    // Create road mesh (will be updated dynamically)
    const currentLanes = this.getCurrentLanes();
    const roadGeometry = this.roadGeometries.get(currentLanes)!;
    const roadMesh = new THREE.Mesh(roadGeometry, this.roadMaterial);

    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, -0.1, zPosition);
    roadMesh.userData = {
      originalLanes: currentLanes,
      sectionIndex: this.roadMeshes.length,
      currentLanes: currentLanes,
    };

    this.roadMeshes.push(roadMesh);
  }

  private createLaneLines(): void {
    // Clear existing lane lines completely
    this.clearAllLaneLines();

    const currentLanes = this.getCurrentLanes();
    const roadWidth = currentLanes * GAME_CONFIG.LANE_WIDTH;
    const sectionLength = 100;
    const numberOfSections = 20;

    console.log(
      `Creating lane lines for ${currentLanes} lanes, width: ${roadWidth}`
    );

    // Create lane lines for each road section
    for (
      let sectionIndex = 0;
      sectionIndex < numberOfSections;
      sectionIndex++
    ) {
      const zPosition = sectionIndex * sectionLength;

      if (currentLanes === 2) {
        // 2-lane road: Only center dividing line (white) + red boundaries
        this.createCenterLine(zPosition, sectionIndex);
        this.createBoundaryLines(roadWidth, zPosition, sectionIndex);
      } else {
        // Multi-lane road: Multiple dividing lines (white) + red boundaries
        this.createMultipleLaneLines(currentLanes, zPosition, sectionIndex);
        this.createBoundaryLines(roadWidth, zPosition, sectionIndex);
      }
    }

    this.currentLaneConfiguration = currentLanes;
    console.log(`Created ${this.laneMeshes.length} lane line meshes`);
  }

  private createCenterLine(zPosition: number, sectionIndex: number): void {
    const centerLine = new THREE.Mesh(this.lineGeometry, this.lineMaterial);
    centerLine.position.set(0, -0.05, zPosition); // Exactly in the center
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.userData = {
      type: "center",
      sectionIndex,
      lanes: 2,
    };
    this.laneMeshes.push(centerLine);
  }

  private createMultipleLaneLines(
    lanes: number,
    zPosition: number,
    sectionIndex: number
  ): void {
    // Create lane dividing lines (not including edges)
    for (let lane = 1; lane < lanes; lane++) {
      const lineMesh = new THREE.Mesh(this.lineGeometry, this.lineMaterial);
      const xPosition = (lane - lanes / 2) * GAME_CONFIG.LANE_WIDTH;

      lineMesh.position.set(xPosition, -0.05, zPosition);
      lineMesh.rotation.x = -Math.PI / 2;
      lineMesh.userData = {
        type: "divider",
        sectionIndex,
        lanes,
        laneNumber: lane,
      };

      this.laneMeshes.push(lineMesh);
    }
  }

  private createBoundaryLines(
    roadWidth: number,
    zPosition: number,
    sectionIndex: number
  ): void {
    // Left boundary (red)
    const leftBoundary = new THREE.Mesh(
      this.boundaryGeometry,
      this.boundaryMaterial
    );
    leftBoundary.position.set(-roadWidth / 2, -0.04, zPosition);
    leftBoundary.rotation.x = -Math.PI / 2;
    leftBoundary.userData = {
      type: "boundary",
      side: "left",
      sectionIndex,
      lanes: this.getCurrentLanes(),
    };
    this.laneMeshes.push(leftBoundary);

    // Right boundary (red)
    const rightBoundary = new THREE.Mesh(
      this.boundaryGeometry,
      this.boundaryMaterial
    );
    rightBoundary.position.set(roadWidth / 2, -0.04, zPosition);
    rightBoundary.rotation.x = -Math.PI / 2;
    rightBoundary.userData = {
      type: "boundary",
      side: "right",
      sectionIndex,
      lanes: this.getCurrentLanes(),
    };
    this.laneMeshes.push(rightBoundary);
  }

  private clearAllLaneLines(): void {
    // Remove all lane lines from scene and dispose
    this.laneMeshes.forEach((mesh) => {
      if (mesh.parent) {
        mesh.parent.remove(mesh);
      }
    });
    this.laneMeshes.length = 0;
  }

  private updateRoadMeshGeometry(): void {
    const currentLanes = this.getCurrentLanes();
    const targetLanes = this.getTargetLanes();

    this.roadMeshes.forEach((mesh, index) => {
      let lanesToUse = currentLanes;

      // During transition, determine which geometry to use based on position
      if (this.roadState.isTransitioning) {
        const distance = this.getDistanceForSection(index);
        const transitionStart =
          this.roadState.nextTransitionDistance -
          GAME_CONFIG.WARNING_ZONE_LENGTH;
        const transitionEnd =
          this.roadState.nextTransitionDistance +
          GAME_CONFIG.TRANSITION_ZONE_LENGTH;

        if (distance >= transitionEnd) {
          lanesToUse = targetLanes;
        } else if (distance >= transitionStart) {
          // In transition zone - switch to target geometry
          lanesToUse = targetLanes;
        }
      }

      // Update geometry if it changed
      if (mesh.userData.currentLanes !== lanesToUse) {
        const newGeometry = this.roadGeometries.get(lanesToUse);
        if (newGeometry) {
          mesh.geometry = newGeometry;
          mesh.userData.currentLanes = lanesToUse;
        }
      }
    });
  }

  private getDistanceForSection(sectionIndex: number): number {
    return sectionIndex * 100;
  }

  public update(playerZ: number, gameDistance: number): void {
    this.updateRoadState(gameDistance);
    this.updateRoadMeshes(playerZ);
    this.updateLaneLines(playerZ);

    // Check if we need to recreate lane lines due to lane count change
    const currentLanes = this.getCurrentLanes();
    if (currentLanes !== this.currentLaneConfiguration) {
      this.createLaneLines();
      // Re-add to scene
      this.laneMeshes.forEach((mesh) => {
        if (!mesh.parent) {
          // Find the scene from the first road mesh
          if (this.roadMeshes[0] && this.roadMeshes[0].parent) {
            this.roadMeshes[0].parent.add(mesh);
          }
        }
      });
    }
  }

  private updateRoadState(distance: number): void {
    // Check if we need to start a new transition
    if (
      !this.roadState.isTransitioning &&
      distance >=
        this.roadState.nextTransitionDistance - GAME_CONFIG.WARNING_ZONE_LENGTH
    ) {
      this.startNewTransition(distance);
    }

    // Update transition progress
    if (this.roadState.isTransitioning) {
      const transitionStart =
        this.roadState.nextTransitionDistance - GAME_CONFIG.WARNING_ZONE_LENGTH;
      const transitionEnd =
        this.roadState.nextTransitionDistance +
        GAME_CONFIG.TRANSITION_ZONE_LENGTH;

      this.roadState.transitionProgress = Math.max(
        0,
        Math.min(
          1,
          (distance - transitionStart) / (transitionEnd - transitionStart)
        )
      );

      if (this.roadState.transitionProgress >= 1) {
        this.completeTransition();
      }

      // Update current width during transition (for player bounds)
      this.roadState.currentWidth = THREE.MathUtils.lerp(
        this.getCurrentLanes() * GAME_CONFIG.LANE_WIDTH,
        this.getTargetLanes() * GAME_CONFIG.LANE_WIDTH,
        this.roadState.transitionProgress
      );

      // Update road mesh geometries during transition
      this.updateRoadMeshGeometry();
    }
  }

  private startNewTransition(distance: number): void {
    this.roadState.isTransitioning = true;
    this.roadState.transitionProgress = 0;

    // Choose new target width
    const currentLanes = this.getCurrentLanes();
    const possibleLanes = [2, 3, 4, 5].filter(
      (lanes) => lanes !== currentLanes
    );
    const targetLanes =
      possibleLanes[Math.floor(Math.random() * possibleLanes.length)];

    this.roadState.targetWidth = targetLanes * GAME_CONFIG.LANE_WIDTH;

    console.log(
      `Starting road transition: ${currentLanes} → ${targetLanes} lanes at ${Math.round(
        distance
      )}m`
    );
  }

  private completeTransition(): void {
    this.roadState.isTransitioning = false;
    this.roadState.currentWidth = this.roadState.targetWidth;
    this.roadState.transitionProgress = 0;
    this.roadState.nextTransitionDistance +=
      GAME_CONFIG.ROAD_WIDTH_CHANGE_INTERVAL;

    console.log(
      `Road transition completed. Next transition at ${this.roadState.nextTransitionDistance}m`
    );
  }

  private getCurrentLanes(): number {
    return Math.round(this.roadState.currentWidth / GAME_CONFIG.LANE_WIDTH);
  }

  private getTargetLanes(): number {
    return Math.round(this.roadState.targetWidth / GAME_CONFIG.LANE_WIDTH);
  }

  private updateRoadMeshes(playerZ: number): void {
    const sectionLength = 100;

    this.roadMeshes.forEach((mesh, index) => {
      const baseZ = Math.floor(playerZ / sectionLength) * sectionLength;
      mesh.position.z = baseZ + (index - 10) * sectionLength;
    });
  }

  private updateLaneLines(playerZ: number): void {
    const sectionLength = 100;

    this.laneMeshes.forEach((mesh) => {
      const sectionIndex = mesh.userData.sectionIndex;
      const baseZ = Math.floor(playerZ / sectionLength) * sectionLength;

      // Calculate new Z position to match road sections
      const newZ = baseZ + (sectionIndex - 10) * sectionLength;
      mesh.position.z = newZ;
    });
  }

  public getCurrentRoadState(): RoadState {
    return { ...this.roadState };
  }

  public getCurrentPlayerBounds(): { left: number; right: number } {
    const halfWidth = this.roadState.currentWidth / 2;
    return {
      left: -halfWidth + 0.5, // Account for car width
      right: halfWidth - 0.5,
    };
  }

  public addToScene(scene: THREE.Scene): void {
    this.roadMeshes.forEach((mesh) => scene.add(mesh));
    this.laneMeshes.forEach((mesh) => scene.add(mesh));
    this.warningMeshes.forEach((mesh) => scene.add(mesh));
  }

  public dispose(): void {
    // Dispose of geometries
    this.roadGeometries.forEach((geometry) => geometry.dispose());
    this.lineGeometry.dispose();
    this.boundaryGeometry.dispose();

    // Dispose of materials
    this.roadMaterial.dispose();
    this.transitionRoadMaterial.dispose();
    this.lineMaterial.dispose();
    this.boundaryMaterial.dispose();
    this.warningLineMaterial.dispose();

    // Clear arrays
    this.roadMeshes.length = 0;
    this.laneMeshes.length = 0;
    this.warningMeshes.length = 0;
    this.roadSegments.length = 0;
  }
}
