/**
 * HUDManager - Manages all game UI elements and updates
 * Handles score, health, power-ups, messages, and game over screen
 */

export interface GameStats {
  score: number;
  asteroidsDestroyed: number;
  health: number;
  maxHealth: number;
  level: number;
  gameTime: number;
}

export interface PowerUpStatus {
  rapidFire: number; // Time remaining in seconds (0 = inactive)
  shield: number;
  damage: number;
}

export class HUDManager {
  // UI Element references
  private scoreElement!: HTMLElement;
  private destroyedElement!: HTMLElement;
  private levelElement!: HTMLElement;
  private gameTimeElement!: HTMLElement;
  private healthBarElement!: HTMLElement;
  private healthCurrentElement!: HTMLElement;
  private healthMaxElement!: HTMLElement;

  // Power-up elements
  private rapidFireElement!: HTMLElement;
  private rapidFireTimerElement!: HTMLElement;
  private shieldElement!: HTMLElement;
  private shieldTimerElement!: HTMLElement;
  private damageElement!: HTMLElement;
  private damageTimerElement!: HTMLElement;

  // Message and game over elements
  private messageContainer!: HTMLElement;
  private gameOverScreen!: HTMLElement;
  private finalScoreElement!: HTMLElement;
  private finalDestroyedElement!: HTMLElement;
  private finalTimeElement!: HTMLElement;
  private restartBtnElement!: HTMLElement;

  // Game start time for time tracking
  private gameStartTime: number;

  constructor() {
    this.gameStartTime = performance.now();
    this.initializeElements();
    this.setupEventListeners();
  }

  /**
   * Initialize all DOM element references
   */
  private initializeElements(): void {
    // Main stats
    this.scoreElement = this.getElement("score");
    this.destroyedElement = this.getElement("destroyed");
    this.levelElement = this.getElement("level");
    this.gameTimeElement = this.getElement("gameTime");

    // Health bar
    this.healthBarElement = this.getElement("healthBar");
    this.healthCurrentElement = this.getElement("healthCurrent");
    this.healthMaxElement = this.getElement("healthMax");

    // Power-up status
    this.rapidFireElement = this.getElement("powerupRapidFire");
    this.rapidFireTimerElement = this.getElement("rapidFireTimer");
    this.shieldElement = this.getElement("powerupShield");
    this.shieldTimerElement = this.getElement("shieldTimer");
    this.damageElement = this.getElement("powerupDamage");
    this.damageTimerElement = this.getElement("damageTimer");

    // Messages and game over
    this.messageContainer = this.getElement("messageContainer");
    this.gameOverScreen = this.getElement("gameOverScreen");
    this.finalScoreElement = this.getElement("finalScore");
    this.finalDestroyedElement = this.getElement("finalDestroyed");
    this.finalTimeElement = this.getElement("finalTime");
    this.restartBtnElement = this.getElement("restartBtn");
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.restartBtnElement.addEventListener("click", () => {
      this.hideGameOver();
      // Dispatch custom event for game restart
      window.dispatchEvent(new CustomEvent("gameRestart"));
    });
  }

  /**
   * Helper to get DOM element with error handling
   */
  private getElement(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`HUD element with id '${id}' not found`);
    }
    return element;
  }

  /**
   * Update all game statistics on the HUD
   */
  public updateStats(stats: GameStats): void {
    this.scoreElement.textContent = stats.score.toLocaleString();
    this.destroyedElement.textContent = stats.asteroidsDestroyed.toString();
    this.levelElement.textContent = stats.level.toString();

    // Update game time
    const gameTime = (performance.now() - this.gameStartTime) / 1000;
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);
    this.gameTimeElement.textContent = `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    // Update health bar
    this.updateHealthBar(stats.health, stats.maxHealth);
  }

  /**
   * Update health bar visual and text
   */
  private updateHealthBar(current: number, max: number): void {
    const percentage = Math.max(0, (current / max) * 100);
    this.healthBarElement.style.width = `${percentage}%`;
    this.healthCurrentElement.textContent = current.toString();
    this.healthMaxElement.textContent = max.toString();

    // Change health bar color based on percentage
    if (percentage <= 25) {
      this.healthBarElement.style.background =
        "linear-gradient(90deg, #ff3300, #ff6600)";
      this.healthBarElement.style.boxShadow = "0 0 10px rgba(255, 51, 0, 0.8)";
    } else if (percentage <= 50) {
      this.healthBarElement.style.background =
        "linear-gradient(90deg, #ff6600, #ffff00)";
      this.healthBarElement.style.boxShadow = "0 0 10px rgba(255, 255, 0, 0.5)";
    } else if (percentage <= 75) {
      this.healthBarElement.style.background =
        "linear-gradient(90deg, #ffff00, #66ff00)";
      this.healthBarElement.style.boxShadow = "0 0 10px rgba(102, 255, 0, 0.5)";
    } else {
      this.healthBarElement.style.background =
        "linear-gradient(90deg, #00ff00, #66ff00)";
      this.healthBarElement.style.boxShadow = "0 0 10px rgba(0, 255, 0, 0.5)";
    }
  }

  /**
   * Update power-up status displays
   */
  public updatePowerUps(status: PowerUpStatus): void {
    this.updatePowerUp(
      this.rapidFireElement,
      this.rapidFireTimerElement,
      status.rapidFire
    );
    this.updatePowerUp(
      this.shieldElement,
      this.shieldTimerElement,
      status.shield
    );
    this.updatePowerUp(
      this.damageElement,
      this.damageTimerElement,
      status.damage
    );
  }

  /**
   * Update individual power-up display
   */
  private updatePowerUp(
    element: HTMLElement,
    timerElement: HTMLElement,
    timeRemaining: number
  ): void {
    if (timeRemaining > 0) {
      element.style.display = "flex";
      timerElement.textContent = Math.ceil(timeRemaining).toString();
    } else {
      element.style.display = "none";
    }
  }

  /**
   * Show a temporary message on screen
   */
  public showMessage(message: string, duration: number = 3000): void {
    const messageElement = document.createElement("div");
    messageElement.className = "game-message";
    messageElement.textContent = message;

    this.messageContainer.appendChild(messageElement);

    // Remove message after duration
    setTimeout(() => {
      if (messageElement.parentNode) {
        this.messageContainer.removeChild(messageElement);
      }
    }, duration);
  }

  /**
   * Show game over screen with final stats
   */
  public showGameOver(stats: GameStats): void {
    const gameTime = (performance.now() - this.gameStartTime) / 1000;
    const minutes = Math.floor(gameTime / 60);
    const seconds = Math.floor(gameTime % 60);

    this.finalScoreElement.textContent = stats.score.toLocaleString();
    this.finalDestroyedElement.textContent =
      stats.asteroidsDestroyed.toString();
    this.finalTimeElement.textContent = `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    this.gameOverScreen.style.display = "flex";
  }

  /**
   * Hide game over screen
   */
  public hideGameOver(): void {
    this.gameOverScreen.style.display = "none";
  }

  /**
   * Reset HUD for new game
   */
  public resetHUD(): void {
    this.gameStartTime = performance.now();
    this.hideGameOver();

    // Clear messages
    this.messageContainer.innerHTML = "";

    // Reset power-ups
    this.updatePowerUps({
      rapidFire: 0,
      shield: 0,
      damage: 0,
    });

    // Reset stats
    this.updateStats({
      score: 0,
      asteroidsDestroyed: 0,
      health: 100,
      maxHealth: 100,
      level: 1,
      gameTime: 0,
    });
  }

  /**
   * Show power-up collection message
   */
  public showPowerUpMessage(type: string, points: number): void {
    const messages = {
      health: `💚 Health Restored! +${points} points`,
      rapidFire: `🔥 Rapid Fire Activated! +${points} points`,
      shield: `🛡️ Shield Activated! +${points} points`,
      multiShot: `🎯 Multi-Shot Activated! +${points} points`,
      rare: `🌟 Rare Power-Up! +${points} points`,
    };

    const message =
      messages[type as keyof typeof messages] ||
      `⚡ Power-Up Collected! +${points} points`;
    this.showMessage(message, 2000);
  }

  /**
   * Show level up message
   */
  public showLevelUp(level: number): void {
    this.showMessage(`🔥 Level ${level} Reached! Difficulty Increased!`, 3000);
  }

  /**
   * Show asteroid destruction message
   */
  public showAsteroidDestroyed(type: string, points: number): void {
    const emojis = { small: "💥", medium: "💥💥", large: "💥💥💥" };
    const emoji = emojis[type as keyof typeof emojis] || "💥";
    this.showMessage(`${emoji} +${points} points`, 1500);
  }
}
