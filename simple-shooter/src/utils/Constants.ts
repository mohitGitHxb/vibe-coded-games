export const GAME_CONFIG = {
  ARENA: {
    WIDTH: 1200,
    HEIGHT: 800,
  },
  PLAYER: {
    SPEED: 150,
    HEALTH: 100,
    COLLISION_RADIUS: 30,
  },
  WEAPONS: {
    ASSAULT_RIFLE: {
      DAMAGE: 25,
      FIRE_RATE: 8000, // shots per second
      BULLET_SPEED: 800,
    },
  },
  ENEMIES: {
    GRUNT: {
      HEALTH: 50,
      SPEED: 100,
      DAMAGE: 15,
      FIRE_INTERVAL: 1000,
      COLLISION_RADIUS: 40,
    },
  },
} as const;

export const COLORS = {
  ARENA_FLOOR: 0x2d2d44,
  ARENA_WALLS: 0x16213e,
  GRID_MAJOR: 0x3d3d5c,
  GRID_MINOR: 0x2d2d44,
  PLAYER_BULLET: 0xffff00,
  ENEMY_BULLET: 0xff4444,
  ENEMY_GRUNT: 0x00ff00,
  PLAYER_FALLBACK: 0x00ff88,
} as const;
