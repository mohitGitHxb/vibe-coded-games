/**
 * Physics Shape Creator - Creates CANNON.js shapes from Three.js geometries and options
 */

import * as THREE from "three";
import * as CANNON from "cannon-es";
import type {
  PhysicsShapeType,
  PhysicsShapeOptions,
  BoxShapeOptions,
  SphereShapeOptions,
  CylinderShapeOptions,
  PlaneShapeOptions,
  HeightfieldShapeOptions,
  TrimeshShapeOptions,
  ConvexHullShapeOptions,
  Vector3Like,
} from "../types/PhysicsTypes.js";

export class PhysicsShapeCreator {
  /**
   * Create a physics shape from type and options
   */
  static createShape(
    shapeType: PhysicsShapeType,
    options: PhysicsShapeOptions
  ): CANNON.Shape {
    switch (shapeType) {
      case "box":
        return this.createBoxShape(options as BoxShapeOptions);
      case "sphere":
        return this.createSphereShape(options as SphereShapeOptions);
      case "cylinder":
        return this.createCylinderShape(options as CylinderShapeOptions);
      case "plane":
        return this.createPlaneShape(options as PlaneShapeOptions);
      case "heightfield":
        return this.createHeightfieldShape(options as HeightfieldShapeOptions);
      case "trimesh":
        return this.createTrimeshShape(options as TrimeshShapeOptions);
      case "convexhull":
        return this.createConvexHullShape(options as ConvexHullShapeOptions);
      default:
        throw new Error(`Unknown shape type: ${shapeType}`);
    }
  }

  /**
   * Create a box shape
   */
  static createBoxShape(options: BoxShapeOptions): CANNON.Box {
    const { halfExtents } = options;
    return new CANNON.Box(
      new CANNON.Vec3(halfExtents.x, halfExtents.y, halfExtents.z)
    );
  }

  /**
   * Create a sphere shape
   */
  static createSphereShape(options: SphereShapeOptions): CANNON.Sphere {
    return new CANNON.Sphere(options.radius);
  }

  /**
   * Create a cylinder shape
   */
  static createCylinderShape(options: CylinderShapeOptions): CANNON.Cylinder {
    const { radiusTop, radiusBottom, height, numSegments = 8 } = options;
    return new CANNON.Cylinder(radiusTop, radiusBottom, height, numSegments);
  }

  /**
   * Create a plane shape
   */
  static createPlaneShape(_options: PlaneShapeOptions = {}): CANNON.Plane {
    return new CANNON.Plane();
  }

  /**
   * Create a heightfield shape
   */
  static createHeightfieldShape(
    options: HeightfieldShapeOptions
  ): CANNON.Heightfield {
    const { data, minValue, maxValue, elementSize } = options;
    return new CANNON.Heightfield(data, {
      minValue,
      maxValue,
      elementSize,
    });
  }

  /**
   * Create a trimesh shape
   */
  static createTrimeshShape(options: TrimeshShapeOptions): CANNON.Trimesh {
    const { vertices, indices } = options;
    return new CANNON.Trimesh(vertices, indices);
  }

  /**
   * Create a convex hull shape
   */
  static createConvexHullShape(
    options: ConvexHullShapeOptions
  ): CANNON.ConvexPolyhedron {
    const { vertices, faces } = options;
    const cannonVertices = vertices.map((v) => new CANNON.Vec3(v.x, v.y, v.z));
    return new CANNON.ConvexPolyhedron({ vertices: cannonVertices, faces });
  }

  /**
   * Create a shape from Three.js geometry
   */
  static createShapeFromGeometry(geometry: THREE.BufferGeometry): CANNON.Shape {
    if (geometry instanceof THREE.BoxGeometry) {
      const params = geometry.parameters;
      return new CANNON.Box(
        new CANNON.Vec3(params.width / 2, params.height / 2, params.depth / 2)
      );
    }

    if (geometry instanceof THREE.SphereGeometry) {
      const params = geometry.parameters;
      return new CANNON.Sphere(params.radius);
    }

    if (geometry instanceof THREE.CylinderGeometry) {
      const params = geometry.parameters;
      return new CANNON.Cylinder(
        params.radiusTop,
        params.radiusBottom,
        params.height,
        params.radialSegments
      );
    }

    if (geometry instanceof THREE.PlaneGeometry) {
      return new CANNON.Plane();
    }

    // For complex geometries, create a trimesh
    return this.createTrimeshFromGeometry(geometry);
  }

  /**
   * Create a trimesh from Three.js geometry
   */
  static createTrimeshFromGeometry(
    geometry: THREE.BufferGeometry
  ): CANNON.Trimesh {
    const position = geometry.attributes.position;
    const vertices: number[] = [];
    const indices: number[] = [];

    // Extract vertices
    for (let i = 0; i < position.count; i++) {
      vertices.push(position.getX(i), position.getY(i), position.getZ(i));
    }

    // Extract indices
    if (geometry.index) {
      for (let i = 0; i < geometry.index.count; i++) {
        indices.push(geometry.index.getX(i));
      }
    } else {
      // If no indices, create them
      for (let i = 0; i < position.count; i++) {
        indices.push(i);
      }
    }

    return new CANNON.Trimesh(vertices, indices);
  }

  /**
   * Create a convex hull from Three.js geometry
   */
  static createConvexHullFromGeometry(
    geometry: THREE.BufferGeometry
  ): CANNON.ConvexPolyhedron {
    const position = geometry.attributes.position;
    const vertices: CANNON.Vec3[] = [];

    // Extract unique vertices
    const vertexMap = new Map<string, CANNON.Vec3>();
    for (let i = 0; i < position.count; i++) {
      const x = position.getX(i);
      const y = position.getY(i);
      const z = position.getZ(i);
      const key = `${x.toFixed(6)},${y.toFixed(6)},${z.toFixed(6)}`;

      if (!vertexMap.has(key)) {
        const vertex = new CANNON.Vec3(x, y, z);
        vertexMap.set(key, vertex);
        vertices.push(vertex);
      }
    }

    // Create faces (triangular faces from indices)
    const faces: number[][] = [];
    if (geometry.index) {
      for (let i = 0; i < geometry.index.count; i += 3) {
        faces.push([
          geometry.index.getX(i),
          geometry.index.getX(i + 1),
          geometry.index.getX(i + 2),
        ]);
      }
    }

    return new CANNON.ConvexPolyhedron({ vertices, faces });
  }

  /**
   * Create a compound shape from multiple shapes
   */
  static createCompoundShape(
    shapes: Array<{
      shape: CANNON.Shape;
      offset?: Vector3Like;
      orientation?: CANNON.Quaternion;
    }>
  ): CANNON.Body {
    const body = new CANNON.Body({ mass: 0 });

    shapes.forEach(({ shape, offset, orientation }) => {
      const offsetVec = offset
        ? new CANNON.Vec3(offset.x, offset.y, offset.z)
        : new CANNON.Vec3();
      const orientationQuat = orientation || new CANNON.Quaternion();
      body.addShape(shape, offsetVec, orientationQuat);
    });

    return body;
  }

  /**
   * Automatically choose the best shape type for a geometry
   */
  static getBestShapeTypeForGeometry(
    geometry: THREE.BufferGeometry
  ): PhysicsShapeType {
    if (geometry instanceof THREE.BoxGeometry) return "box";
    if (geometry instanceof THREE.SphereGeometry) return "sphere";
    if (geometry instanceof THREE.CylinderGeometry) return "cylinder";
    if (geometry instanceof THREE.PlaneGeometry) return "plane";

    // For complex geometries, use convex hull for performance
    // or trimesh for accuracy (trimesh is more expensive)
    const vertexCount = geometry.attributes.position.count;
    return vertexCount > 1000 ? "convexhull" : "trimesh";
  }

  /**
   * Calculate optimal shape dimensions from geometry
   */
  static calculateShapeDimensions(
    geometry: THREE.BufferGeometry
  ): Record<string, any> {
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox!;

    const width = bbox.max.x - bbox.min.x;
    const height = bbox.max.y - bbox.min.y;
    const depth = bbox.max.z - bbox.min.z;

    return {
      box: {
        halfExtents: {
          x: width / 2,
          y: height / 2,
          z: depth / 2,
        },
      },
      sphere: {
        radius: Math.max(width, height, depth) / 2,
      },
      cylinder: {
        radiusTop: Math.max(width, depth) / 2,
        radiusBottom: Math.max(width, depth) / 2,
        height: height,
      },
      center: {
        x: (bbox.max.x + bbox.min.x) / 2,
        y: (bbox.max.y + bbox.min.y) / 2,
        z: (bbox.max.z + bbox.min.z) / 2,
      },
    };
  }
}
