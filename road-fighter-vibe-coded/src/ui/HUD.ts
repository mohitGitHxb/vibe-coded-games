export class HUD {
  private container: HTMLElement;
  private timerElement: HTMLElement;
  private livesElement: HTMLElement;
  private checkpointElement: HTMLElement;
  private speedElement: HTMLElement;
  private levelElement: HTMLElement;

  constructor(container: HTMLElement) {
    if (!container) {
      throw new Error("HUD container element is required but was not provided");
    }

    this.container = container;
    console.log("HUD initializing with container:", container);
    this.createHUD();
  }

  private createHUD(): void {
    console.log("Creating HUD elements...");

    // Create HUD container
    const hudContainer = document.createElement("div");
    hudContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      color: white;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
      z-index: 1000;
    `;

    // Timer display (top center)
    this.timerElement = document.createElement("div");
    this.timerElement.style.cssText = `
      position: absolute;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 32px;
      color: #00ff00;
      text-align: center;
    `;
    this.timerElement.textContent = "TIME: 45";
    hudContainer.appendChild(this.timerElement);

    // Level display (top center, below timer)
    this.levelElement = document.createElement("div");
    this.levelElement.style.cssText = `
      position: absolute;
      top: 70px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 20px;
      color: #00ffff;
      text-align: center;
    `;
    this.levelElement.textContent = "LEVEL 1";
    hudContainer.appendChild(this.levelElement);

    // Lives display (top left)
    this.livesElement = document.createElement("div");
    this.livesElement.style.cssText = `
      position: absolute;
      top: 20px;
      left: 20px;
      font-size: 24px;
      color: #ff0000;
    `;
    this.livesElement.textContent = "LIVES: ♥♥♥";
    hudContainer.appendChild(this.livesElement);

    // Current checkpoint (top right)
    this.checkpointElement = document.createElement("div");
    this.checkpointElement.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      font-size: 20px;
      color: #ffff00;
      text-align: right;
    `;
    this.checkpointElement.textContent = "NEXT: CHECKPOINT 1";
    hudContainer.appendChild(this.checkpointElement);

    // Speed display (bottom left)
    this.speedElement = document.createElement("div");
    this.speedElement.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 20px;
      font-size: 20px;
      color: #00ffff;
    `;
    this.speedElement.textContent = "SPEED: 200 KM/H";
    hudContainer.appendChild(this.speedElement);

    // Safely append to container
    try {
      this.container.appendChild(hudContainer);
      console.log("HUD created successfully");
    } catch (error) {
      console.error("Failed to append HUD to container:", error);
      throw error;
    }
  }

  public updateTimer(remainingTime: number): void {
    if (!this.timerElement) return;

    const minutes = Math.floor(remainingTime / 60);
    const seconds = Math.floor(remainingTime % 60);
    const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

    this.timerElement.textContent = `TIME: ${timeString}`;

    // Change color based on remaining time
    if (remainingTime < 10) {
      this.timerElement.style.color = "#ff0000"; // Red when critical
      this.timerElement.style.animation = "blink 0.5s infinite";
    } else if (remainingTime < 20) {
      this.timerElement.style.color = "#ff8800"; // Orange when low
      this.timerElement.style.animation = "none";
    } else {
      this.timerElement.style.color = "#00ff00"; // Green when okay
      this.timerElement.style.animation = "none";
    }
  }

  public updateLives(lives: number): void {
    if (!this.livesElement) return;

    // Add hearts for visual appeal
    const hearts = "♥".repeat(lives) + "♡".repeat(Math.max(0, 3 - lives));
    this.livesElement.textContent = `LIVES: ${hearts}`;
  }

  public updateCheckpoint(checkpointName: string): void {
    if (!this.checkpointElement) return;
    this.checkpointElement.textContent = `NEXT: ${checkpointName}`;
  }

  public updateSpeed(speed: number): void {
    if (!this.speedElement) return;
    const kmh = Math.round(speed * 3.6); // Convert to km/h (roughly)
    this.speedElement.textContent = `SPEED: ${kmh} KM/H`;
  }

  public updateLevel(level: number): void {
    if (!this.levelElement) return;
    this.levelElement.textContent = `LEVEL ${level}`;

    // Change color for Level 2
    if (level === 2) {
      this.levelElement.style.color = "#ff6600"; // Orange for Level 2
    }
  }

  // CENTER MESSAGE (blocking) - only for important messages like Game Over
  public showMessage(message: string, duration: number = 3000): void {
    if (!this.container) return;

    const messageElement = document.createElement("div");
    messageElement.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 48px;
      color: #ffff00;
      text-align: center;
      background: rgba(0,0,0,0.8);
      padding: 20px 40px;
      border-radius: 10px;
      border: 2px solid #ffff00;
      animation: pulse 0.5s ease-in-out;
      z-index: 2000;
      white-space: pre-line;
    `;
    messageElement.textContent = message;

    this.container.appendChild(messageElement);

    setTimeout(() => {
      try {
        if (messageElement.parentNode === this.container) {
          this.container.removeChild(messageElement);
        }
      } catch (error) {
        console.warn("Failed to remove message element:", error);
      }
    }, duration);
  }

  // SIDE MESSAGE (non-blocking) - for power-ups and minor notifications
  public showSideMessage(message: string, duration: number = 2000): void {
    if (!this.container) return;

    const messageElement = document.createElement("div");
    messageElement.style.cssText = `
      position: absolute;
      top: 120px;
      right: 20px;
      font-size: 24px;
      color: #00ff00;
      text-align: right;
      background: rgba(0,0,0,0.7);
      padding: 10px 15px;
      border-radius: 5px;
      border: 1px solid #00ff00;
      z-index: 1500;
      animation: slideInRight 0.3s ease-out;
    `;
    messageElement.textContent = message;

    this.container.appendChild(messageElement);

    // Add slide-in animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      try {
        if (messageElement.parentNode === this.container) {
          // Fade out animation
          messageElement.style.transition = "opacity 0.3s ease-out";
          messageElement.style.opacity = "0";

          setTimeout(() => {
            if (messageElement.parentNode === this.container) {
              this.container.removeChild(messageElement);
            }
          }, 300);
        }
      } catch (error) {
        console.warn("Failed to remove side message element:", error);
      }
    }, duration);
  }
}
