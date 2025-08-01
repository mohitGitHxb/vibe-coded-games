export const GAME_CONFIG = {
  // Screen dimensions (will be overridden by window size)
  SCREEN_WIDTH: 800,
  SCREEN_HEIGHT: 600,

  // Vehicle physics
  STARTING_SPEED: 83.3, // 300 km/h in m/s
  MAX_SPEED: 138.9, // 500 km/h in m/s
  SPEED_INCREMENT: 5.56, // 20 km/h in m/s
  STEERING_SPEED: 24.0, // Doubled for wider lanes (was 12.0)

  // Road dimensions - MADE MUCH WIDER
  LANE_WIDTH: 12.0, // Width of each lane in units (doubled from 6.0)
  MIN_LANES: 2,
  MAX_LANES: 5,
  ROAD_SEGMENT_LENGTH: 100, // Length of each road segment

  // Dynamic road width system
  ROAD_WIDTH_CHANGE_INTERVAL: 1000, // Change width every 1km (1000m)
  TRANSITION_ZONE_LENGTH: 80, // 80 units for smooth transitions
  WARNING_ZONE_LENGTH: 40, // 40 units before transition starts

  // Traffic system - ADJUSTED SPACING FOR MUCH WIDER ROADS
  TRAFFIC: {
    BASE_SPAWN_RATE: 0.3, // Base vehicles per second
    MAX_SPAWN_RATE: 1.2, // Maximum vehicles per second at high speeds
    SPAWN_DISTANCE: 150, // Distance ahead to spawn vehicles
    DESPAWN_DISTANCE: -50, // Distance behind to remove vehicles
    MIN_VEHICLE_SPACING: 24, // Minimum distance between vehicles (doubled)
    LANE_CHANGE_PROBABILITY: 0.02, // Chance per frame to change lanes
    SPEED_VARIANCE: 0.3, // ±30% speed variation from base speed
  },

  // Vehicle types configuration - SCALED UP FOR 12-UNIT LANES
  VEHICLE_TYPES: {
    CAR: {
      size: { width: 4.0, height: 1.6, length: 8.0 }, // Doubled from previous (2.0×0.8×4.0)
      speedFactor: 1, // Matches player speed
      spawnWeight: 60, // 60% of traffic
      colors: [0xff4444, 0x4444ff, 0xffff44, 0xff44ff, 0x44ffff],
    },
    TRUCK: {
      size: { width: 5.0, height: 2.4, length: 12.0 }, // Doubled from previous (2.5×1.2×6.0)
      speedFactor: 0.7, // 70% of player speed (slower)
      spawnWeight: 25, // 25% of traffic
      colors: [0x888888, 0x666666, 0x444444],
    },
    BUS: {
      size: { width: 5.6, height: 3.0, length: 16.0 }, // Doubled from previous (2.8×1.5×8.0)
      speedFactor: 0.6, // 60% of player speed (slowest)
      spawnWeight: 15, // 15% of traffic
      colors: [0xffa500, 0xff6600, 0xff8800],
    },
  },

  // Power-up system - SCALED UP FOR WIDER ROADS
  POWERUP: {
    SPAWN_INTERVAL: { min: 150, max: 400 }, // Distance between power-ups (meters)
    SPAWN_DISTANCE: 120, // Distance ahead to spawn power-ups
    DESPAWN_DISTANCE: -30, // Distance behind to remove power-ups
    PICKUP_DISTANCE: 8.0, // Distance required to collect power-up (doubled from 4.0)

    // Power-up effects
    EFFECTS: {
      SPEED_BOOST: {
        duration: 8, // Seconds
        speedMultiplier: 1.5, // 50% speed increase
        scoreMultiplier: 2, // Double points while boosted
      },
      INVINCIBILITY: {
        duration: 10, // Seconds
        blinkInterval: 0.2, // Blink every 0.2 seconds
      },
      SCORE_MULTIPLIER: {
        duration: 15, // Seconds
        multiplier: 3, // Triple points
      },
    },
  },

  // Power-up types configuration - SCALED UP FOR VISIBILITY
  POWERUP_TYPES: {
    SPEED_BOOST: {
      size: { width: 4.0, height: 2.0, length: 5.0 }, // Doubled from previous (2.0×1.0×2.5)
      color: 0x0088ff, // Blue
      spawnWeight: 40, // 40% of power-ups
      glowColor: 0x0088ff,
    },
    INVINCIBILITY: {
      size: { width: 4.0, height: 2.0, length: 5.0 }, // Doubled from previous (2.0×1.0×2.5)
      color: 0xffff00, // Yellow
      spawnWeight: 35, // 35% of power-ups
      glowColor: 0xffff00,
    },
    SCORE_MULTIPLIER: {
      size: { width: 4.0, height: 2.0, length: 5.0 }, // Doubled from previous (2.0×1.0×2.5)
      color: 0xff00ff, // Magenta
      spawnWeight: 25, // 25% of power-ups
      glowColor: 0xff00ff,
    },
  },

  // Camera settings - ADJUSTED FOR MUCH WIDER VIEW
  CAMERA_HEIGHT: 60, // Increased height to see wider road better (was 45)
  CAMERA_FOLLOW_DISTANCE: 20, // Increased distance for better overview (was 15)

  // Game progression
  SPEED_INCREASE_INTERVAL: 2000, // Increase speed every 2km

  // Colors
  COLORS: {
    ROAD: 0x404040,
    LANE_LINES: 0xffffff,
    PLAYER: 0x00ff00,
    BACKGROUND: 0x1a1a2e, // grayish
    WARNING_LINES: 0xffff00, // Yellow warning lines
    TRANSITION_ROAD: 0x505050, // Lighter road in transition zones
    ROAD_BOUNDARIES: 0xff0000, // Red road boundaries
  },
} as const;

export const INPUT_KEYS = {
  LEFT: ["ArrowLeft", "KeyA"],
  RIGHT: ["ArrowRight", "KeyD"],
  UP: ["ArrowUp", "KeyW"],
  DOWN: ["ArrowDown", "KeyS"],
  RESTART: ["KeyR"],
} as const;
