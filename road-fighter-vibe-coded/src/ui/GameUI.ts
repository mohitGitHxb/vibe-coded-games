export class GameUI {
  private container: HTMLElement;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  public showLevelTransition(level: number): Promise<void> {
    const overlay = this.createOverlay();

    const content = document.createElement("div");
    content.style.cssText = `
      text-align: center;
      color: white;
      font-family: 'Courier New', monospace;
    `;

    const title = document.createElement("h1");
    title.style.cssText = `
      font-size: 64px;
      color: #00ff00;
      margin-bottom: 20px;
      text-shadow: 0 0 20px #00ff00;
      animation: pulse 1s infinite;
    `;
    title.textContent = `LEVEL ${level}`;

    const subtitle = document.createElement("p");
    subtitle.style.cssText = `
      font-size: 32px;
      color: #ffffff;
      margin-bottom: 40px;
    `;
    subtitle.textContent = level === 1 ? "SUBURBAN HIGHWAY" : "CITY EXPRESSWAY";

    const instructions = document.createElement("p");
    instructions.style.cssText = `
      font-size: 24px;
      color: #ffff00;
      margin-bottom: 20px;
    `;
    instructions.textContent =
      level === 1
        ? "Avoid traffic and reach checkpoints in time!"
        : "More aggressive enemies and tighter time limits!";

    const startButton = document.createElement("button");
    startButton.style.cssText = `
      font-size: 28px;
      padding: 15px 30px;
      background: linear-gradient(45deg, #ff0000, #ff6600);
      color: white;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-family: 'Courier New', monospace;
      font-weight: bold;
      box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
      pointer-events: auto;
    `;
    startButton.textContent = "START LEVEL";

    content.appendChild(title);
    content.appendChild(subtitle);
    content.appendChild(instructions);
    content.appendChild(startButton);
    overlay.appendChild(content);

    return new Promise<void>((resolve) => {
      startButton.onclick = () => {
        this.container.removeChild(overlay);
        resolve();
      };
    });
  }

  public showVictoryScreen(score: GameScore): void {
    const overlay = this.createOverlay();

    const content = document.createElement("div");
    content.style.cssText = `
      text-align: center;
      color: white;
      font-family: 'Courier New', monospace;
    `;

    content.innerHTML = `
      <h1 style="font-size: 72px; color: #ffd700; margin-bottom: 30px; text-shadow: 0 0 30px #ffd700; animation: pulse 1s infinite;">
        🏆 VICTORY! 🏆
      </h1>
      <p style="font-size: 36px; color: #00ff00; margin-bottom: 20px;">
        ALL LEVELS COMPLETED!
      </p>
      <div style="font-size: 24px; color: #ffffff; margin: 20px 0;">
        <p>Final Time: ${this.formatTime(score.time)}</p>
        <p>Lives Remaining: ${score.lives}</p>
        <p>Total Collisions: ${score.collisions}</p>
        <p>Power-ups Collected: ${score.powerUpsCollected}</p>
      </div>
      <p style="font-size: 20px; color: #ffff00; margin-top: 40px;">
        You are a true Road Fighter champion!
      </p>
    `;

    overlay.appendChild(content);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (overlay.parentNode) {
        this.container.removeChild(overlay);
      }
    }, 10000);
  }

  private createOverlay(): HTMLElement {
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      pointer-events: none;
    `;

    this.container.appendChild(overlay);
    return overlay;
  }

  private formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  }
}
