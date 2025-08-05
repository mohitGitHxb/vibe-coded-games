# World Utils 🌍

Utility functions for world/scene management in Three.js applications.

## Purpose

This directory contains helper utilities for the world factory:

- Object positioning and transformation helpers
- Scene optimization utilities
- Camera control helpers
- Environment effect utilities

## Adding Utilities

Add new utility functions here as your world factory grows:

```typescript
// WorldHelpers.ts
export const positionObjectsInCircle = (
  objects: THREE.Object3D[],
  radius: number
) => {
  // Implementation here
};

export const createObjectGrid = (
  object: THREE.Object3D,
  rows: number,
  cols: number
) => {
  // Implementation here
};
```

## Future Extensions

- Scene optimization utilities
- Advanced camera controllers
- Physics integration helpers
- Environment animation utilities
