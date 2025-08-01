# ENDLESS ROAD FIGHTER - Condensed Game Requirements Document

---

## Part 1: High-Level Vision

### 1.1. Game Concept & Elevator Pitch:

An endless top-down 2D racing game where players automatically accelerate at high speeds through dynamically changing highways with variable lane counts (2-5 lanes). Survive as long as possible while the game progressively increases speed, traffic density, and road complexity. Inspired by classic Road Fighter arcade gameplay with modern endless runner mechanics.

### 1.2. Genre:

- **Primary:** Endless Runner / Arcade Racing
- **Secondary:** Survival, Score Attack

### 1.3. Core Gameplay Loop:

1. Player automatically accelerates at high speed (starting 300+ km/h)
2. Player steers to avoid traffic and aggressive enemy cars
3. Road width changes dynamically (2-5 lanes) creating strategic challenges
4. Collect stackable powerups for tactical advantages
5. Difficulty continuously increases until inevitable destruction

---

## Part 2: Camera and Controls

### 2.1. Camera System:

- **Type:** Fixed 2D Top-Down Camera
- **Behavior:**
  - Static top-down view following player
  - **Dynamic Zoom:** Slight zoom adjustments based on road width
  - Maintains optimal visibility for high-speed gameplay

### 2.2. Control Scheme:

- **Input:** Keyboard (WASD/Arrow Keys)
- **Mapping:**
  - `A/←`: Steer Left
  - `D/→`: Steer Right
  - `P`: Pause
  - `R`: Restart after destruction

---

## Part 3: Core Mechanics & Game Systems

### 3.1. High-Speed Vehicle Physics:

- **Starting Speed:** 300 km/h (83.3 m/s)
- **Maximum Speed:** 500 km/h (138.9 m/s)
- **Speed Increase:** +20 km/h every 2km distance
- **Steering:** Responsive but realistic at high speeds
- **Feel:** Immediate, intense, adrenaline-focused gameplay

### 3.2. Dynamic Road Width System:

- **Lane Configurations:**
  - **2-Lane:** High-pressure sections (6 units wide)
  - **3-Lane:** Standard (9 units wide)
  - **4-Lane:** Tactical space (12 units wide)
  - **5-Lane:** Relief highways (15 units wide)
- **Transitions:** Smooth 80-unit morphing zones with visual warnings
- **Frequency:** Width changes every 1-2km for constant variety

### 3.3. Progressive Difficulty Phases:

#### Phase 1: Speed Demon (0-5km)

- **Speed:** 300-360 km/h
- **Road Config:** Mostly 3-4 lanes with occasional narrow sections
- **Traffic Density:** Moderate introduction to high-speed gameplay

#### Phase 2: Highway Hell (5-12km)

- **Speed:** 360-420 km/h
- **Road Config:** Frequent 2-lane pressure with 5-lane relief
- **Traffic Density:** Heavy traffic with coordinated enemy behavior

#### Phase 3: Death Race (12km+)

- **Speed:** 420-500 km/h (maximum)
- **Road Config:** Extended narrow gauntlets with minimal relief
- **Traffic Density:** Maximum chaos with all enemy types active

### 3.4. Traffic & Enemy System:

#### Enemy Types (All Slower Than Player):

- **Aggressive Interceptor (Red):**

  - **Speed:** 250-280 km/h
  - **Behavior:** Actively changes lanes toward player position
  - **AI:** Smart but not instant - takes 2-3 seconds to react and change lanes
  - **Spawn Rate:** 1 every 15-20 seconds

- **Random Weaver (Yellow):**

  - **Speed:** 220-260 km/h
  - **Behavior:** Changes lanes randomly left/right every 3-5 seconds
  - **Unpredictability:** Creates chaos in traffic flow
  - **Spawn Rate:** 1 every 10-15 seconds

- **Normal Traffic (Blue/Gray):**
  - **Speed:** 180-240 km/h (variable)
  - **Behavior:** Maintains lane, occasional random lane changes
  - **Density:** 60% of total traffic
  - **Purpose:** Creates obstacles and traffic flow patterns

#### Traffic Scaling:

- **Base Density:** 4-6 cars visible at any time
- **Maximum Density:** 12-15 cars in later phases
- **Lane Distribution:** Even spread across all available lanes
- **Speed Differential:** Player always 50-100 km/h faster than traffic

### 3.5. Stackable Powerup System:

#### Core Powerups (Stackable & Simultaneous):

- **Extra Life (+1):**

  - **Effect:** Grants additional life/chance
  - **Duration:** Permanent until used
  - **Visual:** Green heart with pulsing glow
  - **Spawn Rate:** 1 every 3-4km
  - **Stacking:** Can accumulate multiple lives (max 5 total)

- **Speed Boost:**

  - **Effect:** +100 km/h speed increase
  - **Duration:** 8 seconds
  - **Visual:** Blue lightning aura with speed trails
  - **Spawn Rate:** 1 every 2km
  - **Stacking:** Multiple boosts add duration (+8 sec each)

- **Invincibility:**
  - **Effect:** Immunity to all collisions
  - **Duration:** 5 seconds
  - **Visual:** Golden shield with particle effects
  - **Spawn Rate:** 1 every 4-5km (rarest)
  - **Stacking:** Multiple shields add duration (+5 sec each)

#### Powerup Mechanics:

- **Multiple Active Effects:** All three can be active simultaneously
- **Strategic Collection:** Risk/reward positioning for powerup pickup
- **Visual Feedback:** Clear indicators for all active effects
- **Audio Cues:** Distinct sounds for collection and activation

### 3.6. Collision & Destruction:

- **Destruction Triggers:**
  - High-speed impact with any vehicle (unless invincible)
  - Road boundary collision at 300+ km/h
- **Lives System:** Start with 3 lives, gain more through Extra Life powerups
- **Respawn:** Brief invulnerability with position reset

### 3.7. Scoring System:

- **Distance:** 10 points per 100m traveled
- **Speed Bonus:** Multiplier based on current speed (1x-2x)
- **Traffic Navigation:** +50 points per vehicle safely passed
- **Enemy Evasion:** +200 points per aggressive interceptor avoided
- **Powerup Collection:** +300 points per powerup
- **Risk Bonus:** Higher scores for dangerous powerup collection
- **Combo Multiplier:** Stacked powerups increase score multiplier

---

## Part 4: Technical Specifications

### 4.1. Core Technology:

- **Rendering:** Three.js (2D top-down perspective)
- **Physics:** Cannon-es (simplified for 2D high-speed collisions)
- **Animation:** GSAP (smooth road transitions)
- **Performance:** Optimized for consistent 60fps at high speeds

### 4.2. Key Libraries from Resources:

- **3D Framework:** Three.js for 2D top-down rendering
- **Physics:** Cannon-es for collision detection
- **Animation:** GSAP for road morphing and UI effects
- **Utilities:** three-mesh-bvh for optimized collision detection
- **Audio:** Tone.js for engine sounds and effects

---

## Part 5: Asset Requirements

### 5.1. Vehicle Assets:

- `Player_Car`: High-speed sports car with powerup effect visualizations
- `Enemy_Interceptor_Red`: Aggressive pursuing vehicle
- `Enemy_Weaver_Yellow`: Unpredictable lane-changing vehicle
- `Traffic_Car_Variants`: 4-5 different normal traffic vehicles (blue/gray)

### 5.2. Road System:

- `Road_2Lane` through `Road_5Lane`: Dynamic width configurations
- `Lane_Markings`: Responsive lane indicators
- `Road_Transition_Zones`: Smooth width change sections

### 5.3. Powerup Assets:

- `Powerup_ExtraLife`: Green heart with animation
- `Powerup_SpeedBoost`: Blue lightning with energy effects
- `Powerup_Invincibility`: Golden shield with particles

### 5.4. UI Elements:

- Speed gauge showing current km/h (prominent display)
- Distance counter with km markers
- Lives remaining indicator
- Active powerup status with timers
- Score display with multipliers

### 5.5. Visual Effects:

- High-speed motion blur and speed lines
- Road transition morphing animations
- Powerup collection and activation effects
- Destruction and respawn sequences
- Multiple simultaneous powerup auras

---

## Part 6: Audio Design

### 6.1. Engine Audio:

- Progressive engine pitch rising with speed (300-500 km/h range)
- Doppler effects for passing traffic
- Turbo boost audio during Speed Boost powerup

### 6.2. Game Audio:

- High-intensity background music matching speed
- Collision and destruction sound effects
- Powerup collection and activation audio
- Lane change and traffic interaction sounds

---

## Part 7: Gameplay Balance

### 7.1. High-Speed Challenge:

- **Reaction Time:** 300+ km/h requires split-second decisions
- **Risk/Reward:** Powerups positioned in dangerous traffic gaps
- **Progressive Intensity:** Constant escalation until destruction

### 7.2. Replayability Features:

- **Personal Records:** Best distance, highest speed achieved
- **Score Competition:** High score with powerup combo strategies
- **Mastery Goals:** Surviving each difficulty phase
- **Consistency Challenge:** Average performance over multiple runs

---

This condensed design focuses on **intense high-speed gameplay** with **stackable powerup strategy**, **classic Road Fighter enemy behavior**, and **pure 2D top-down arcade action** optimized for immediate thrills and long-term mastery.
