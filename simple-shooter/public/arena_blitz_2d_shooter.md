# ARENA BLITZ - 2D Shooting Game Requirements Document

---

## Part 1: High-Level Vision

### 1.1. Game Concept & Elevator Pitch:
A fast-paced 2D arena shooter where players battle waves of AI bots in confined arenas. Collect powerups to enhance weapons and abilities while surviving increasingly challenging enemy waves. Clean, responsive combat with tactical powerup management and escalating difficulty.

### 1.2. Genre:
- **Primary:** 2D Arena Shooter / Twin-Stick Shooter
- **Secondary:** Wave Survival, Power-up Collection

### 1.3. Theme & Setting:
Futuristic combat arenas with clean, geometric environments. Neon-accented visual style with clear visual communication of threats, powerups, and combat feedback.

### 1.4. Core Gameplay Loop:
1. Player spawns in arena with basic weapon
2. Waves of enemy bots appear with increasing difficulty
3. Eliminate bots while avoiding their attacks
4. Collect powerups to enhance combat capabilities
5. Survive as many waves as possible for high score
6. Death resets progress but tracks best performance

### 1.5. Win/Lose Conditions:
- **Win Condition:** Survive maximum waves (Wave 20) or achieve target score
- **Lose Condition:** Player health reaches zero

---

## Part 2: Player, Camera, and Controls

### 2.1. Player Entity:
- **Description:** Agile combat unit with 360-degree movement and aiming
- **Core Abilities:**
  - Omnidirectional movement (WASD)
  - Independent aiming and shooting (mouse)
  - Health regeneration (slow, out-of-combat)
  - Powerup collection and management

### 2.2. Camera System:
- **Type:** Fixed 2D Top-Down Camera
- **Behavior:**
  - Centered on player with slight offset toward mouse cursor
  - Arena fits entirely within viewport
  - Subtle screen shake on impacts and explosions
  - No zoom changes (consistent view)

### 2.3. Control Scheme:
- **Movement:** WASD keys for 8-directional movement
- **Aiming:** Mouse cursor for precise 360-degree aiming
- **Shooting:** Left Mouse Button (hold for continuous fire)
- **Reload:** R key (when applicable)
- **Pause:** P key or Escape
- **Restart:** R key (after death)

---

## Part 3: Core Mechanics & Game Systems

### 3.1. Player Statistics:
- **Health:** 100 HP (regenerates 2 HP/second after 3 seconds without damage)
- **Movement Speed:** 150 units/second (base)
- **Base Weapon:** Assault Rifle (moderate damage, good rate of fire)
- **Ammunition:** Unlimited (some powerup weapons have limited ammo)

### 3.2. Combat System:

#### Base Weapon - Assault Rifle:
- **Damage:** 25 per shot
- **Rate of Fire:** 8 shots/second
- **Range:** Full arena coverage
- **Accuracy:** High precision with slight spread at long range
- **Reload:** 2-second reload every 30 shots

#### Projectile Physics:
- **Bullet Speed:** 800 units/second
- **Travel Time:** Realistic ballistics requiring leading targets
- **Collision:** Instant damage on contact
- **Visual Feedback:** Muzzle flash, bullet trails, impact effects

### 3.3. Bot AI System:

#### Bot Types:

**Grunt (Green) - Basic Enemy:**
- **Health:** 50 HP
- **Speed:** 100 units/second
- **Weapon:** Single-shot rifle (15 damage)
- **AI Behavior:** Direct approach, basic obstacle avoidance
- **Attack Pattern:** Stops to aim and shoot, 1-second intervals
- **Spawn Weight:** 60% of enemies

**Rusher (Red) - Aggressive Melee:**
- **Health:** 80 HP
- **Speed:** 200 units/second
- **Weapon:** Melee attack (40 damage, close range)
- **AI Behavior:** Aggressive pursuit, tries to get close
- **Attack Pattern:** Charges player, explodes on contact
- **Spawn Weight:** 25% of enemies

**Sniper (Blue) - Long-Range:**
- **Health:** 30 HP
- **Speed:** 80 units/second
- **Weapon:** High-damage rifle (50 damage)
- **AI Behavior:** Maintains distance, seeks cover
- **Attack Pattern:** 3-second aimed shots, retreats when approached
- **Spawn Weight:** 15% of enemies

#### Bot AI Behaviors:
- **Pathfinding:** Navigate around arena obstacles
- **Target Acquisition:** Always focus on player
- **Evasion:** Strafe and dodge player shots (advanced bots)
- **Coordination:** Later waves show group tactics
- **Difficulty Scaling:** Improved accuracy and reaction time per wave

### 3.4. Wave System:

#### Wave Structure:
**Wave 1-3: Introduction**
- 3-5 Grunts per wave
- 30-second intervals between waves
- Single spawn point

**Wave 4-8: Escalation**
- 6-10 mixed enemies (mostly Grunts + few Rushers)
- 25-second intervals
- Two spawn points

**Wave 9-15: Intensity**
- 12-18 mixed enemies (all types)
- 20-second intervals  
- Three spawn points
- First Sniper appearances

**Wave 16-20: Maximum Challenge**
- 20-25 enemies per wave
- 15-second intervals
- Four spawn points
- Coordinated group attacks

#### Wave Bonuses:
- **Wave Complete:** +500 points
- **Perfect Wave:** (no damage taken) +1000 bonus points
- **Speed Bonus:** Complete within time limit for extra points

### 3.5. Powerup System:

#### Weapon Powerups (Replace current weapon):

**Shotgun (Orange):**
- **Damage:** 15 per pellet × 6 pellets
- **Range:** Short (spreads quickly)
- **Rate of Fire:** 3 shots/second
- **Duration:** 45 seconds or 20 shots
- **Best Against:** Rushers and grouped enemies

**Sniper Rifle (Purple):**
- **Damage:** 100 per shot
- **Range:** Unlimited
- **Rate of Fire:** 1 shot/2 seconds
- **Duration:** 30 seconds or 15 shots
- **Best Against:** Snipers and high-health targets

**Rocket Launcher (Red):**
- **Damage:** 80 + 30 splash damage
- **Range:** Medium (explosive projectile)
- **Rate of Fire:** 1 shot/3 seconds
- **Duration:** 25 seconds or 8 shots
- **Best Against:** Groups of enemies

**Machine Gun (Yellow):**
- **Damage:** 12 per shot
- **Rate of Fire:** 15 shots/second
- **Duration:** 40 seconds or 200 shots
- **Best Against:** Suppression and sustained combat

#### Ability Powerups (Temporary effects):

**Health Pack (Green):**
- **Effect:** Instantly restores 50 HP
- **Duration:** Instant
- **Spawn Rate:** Common when player health < 50%

**Speed Boost (Blue):**
- **Effect:** +100% movement speed
- **Duration:** 15 seconds
- **Visual:** Blue trail effect behind player

**Shield (Silver):**
- **Effect:** Absorbs next 100 damage taken
- **Duration:** Until depleted or 30 seconds
- **Visual:** Glowing barrier around player

**Damage Boost (Gold):**
- **Effect:** +100% weapon damage
- **Duration:** 20 seconds
- **Visual:** Golden weapon glow and enhanced effects

**Time Slow (Cyan):**
- **Effect:** Enemies move/shoot 50% slower
- **Duration:** 10 seconds
- **Visual:** Blue time distortion effect

#### Powerup Mechanics:
- **Spawn Timing:** 1-2 powerups per wave
- **Spawn Locations:** Random positions away from immediate combat
- **Collection:** Walk over to collect
- **Priority System:** Weapon powerups override current weapon
- **Visual Indicators:** Distinct colors and pulsing animations

### 3.6. Arena Design:

#### Arena Layout:
- **Size:** 1200×800 units (fits in viewport)
- **Shape:** Rectangular with rounded corners
- **Obstacles:** 4-6 destructible cover points
- **Walls:** Solid boundaries, bullets bounce once

#### Cover System:
- **Cover Objects:** Destructible barriers (100 HP each)
- **Strategic Value:** Break line of sight, create tactical positions
- **Destruction:** Explode after taking damage, brief area denial

#### Spawn System:
- **Player Spawn:** Center of arena
- **Enemy Spawns:** 4 corners, rotate based on wave
- **Powerup Spawns:** Random locations, avoid current combat zones

### 3.7. Health & Damage System:
- **Player Health:** 100 HP maximum
- **Regeneration:** 2 HP/second after 3 seconds without damage
- **Damage Sources:** Enemy bullets, melee attacks, explosions
- **Death Mechanics:** Immediate game over, score recording
- **Invulnerability:** Brief 1-second immunity after taking damage

### 3.8. Scoring System:
- **Enemy Elimination:**
  - Grunt: 100 points
  - Rusher: 150 points  
  - Sniper: 200 points
- **Wave Completion:** 500 points per wave
- **Survival Bonus:** 50 points per second survived
- **Accuracy Bonus:** +25% score if accuracy > 70%
- **Powerup Usage:** +100 points per effective powerup use
- **Multiplier System:** Consecutive kills increase multiplier (max 3x)

---

## Part 4: Technical Specifications

### 4.1. Core Technology:
- **Rendering Engine:** Three.js (2D perspective)
- **Physics Engine:** Cannon-es (2D collision detection)
- **Animation:** GSAP (UI and effect animations)
- **Audio:** Tone.js (weapon sounds, explosions, music)

### 4.2. Key Libraries from Resources:
- **3D Framework:** Three.js for 2D rendering
- **Physics:** Cannon-es for collision detection
- **Animation:** GSAP for smooth effects
- **Utilities:** three-mesh-bvh for optimized collision queries
- **Performance:** stats.js for monitoring frame rate

### 4.3. Performance Targets:
- **Frame Rate:** Consistent 60 FPS
- **Response Time:** <16ms input lag
- **Particle Count:** Maximum 200 active particles
- **Enemy Count:** Up to 25 simultaneous enemies

---

## Part 5: Asset Requirements

### 5.1. Player Assets:
- `Player_Character`: Top-down combat unit sprite
- `Player_Weapon_Base`: Default assault rifle
- `Player_Movement_Trail`: Speed boost visual effect
- `Player_Shield_Effect`: Protective barrier visualization

### 5.2. Enemy Assets:
- `Bot_Grunt_Green`: Basic enemy unit
- `Bot_Rusher_Red`: Aggressive melee unit  
- `Bot_Sniper_Blue`: Long-range enemy
- `Enemy_Muzzle_Flash`: Weapon fire effects
- `Enemy_Death_Explosion`: Destruction animation

### 5.3. Weapon Assets:
- `Weapon_Shotgun`: Orange shotgun sprite
- `Weapon_Sniper`: Purple sniper rifle
- `Weapon_Rocket`: Red rocket launcher
- `Weapon_MachineGun`: Yellow machine gun
- `Projectile_Bullet`: Standard ammunition
- `Projectile_Rocket`: Explosive projectile
- `Explosion_Effect`: Blast radius visualization

### 5.4. Powerup Assets:
- `Powerup_Health`: Green health pack
- `Powerup_Speed`: Blue speed boost orb
- `Powerup_Shield`: Silver shield generator
- `Powerup_Damage`: Gold damage amplifier
- `Powerup_TimeSlow`: Cyan time distortion device
- `Powerup_Collect_Effect`: Collection animation

### 5.5. Environment Assets:
- `Arena_Floor`: Textured arena surface
- `Arena_Walls`: Boundary collision geometry
- `Cover_Destructible`: Barrier objects (4 variants)
- `Cover_Destroyed`: Rubble remains
- `Spawn_Point_Effect`: Enemy spawn indicators

### 5.6. UI Assets:
- `Health_Bar`: Player health indicator
- `Wave_Counter`: Current wave display
- `Score_Display`: Points and multiplier
- `Weapon_HUD`: Current weapon and ammo
- `Powerup_Timer`: Active effect duration
- `Game_Over_Screen`: Final score and restart options

### 5.7. Particle Effects:
- `Muzzle_Flash`: Weapon firing effects
- `Bullet_Impact`: Hit confirmation sparks
- `Blood_Splatter`: Enemy damage feedback
- `Explosion_Particles`: Rocket and destruction effects
- `Powerup_Aura`: Active ability visualizations

---

## Part 6: Audio Design

### 6.1. Weapon Audio:
- `Assault_Rifle_Fire`: Rapid gunfire with echo
- `Shotgun_Blast`: Heavy buckshot sound
- `Sniper_Rifle_Shot`: High-caliber rifle crack
- `Rocket_Launch`: Explosive projectile launch
- `Machine_Gun_Burst`: Sustained automatic fire
- `Reload_Sound`: Weapon reload mechanics

### 6.2. Combat Audio:
- `Enemy_Hit`: Damage confirmation sounds
- `Enemy_Death`: Destruction audio feedback
- `Player_Hit`: Damage taken indicator
- `Explosion_Audio`: Rocket and cover destruction
- `Ricochet_Sound`: Bullet deflection off walls

### 6.3. Powerup Audio:
- `Powerup_Spawn`: Item appearance notification
- `Powerup_Collect`: Collection confirmation
- `Health_Restore`: Healing sound effect
- `Shield_Activate`: Protection activation
- `Speed_Boost_Active`: Movement enhancement audio

### 6.4. Ambient Audio:
- `Background_Music`: Intense electronic combat tracks
- `Wave_Start`: New wave announcement
- `Wave_Complete`: Victory fanfare
- `Game_Over`: Defeat audio sequence

---

## Part 7: Gameplay Balance & Progression

### 7.1. Difficulty Curve:
- **Early Waves (1-5):** Learning basic mechanics
- **Mid Waves (6-12):** Introducing all enemy types
- **Late Waves (13-20):** Maximum challenge and coordination

### 7.2. Powerup Balance:
- **Weapon Powerups:** High risk/reward for temporary advantages
- **Ability Powerups:** Tactical timing for maximum effectiveness
- **Spawn Rate:** Balanced to provide options without overwhelming

### 7.3. Replayability Features:
- **High Score System:** Personal best tracking
- **Wave Records:** Furthest wave reached
- **Accuracy Statistics:** Shooting precision metrics
- **Survival Times:** Longest single-life duration
- **Powerup Usage:** Effectiveness statistics

### 7.4. Mastery Goals:
- **Beginner:** Survive Wave 5
- **Intermediate:** Reach Wave 10 with 60%+ accuracy
- **Advanced:** Complete Wave 15 
- **Expert:** Achieve maximum score (Wave 20 completion)

---

This design creates an **intense, skill-based 2D shooter** with **strategic powerup management**, **diverse enemy AI**, and **progressive difficulty scaling** optimized for both quick sessions and long-term mastery.