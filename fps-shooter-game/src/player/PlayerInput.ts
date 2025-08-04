export class PlayerInput {
  private keys: Set<string> = new Set();
  private mouseButtons: Set<number> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard events
    document.addEventListener("keydown", (event) => {
      this.keys.add(event.code.toLowerCase());
    });

    document.addEventListener("keyup", (event) => {
      this.keys.delete(event.code.toLowerCase());
    });

    // Mouse events
    document.addEventListener("mousedown", (event) => {
      this.mouseButtons.add(event.button);
    });

    document.addEventListener("mouseup", (event) => {
      this.mouseButtons.delete(event.button);
    });

    // Prevent context menu on right click
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  }

  public isKeyPressed(key: string): boolean {
    return this.keys.has(key.toLowerCase());
  }

  public isMouseButtonPressed(button: number): boolean {
    return this.mouseButtons.has(button);
  }

  public getMovementVector(): { x: number; z: number } {
    let x = 0;
    let z = 0;

    if (this.isKeyPressed("keyw")) z -= 1; // Forward
    if (this.isKeyPressed("keys")) z += 1; // Backward
    if (this.isKeyPressed("keya")) x -= 1; // Left
    if (this.isKeyPressed("keyd")) x += 1; // Right

    // Normalize diagonal movement
    if (x !== 0 && z !== 0) {
      const length = Math.sqrt(x * x + z * z);
      x /= length;
      z /= length;
    }

    return { x, z };
  }

  public isJumping(): boolean {
    return this.isKeyPressed("space");
  }

  public isShooting(): boolean {
    return this.isMouseButtonPressed(0); // Left mouse button
  }

  public isAiming(): boolean {
    return this.isMouseButtonPressed(2); // Right mouse button
  }

  public isReloading(): boolean {
    return this.isKeyPressed("keyr");
  }
}
