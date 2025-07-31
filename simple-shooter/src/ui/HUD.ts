import { GAME_CONFIG } from "../utils/Constants";

export class HUD {
  private hudElement!: HTMLDivElement;
  private healthBar!: HTMLDivElement;
  private healthFill!: HTMLDivElement;
  private healthText!: HTMLSpanElement;
  private scoreText!: HTMLSpanElement;
  private waveText!: HTMLSpanElement;
  private waveStatusText!: HTMLSpanElement;
  private enemyCountText!: HTMLSpanElement;
  private score: number = 0;
  private currentWave: number = 1;

  constructor() {
    this.createHUD();
  }

  private createHUD(): void {
    // Main HUD container
    this.hudElement = document.createElement("div");
    this.hudElement.className = "game-hud";
    this.hudElement.innerHTML = `
      <div class="hud-top-left">
        <div class="health-container">
          <div class="health-bar">
            <div class="health-fill"></div>
          </div>
          <span class="health-text">100 / 100</span>
        </div>
        <div class="score-container">
          <span class="score-label">Score:</span>
          <span class="score-value">0</span>
        </div>
        <div class="wave-container">
          <span class="wave-label">Wave:</span>
          <span class="wave-value">1</span>
        </div>
        <div class="wave-status">
          <span class="wave-status-text">Preparing...</span>
        </div>
        <div class="enemy-count">
          <span class="enemy-count-text">Enemies: 0</span>
        </div>
      </div>
      <div class="hud-top-right">
        <div class="wave-progress">
          <div class="next-wave-timer" style="display: none;">
            <span class="timer-label">Next Wave:</span>
            <span class="timer-value">3.0s</span>
          </div>
        </div>
      </div>
      <div class="hud-center">
        <div class="crosshair"></div>
      </div>
    `;

    // Get references to elements
    this.healthBar = this.hudElement.querySelector(
      ".health-bar"
    ) as HTMLDivElement;
    this.healthFill = this.hudElement.querySelector(
      ".health-fill"
    ) as HTMLDivElement;
    this.healthText = this.hudElement.querySelector(
      ".health-text"
    ) as HTMLSpanElement;
    this.scoreText = this.hudElement.querySelector(
      ".score-value"
    ) as HTMLSpanElement;
    this.waveText = this.hudElement.querySelector(
      ".wave-value"
    ) as HTMLSpanElement;
    this.waveStatusText = this.hudElement.querySelector(
      ".wave-status-text"
    ) as HTMLSpanElement;
    this.enemyCountText = this.hudElement.querySelector(
      ".enemy-count-text"
    ) as HTMLSpanElement;

    document.body.appendChild(this.hudElement);
  }

  updateHealth(currentHealth: number, maxHealth: number): void {
    const healthPercent = (currentHealth / maxHealth) * 100;
    this.healthFill.style.width = `${healthPercent}%`;
    this.healthText.textContent = `${currentHealth} / ${maxHealth}`;

    // Change color based on health percentage
    if (healthPercent > 60) {
      this.healthFill.style.background =
        "linear-gradient(90deg, #44ff44, #00ff00)";
    } else if (healthPercent > 30) {
      this.healthFill.style.background =
        "linear-gradient(90deg, #ffff44, #ffaa00)";
    } else {
      this.healthFill.style.background =
        "linear-gradient(90deg, #ff4444, #ff0000)";
    }
  }

  updateScore(newScore: number): void {
    this.score = newScore;
    this.scoreText.textContent = this.score.toString();
  }

  addScore(points: number): void {
    this.updateScore(this.score + points);
  }

  updateWave(wave: number): void {
    this.currentWave = wave;
    this.waveText.textContent = wave.toString();
  }

  updateWaveStatus(status: string): void {
    this.waveStatusText.textContent = status;
  }

  updateEnemyCount(count: number): void {
    this.enemyCountText.textContent = `Enemies: ${count}`;
  }

  updateWaveProgress(spawned: number, total: number): void {
    if (spawned < total) {
      this.updateWaveStatus(`Spawning... ${spawned}/${total}`);
    } else {
      this.updateWaveStatus("Eliminate remaining enemies!");
    }
  }

  showNextWaveTimer(timeRemaining: number): void {
    const timerElement = this.hudElement.querySelector(
      ".next-wave-timer"
    ) as HTMLElement;
    const timerValue = this.hudElement.querySelector(
      ".timer-value"
    ) as HTMLElement;

    if (timeRemaining > 0) {
      timerElement.style.display = "block";
      timerValue.textContent = `${timeRemaining.toFixed(1)}s`;
      this.updateWaveStatus("Wave Complete!");
    } else {
      timerElement.style.display = "none";
    }
  }

  showDamageIndicator(): void {
    const indicator = document.createElement("div");
    indicator.className = "damage-indicator";
    this.hudElement.appendChild(indicator);

    // Remove after animation
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 500);
  }

  destroy(): void {
    if (this.hudElement.parentNode) {
      this.hudElement.parentNode.removeChild(this.hudElement);
    }
  }
}
