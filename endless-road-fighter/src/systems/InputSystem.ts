import { INPUT_KEYS } from "../utils/Constants";
import { type InputState } from "../utils/Types";

export class InputSystem {
  private inputState: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    restart: false,
  };

  private keyPressed: Set<string> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard event listeners
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));

    // Prevent default behavior for game keys
    window.addEventListener("keydown", (event) => {
      if (this.isGameKey(event.code)) {
        event.preventDefault();
      }
    });
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.keyPressed.add(event.code);
    this.updateInputState();
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keyPressed.delete(event.code);
    this.updateInputState();
  }

  private updateInputState(): void {
    this.inputState.left = INPUT_KEYS.LEFT.some((key) =>
      this.keyPressed.has(key)
    );
    this.inputState.right = INPUT_KEYS.RIGHT.some((key) =>
      this.keyPressed.has(key)
    );
    this.inputState.up = INPUT_KEYS.UP.some((key) => this.keyPressed.has(key));
    this.inputState.down = INPUT_KEYS.DOWN.some((key) =>
      this.keyPressed.has(key)
    );
    this.inputState.restart = INPUT_KEYS.RESTART.some((key) =>
      this.keyPressed.has(key)
    );
  }

  private isGameKey(code: string): boolean {
    return [
      ...INPUT_KEYS.LEFT,
      ...INPUT_KEYS.RIGHT,
      ...INPUT_KEYS.UP,
      ...INPUT_KEYS.DOWN,
      ...INPUT_KEYS.RESTART,
    ].includes(code);
  }

  public getInputState(): InputState {
    return { ...this.inputState };
  }

  public dispose(): void {
    window.removeEventListener("keydown", this.onKeyDown.bind(this));
    window.removeEventListener("keyup", this.onKeyUp.bind(this));
  }
}
