export class GameUI {
  private hudElement: HTMLElement;
  private healthBar: HTMLElement;
  private healthText: HTMLElement;
  private ammoText: HTMLElement;
  private scoreText: HTMLElement;
  private timerText: HTMLElement;
  private enemyCountText: HTMLElement;
  private crosshair: HTMLElement;
  private minimap: HTMLCanvasElement;
  private minimapCtx: CanvasRenderingContext2D;
  private reloadIndicator: HTMLElement;
  private damageOverlay: HTMLElement;

  constructor() {
    this.createHUD();
    this.createCrosshair();
    this.createMinimap();
    this.createDamageOverlay();
  }

  private createHUD(): void {
    // Main HUD container
    this.hudElement = document.createElement("div");
    this.hudElement.id = "game-hud";
    this.hudElement.innerHTML = `
      <style>
        #game-hud {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          font-family: 'Courier New', monospace;
          z-index: 100;
        }
        
        .hud-panel {
          background: rgba(0, 0, 0, 0.7);
          border: 2px solid #00ff00;
          border-radius: 5px;
          padding: 10px;
          margin: 5px;
        }
        
        .top-left {
          position: absolute;
          top: 20px;
          left: 20px;
          color: #00ff00;
        }
        
        .top-right {
          position: absolute;
          top: 20px;
          right: 20px;
          color: #00ff00;
          text-align: right;
        }
        
        .bottom-left {
          position: absolute;
          bottom: 20px;
          left: 20px;
          color: #00ff00;
        }
        
        .bottom-right {
          position: absolute;
          bottom: 20px;
          right: 20px;
          color: #00ff00;
          text-align: right;
        }
        
        .health-container {
          margin-bottom: 10px;
        }
        
        .health-bar-bg {
          width: 200px;
          height: 20px;
          background: #333;
          border: 1px solid #00ff00;
          position: relative;
        }
        
        .health-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #ff0000, #ffff00, #00ff00);
          transition: width 0.3s ease;
          width: 100%;
        }
        
        .health-text {
          position: absolute;
          top: 2px;
          left: 50%;
          transform: translateX(-50%);
          color: white;
          font-weight: bold;
          font-size: 12px;
          text-shadow: 1px 1px 2px black;
        }
        
        .ammo-display {
          font-size: 24px;
          font-weight: bold;
          text-shadow: 2px 2px 4px black;
          margin-bottom: 10px;
        }
        
        .score-display {
          font-size: 18px;
          margin-bottom: 5px;
        }
        
        .timer-display {
          font-size: 16px;
          margin-bottom: 5px;
        }
        
        .enemy-count {
          font-size: 16px;
          color: #ff4444;
        }
        
        .reload-indicator {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: rgba(255, 255, 0, 0.9);
          color: black;
          padding: 20px;
          border-radius: 10px;
          font-size: 24px;
          font-weight: bold;
          display: none;
          animation: pulse 0.5s infinite alternate;
        }
        
        @keyframes pulse {
          from { transform: translate(-50%, -50%) scale(1); }
          to { transform: translate(-50%, -50%) scale(1.1); }
        }
        
        .damage-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, transparent 60%, rgba(255, 0, 0, 0.3) 100%);
          opacity: 0;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }
        
        .minimap {
          border: 2px solid #00ff00;
          background: rgba(0, 0, 0, 0.8);
        }
      </style>
      
      <!-- Top Left - Health -->
      <div class="hud-panel top-left">
        <div class="health-container">
          <div>HEALTH</div>
          <div class="health-bar-bg">
            <div class="health-bar-fill" id="health-bar"></div>
            <div class="health-text" id="health-text">100 / 100</div>
          </div>
        </div>
      </div>
      
      <!-- Top Right - Game Stats -->
      <div class="hud-panel top-right">
        <div class="score-display" id="score-text">SCORE: 0</div>
        <div class="timer-display" id="timer-text">TIME: 00:00</div>
        <div class="enemy-count" id="enemy-count">ENEMIES: 0</div>
      </div>
      
      <!-- Bottom Left - Minimap -->
      <div class="hud-panel bottom-left">
        <div>RADAR</div>
        <canvas class="minimap" id="minimap" width="150" height="150"></canvas>
      </div>
      
      <!-- Bottom Right - Ammo -->
      <div class="hud-panel bottom-right">
        <div class="ammo-display" id="ammo-text">30 / 120</div>
        <div>WEAPON: ASSAULT RIFLE</div>
      </div>
      
      <!-- Center - Reload Indicator -->
      <div class="reload-indicator" id="reload-indicator">RELOADING...</div>
      
      <!-- Damage Overlay -->
      <div class="damage-overlay" id="damage-overlay"></div>
    `;

    document.body.appendChild(this.hudElement);

    // Get references to elements
    this.healthBar = document.getElementById("health-bar")!;
    this.healthText = document.getElementById("health-text")!;
    this.ammoText = document.getElementById("ammo-text")!;
    this.scoreText = document.getElementById("score-text")!;
    this.timerText = document.getElementById("timer-text")!;
    this.enemyCountText = document.getElementById("enemy-count")!;
    this.reloadIndicator = document.getElementById("reload-indicator")!;
    this.damageOverlay = document.getElementById("damage-overlay")!;
  }

  private createCrosshair(): void {
    this.crosshair = document.createElement("div");
    this.crosshair.id = "crosshair";
    this.crosshair.innerHTML = `
      <style>
        #crosshair {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 20px;
          height: 20px;
          pointer-events: none;
          z-index: 1000;
        }
        
        #crosshair::before,
        #crosshair::after {
          content: '';
          position: absolute;
          background: #00ff00;
          box-shadow: 0 0 5px #00ff00;
        }
        
        #crosshair::before {
          top: 50%;
          left: 8px;
          width: 4px;
          height: 2px;
          transform: translateY(-50%);
        }
        
        #crosshair::after {
          left: 50%;
          top: 8px;
          width: 2px;
          height: 4px;
          transform: translateX(-50%);
        }
      </style>
    `;
    document.body.appendChild(this.crosshair);
  }

  private createMinimap(): void {
    this.minimap = document.getElementById("minimap") as HTMLCanvasElement;
    this.minimapCtx = this.minimap.getContext("2d")!;
  }

  private createDamageOverlay(): void {
    // Already created in HUD HTML
  }

  public updateHealth(current: number, max: number): void {
    const percentage = (current / max) * 100;
    this.healthBar.style.width = `${percentage}%`;
    this.healthText.textContent = `${current} / ${max}`;

    // Change color based on health
    if (percentage > 60) {
      this.healthBar.style.background =
        "linear-gradient(90deg, #00ff00, #00ff00)";
    } else if (percentage > 30) {
      this.healthBar.style.background =
        "linear-gradient(90deg, #ffff00, #ffff00)";
    } else {
      this.healthBar.style.background =
        "linear-gradient(90deg, #ff0000, #ff0000)";
    }
  }

  public updateAmmo(current: number, max: number): void {
    this.ammoText.textContent = `${current} / ${max}`;

    // Change color when low on ammo
    if (current <= 5) {
      this.ammoText.style.color = "#ff4444";
    } else {
      this.ammoText.style.color = "#00ff00";
    }
  }

  public updateScore(score: number): void {
    this.scoreText.textContent = `SCORE: ${score.toLocaleString()}`;
  }

  public updateTimer(seconds: number): void {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    this.timerText.textContent = `TIME: ${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  public updateEnemyCount(count: number): void {
    this.enemyCountText.textContent = `ENEMIES: ${count}`;

    // Change color based on enemy count
    if (count >= 8) {
      this.enemyCountText.style.color = "#ff0000";
    } else if (count >= 5) {
      this.enemyCountText.style.color = "#ffff00";
    } else {
      this.enemyCountText.style.color = "#00ff00";
    }
  }

  public showReloadIndicator(): void {
    this.reloadIndicator.style.display = "block";
  }

  public hideReloadIndicator(): void {
    this.reloadIndicator.style.display = "none";
  }

  public showDamageEffect(): void {
    this.damageOverlay.style.opacity = "1";
    setTimeout(() => {
      this.damageOverlay.style.opacity = "0";
    }, 200);
  }

  public updateMinimap(
    playerPosition: { x: number; z: number },
    enemyPositions: { x: number; z: number }[],
    arenaSize: number
  ): void {
    const ctx = this.minimapCtx;
    const width = this.minimap.width;
    const height = this.minimap.height;

    // Clear canvas
    ctx.fillStyle = "#001100";
    ctx.fillRect(0, 0, width, height);

    // Draw arena bounds
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, width - 4, height - 4);

    // Convert world coordinates to minimap coordinates
    const worldToMinimap = (worldPos: { x: number; z: number }) => ({
      x: ((worldPos.x + arenaSize / 2) / arenaSize) * (width - 10) + 5,
      y: ((worldPos.z + arenaSize / 2) / arenaSize) * (height - 10) + 5,
    });

    // Draw cover objects
    ctx.fillStyle = "#666666";
    const coverPositions = [
      { x: -8, z: -8 },
      { x: 8, z: -8 },
      { x: -8, z: 8 },
      { x: 8, z: 8 },
    ];

    coverPositions.forEach((cover) => {
      const pos = worldToMinimap(cover);
      ctx.fillRect(pos.x - 3, pos.y - 3, 6, 6);
    });

    // Draw enemies
    ctx.fillStyle = "#ff4444";
    enemyPositions.forEach((enemy) => {
      const pos = worldToMinimap(enemy);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw player
    const playerPos = worldToMinimap(playerPosition);
    ctx.fillStyle = "#00ff00";
    ctx.beginPath();
    ctx.arc(playerPos.x, playerPos.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Player direction indicator
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playerPos.x, playerPos.y);
    ctx.lineTo(playerPos.x, playerPos.y - 8);
    ctx.stroke();
  }

  public showGameOverScreen(stats: {
    survivalTime: number;
    score: number;
    enemiesKilled: number;
  }): void {
    const gameOverDiv = document.createElement("div");
    gameOverDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        font-family: 'Courier New', monospace;
        color: white;
      ">
        <div style="
          background: rgba(0, 0, 0, 0.9);
          border: 3px solid #ff4444;
          border-radius: 15px;
          padding: 40px;
          text-align: center;
          max-width: 500px;
        ">
          <h1 style="
            color: #ff4444;
            margin: 0 0 30px 0;
            font-size: 48px;
            text-shadow: 2px 2px 4px black;
          ">GAME OVER</h1>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #00ff00; margin: 0 0 20px 0;">MISSION STATS</h2>
            <div style="font-size: 18px; line-height: 1.8;">
              <div>🕐 Survival Time: <span style="color: #ffff00;">${Math.floor(
                stats.survivalTime / 60
              )}m ${Math.floor(stats.survivalTime % 60)}s</span></div>
              <div>🎯 Final Score: <span style="color: #ffff00;">${stats.score.toLocaleString()}</span></div>
              <div>💀 Enemies Eliminated: <span style="color: #ffff00;">${
                stats.enemiesKilled
              }</span></div>
              <div>📊 Score per Enemy: <span style="color: #ffff00;">${Math.floor(
                stats.score / Math.max(stats.enemiesKilled, 1)
              )}</span></div>
            </div>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h3 style="color: #00ff00; margin: 0 0 15px 0;">PERFORMANCE RATING</h3>
            <div style="font-size: 24px; color: ${
              stats.survivalTime > 120
                ? "#00ff00"
                : stats.survivalTime > 60
                ? "#ffff00"
                : "#ff4444"
            };">
              ${
                stats.survivalTime > 180
                  ? "⭐⭐⭐ LEGENDARY"
                  : stats.survivalTime > 120
                  ? "⭐⭐ VETERAN"
                  : stats.survivalTime > 60
                  ? "⭐ SOLDIER"
                  : "💀 RECRUIT"
              }
            </div>
          </div>
          
          <button onclick="location.reload()" style="
            padding: 15px 30px;
            font-size: 18px;
            background: linear-gradient(45deg, #00ff00, #004400);
            color: white;
            border: 2px solid #00ff00;
            border-radius: 10px;
            cursor: pointer;
            font-family: inherit;
            font-weight: bold;
            text-shadow: 1px 1px 2px black;
            transition: all 0.3s ease;
          " 
          onmouseover="this.style.background='linear-gradient(45deg, #44ff44, #006600)'"
          onmouseout="this.style.background='linear-gradient(45deg, #00ff00, #004400)'">
            🔄 DEPLOY AGAIN
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(gameOverDiv);
  }

  public cleanup(): void {
    if (this.hudElement.parentNode) {
      this.hudElement.parentNode.removeChild(this.hudElement);
    }
    if (this.crosshair.parentNode) {
      this.crosshair.parentNode.removeChild(this.crosshair);
    }
  }
}
