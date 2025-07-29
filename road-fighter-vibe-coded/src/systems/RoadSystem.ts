import * as THREE from "three";
import { GAME_CONFIG, VISUAL_CONFIG } from "../utils/Constants";

export class RoadSystem {
  private scene: THREE.Scene;
  private roadSegments: THREE.Mesh[] = [];
  private centerLines: THREE.Mesh[] = [];
  private laneMarkers: THREE.Mesh[][] = [];
  private grassSides: THREE.Mesh[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.createInitialRoad();
  }

  private createInitialRoad(): void {
    // Create more initial segments for smoother experience
    for (let i = 0; i < GAME_CONFIG.ACTIVE_SEGMENTS; i++) {
      this.createRoadSegment(i);
    }
  }

  private createRoadSegment(segmentIndex: number): void {
    const zPosition = (segmentIndex - 2) * GAME_CONFIG.ROAD_SEGMENT_LENGTH;

    // Create main road segment
    const roadGeometry = new THREE.PlaneGeometry(
      GAME_CONFIG.ROAD_WIDTH,
      GAME_CONFIG.ROAD_SEGMENT_LENGTH
    );
    const roadMaterial = new THREE.MeshLambertMaterial({
      color: VISUAL_CONFIG.ROAD_COLOR,
    });
    const roadSegment = new THREE.Mesh(roadGeometry, roadMaterial);
    roadSegment.rotation.x = -Math.PI / 2;
    roadSegment.position.set(0, 0, zPosition);
    this.scene.add(roadSegment);
    this.roadSegments.push(roadSegment);

    // Create grass sides for highway feel
    this.createGrassSides(zPosition);

    // Create center line
    this.createCenterLine(zPosition);

    // Create lane markers
    this.createLaneMarkers(zPosition);
  }

  private createGrassSides(zPosition: number): void {
    const grassWidth = 20;
    const grassGeometry = new THREE.PlaneGeometry(
      grassWidth,
      GAME_CONFIG.ROAD_SEGMENT_LENGTH
    );
    const grassMaterial = new THREE.MeshLambertMaterial({
      color: VISUAL_CONFIG.GRASS_COLOR,
    });

    // Left grass
    const leftGrass = new THREE.Mesh(grassGeometry, grassMaterial);
    leftGrass.rotation.x = -Math.PI / 2;
    leftGrass.position.set(
      -(GAME_CONFIG.ROAD_WIDTH / 2 + grassWidth / 2),
      -0.01,
      zPosition
    );
    this.scene.add(leftGrass);
    this.grassSides.push(leftGrass);

    // Right grass
    const rightGrass = new THREE.Mesh(grassGeometry, grassMaterial);
    rightGrass.rotation.x = -Math.PI / 2;
    rightGrass.position.set(
      GAME_CONFIG.ROAD_WIDTH / 2 + grassWidth / 2,
      -0.01,
      zPosition
    );
    this.scene.add(rightGrass);
    this.grassSides.push(rightGrass);
  }

  private createCenterLine(zPosition: number): void {
    const lineGeometry = new THREE.PlaneGeometry(
      VISUAL_CONFIG.LANE_MARKING_WIDTH,
      GAME_CONFIG.ROAD_SEGMENT_LENGTH
    );
    const lineMaterial = new THREE.MeshLambertMaterial({
      color: VISUAL_CONFIG.LANE_MARKING_COLOR,
    });
    const centerLine = new THREE.Mesh(lineGeometry, lineMaterial);
    centerLine.rotation.x = -Math.PI / 2;
    centerLine.position.set(0, 0.01, zPosition);
    this.scene.add(centerLine);
    this.centerLines.push(centerLine);
  }

  private createLaneMarkers(zPosition: number): void {
    const segmentLaneMarkers: THREE.Mesh[] = [];

    // Create lane dividers (not center line)
    const lanePositions = [-GAME_CONFIG.LANE_WIDTH, GAME_CONFIG.LANE_WIDTH];

    for (const laneX of lanePositions) {
      const markerGeometry = new THREE.PlaneGeometry(
        VISUAL_CONFIG.LANE_MARKING_WIDTH,
        VISUAL_CONFIG.LANE_MARKING_LENGTH
      );
      const markerMaterial = new THREE.MeshLambertMaterial({
        color: VISUAL_CONFIG.LANE_MARKING_COLOR,
      });

      // Create dashed lane markers
      const segmentStart = zPosition - GAME_CONFIG.ROAD_SEGMENT_LENGTH / 2;
      for (
        let z = 0;
        z < GAME_CONFIG.ROAD_SEGMENT_LENGTH;
        z += VISUAL_CONFIG.LANE_MARKING_GAP
      ) {
        const laneMarker = new THREE.Mesh(markerGeometry, markerMaterial);
        laneMarker.rotation.x = -Math.PI / 2;
        laneMarker.position.set(laneX, 0.01, segmentStart + z);
        this.scene.add(laneMarker);
        segmentLaneMarkers.push(laneMarker);
      }
    }

    this.laneMarkers.push(segmentLaneMarkers);
  }

  public update(playerZ: number): void {
    // More aggressive road generation for smoother experience
    const frontmostSegmentZ = Math.min(
      ...this.roadSegments.map((seg) => seg.position.z)
    );

    // Create new segment when player is within transition distance
    if (playerZ < frontmostSegmentZ + GAME_CONFIG.SEGMENT_TRANSITION_DISTANCE) {
      this.removeRearSegment();
      this.createRoadSegmentAt(
        frontmostSegmentZ - GAME_CONFIG.ROAD_SEGMENT_LENGTH
      );
    }
  }

  private removeRearSegment(): void {
    if (this.roadSegments.length > GAME_CONFIG.ACTIVE_SEGMENTS) {
      // Find rearmost segment
      let maxZ = -Infinity;
      let rearmostIndex = 0;

      this.roadSegments.forEach((segment, index) => {
        if (segment.position.z > maxZ) {
          maxZ = segment.position.z;
          rearmostIndex = index;
        }
      });

      // Remove all components of the segment
      this.scene.remove(this.roadSegments[rearmostIndex]);
      this.roadSegments.splice(rearmostIndex, 1);

      this.scene.remove(this.centerLines[rearmostIndex]);
      this.centerLines.splice(rearmostIndex, 1);

      // Remove grass sides (2 per segment)
      const grassIndex = rearmostIndex * 2;
      if (this.grassSides[grassIndex]) {
        this.scene.remove(this.grassSides[grassIndex]);
        this.scene.remove(this.grassSides[grassIndex + 1]);
        this.grassSides.splice(grassIndex, 2);
      }

      // Remove lane markers
      if (this.laneMarkers[rearmostIndex]) {
        this.laneMarkers[rearmostIndex].forEach((marker) =>
          this.scene.remove(marker)
        );
        this.laneMarkers.splice(rearmostIndex, 1);
      }
    }
  }

  private createRoadSegmentAt(zPosition: number): void {
    this.createRoadSegment(
      Math.floor(zPosition / GAME_CONFIG.ROAD_SEGMENT_LENGTH) + 2
    );
  }

  public destroy(): void {
    [...this.roadSegments, ...this.centerLines, ...this.grassSides].forEach(
      (mesh) => {
        this.scene.remove(mesh);
      }
    );
    this.laneMarkers.forEach((markerGroup) =>
      markerGroup.forEach((marker) => this.scene.remove(marker))
    );
  }
}
