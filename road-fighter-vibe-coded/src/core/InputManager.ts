export class InputManager {
  private keys: Set<string> = new Set();
  private steeringInput: number = 0;

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);
    this.updateSteeringInput();
  };

  private onKeyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
    this.updateSteeringInput();
  };

  private updateSteeringInput(): void {
    let steering = 0;

    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) {
      steering -= 1;
    }
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) {
      steering += 1;
    }

    this.steeringInput = steering;
  }

  public getSteeringInput(): number {
    return this.steeringInput;
  }

  public isKeyPressed(keyCode: string): boolean {
    return this.keys.has(keyCode);
  }

  public destroy(): void {
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
  }
}
