# Asteroid Blast - Core Game Requirements

## 1. Game Overview
2D space shooter where player controls a spaceship at bottom of screen, shooting asteroids falling from top.

## 2. Game Objects

### 2.1 Spaceship
- **Position**: Bottom center of screen
- **Movement**: Left/Right only with A/D or arrow keys
- **HP**: 100 (starts)
- **Shooting**: Auto-fire projectiles upward
- **Fire Rate**: 600 RPM (10 shots/second)

### 2.2 Asteroids
| Type | HP | Speed | Damage to Ship | Points |
|------|----|----|--------|---------|
| Small | 1 | Fast | 10 | 10 |
| Medium | 2 | Medium | 25 | 25 |
| Large | 3 | Slow | 40 | 50 |

- **Spawn**: From top of screen, fall downward
- **Destruction**: Disappear when HP = 0

### 2.3 Projectiles
- **Speed**: Fast upward movement
- **Damage**: 1 HP to asteroids
- **Behavior**: Destroy on asteroid hit

### 2.4 Power-ups (Drop from destroyed asteroids)
- **2x Damage**: Double projectile damage (15 seconds)
- **2x Fire Rate**: Double shooting speed (15 seconds)  
- **+25 HP**: Instant health restore
- **Drop Rate**: 50% chance from any asteroid
- **Collection**: Auto-pickup on contact

## 3. Core Mechanics

### 3.1 Difficulty Progression
- **Time**: Every 30 seconds = harder
- **Changes**: More asteroids spawn, bigger ones more frequent

### 3.2 Game Over
- When spaceship HP = 0
- Show restart button

### 3.3 Scoring
- Destroy asteroids = points
- Track high score

## 4. Technical Setup

### 4.1 Technology
- **Three.js**: Main engine
- **Cannon-es**: Collision detection
- **Web Audio API**: Sound effects

### 4.2 Sounds Needed
- Asteroid destruction
- Power-up pickup
- Spaceship hit
- Game over

### 4.3 Screen Layout
- Game area: 1280x720
- UI: Health bar, score, high score
- Fixed top-down camera

## 5. Game Loop
1. Move spaceship left/right
2. Auto-shoot projectiles upward
3. Spawn asteroids from top
4. Check collisions
5. Apply damage/power-ups
6. Update score
7. Increase difficulty over time