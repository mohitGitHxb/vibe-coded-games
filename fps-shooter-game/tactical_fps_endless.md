# COMBAT ZONE - Simplified FPS Shooter Requirements Document

---

## Part 1: High-Level Vision

### 1.1. Game Concept & Elevator Pitch:
A fast-paced first-person shooter where players survive waves of enemy bots in a small arena. Quick 3-5 minute sessions with immediate action, simple mechanics, and escalating intensity. Pure arcade-style FPS fun without complex systems.

### 1.2. Genre:
- **Primary:** First-Person Shooter / Quick Survival
- **Secondary:** Arcade Action, Score Attack

### 1.3. Core Gameplay Loop:
1. Player spawns with weapon in small arena
2. Enemy bots spawn continuously from edges
3. Shoot enemies while using basic cover
4. Survive as long as possible (typically 3-5 minutes)
5. Game becomes impossible - death is inevitable

---

## Part 2: Controls & Camera

### 2.1. Player Controls:
- **Movement:** WASD (no running/crouching)
- **Mouse:** Look and aim
- **Left Click:** Shoot (full-auto)
- **Right Click:** Aim down sights (optional)
- **R:** Reload
- **Space:** Jump (basic)

### 2.2. Camera:
- **Type:** Standard FPS first-person view
- **Behavior:** Simple mouse look, no camera shake or effects

---

## Part 3: Core Mechanics

### 3.1. Player Stats:
- **Health:** 100 HP (no regeneration)
- **Movement:** Single speed (150 units/second)
- **Weapon:** Assault rifle only

### 3.2. Weapon System:
- **Damage:** 50 per shot (2 shots kill most enemies)
- **Magazine:** 30 rounds
- **Reload Time:** 2 seconds
- **Ammunition:** Unlimited (infinite magazines)
- **Accuracy:** Perfect when standing still, spreads when moving

### 3.3. Arena Design:
- **Size:** Small 40×40 meter square
- **Walls:** Simple barriers around perimeter
- **Cover:** 4-6 destructible boxes/barriers in center
- **Layout:** Open with minimal complexity

### 3.4. Enemy System:

#### Single Enemy Type - Basic Soldier:
- **Health:** 100 HP (2 shots to kill)
- **Weapon:** Rifle (25 damage per shot)
- **Speed:** 120 units/second (slower than player)
- **AI:** Simple - move toward player, shoot when in line of sight
- **Accuracy:** 60% hit chance, shoots every 1.5 seconds

#### Spawn System:
- **Spawn Rate:**
  - **0-1 minute:** 1 enemy every 4 seconds
  - **1-2 minutes:** 1 enemy every 3 seconds
  - **2-3 minutes:** 1 enemy every 2 seconds
  - **3+ minutes:** 1 enemy every 1 second (chaos mode)
- **Maximum Active:** 8 enemies on field simultaneously
- **Spawn Points:** 4 corners of arena
- **Goal:** Become overwhelming by 4-5 minutes

### 3.5. Health System:
- **No Health Regeneration:** Damage is permanent
- **Health Packs:** Rare drops from enemies (+50 HP)
- **Drop Rate:** 10% chance per enemy killed
- **Maximum Health:** 100 HP (no overheal)

### 3.6. Game Duration:
- **Target Session:** 3-5 minutes typical survival
- **Expert Players:** May reach 6-8 minutes
- **Inevitable End:** Spawn rate ensures eventual defeat
- **Quick Restart:** Immediate replay with single button

### 3.7. Scoring:
- **Enemy Kill:** 100 points each
- **Survival Time:** 10 points per second
- **Accuracy Bonus:** +50% if accuracy > 70%
- **Final Score:** Kills × time survived × accuracy bonus

---

## Part 4: Technical Specs

### 4.1. Technology:
- **Rendering:** Three.js (simple 3D FPS)
- **Physics:** Cannon-es (basic collision)
- **Target:** 60 FPS, simple graphics

### 4.2. Performance:
- **Low Complexity:** Maximum 8 enemies, minimal effects
- **Fast Loading:** Under 3 seconds to start playing
- **Instant Restart:** No loading between attempts

---

## Part 5: Assets (Simplified)

### 5.1. Player Assets:
- `Player_Weapon`: First-person assault rifle
- `Muzzle_Flash`: Simple firing effect

### 5.2. Enemy Assets:
- `Enemy_Soldier`: Basic bot character with rifle
- `Enemy_Death`: Simple elimination effect

### 5.3. Environment:
- `Arena_Floor`: Textured ground
- `Arena_Walls`: Simple barrier walls
- `Cover_Box`: Destructible cover objects (2-3 variants)
- `Health_Pack`: Green health pickup

### 5.4. UI:
- `Health_Bar`: Red health indicator
- `Ammo_Counter`: Current magazine ammo
- `Score_Display`: Points and survival time
- `Game_Over`: Final score and restart button

### 5.5. Effects:
- `Bullet_Impact`: Simple hit sparks
- `Blood_Effect`: Basic enemy hit feedback
- `Destruction`: Cover breaking particles

---

## Part 6: Audio (Basic)

### 6.1. Essential Sounds:
- `Rifle_Fire`: Player weapon shooting
- `Enemy_Fire`: Incoming bullet audio
- `Enemy_Hit`: Damage confirmation
- `Enemy_Death`: Kill confirmation
- `Health_Pickup`: Health pack collection
- `Reload_Sound`: Magazine change
- `Game_Over`: Death sound

---

## Part 7: Gameplay Balance

### 7.1. Session Structure:
- **0-60 seconds:** Learning and warm-up
- **60-120 seconds:** Steady challenge
- **120-180 seconds:** Increasing pressure
- **180+ seconds:** Overwhelming odds

### 7.2. Difficulty Curve:
- **Linear Escalation:** Spawn rate increases predictably
- **No Complexity:** Same enemy type throughout
- **Pure Survival:** Focus on shooting and positioning only

### 7.3. Replayability:
- **High Score:** Beat personal best
- **Accuracy Challenge:** Achieve high accuracy rating
- **Time Goals:** Survive specific time milestones
- **Quick Sessions:** Perfect for short gaming breaks

### 7.4. Success Metrics:
- **Beginner Goal:** Survive 2 minutes
- **Average Goal:** Survive 3 minutes
- **Good Goal:** Survive 4 minutes
- **Expert Goal:** Survive 5+ minutes

---

This simplified design focuses on **immediate action**, **short sessions**, and **straightforward mechanics** while maintaining the core FPS experience with escalating challenge that ensures games end within 3-5 minutes for most players.