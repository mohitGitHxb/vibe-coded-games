import * as THREE from "three";
import type { InputState } from "../types";

export class InputSystem {
  private inputState: InputState = {
    keys: {},
    mousePosition: new THREE.Vector2(),
    isMouseDown: false,
  };

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Keyboard events
    window.addEventListener("keydown", (event) => {
      this.inputState.keys[event.code.toLowerCase()] = true;
    });

    window.addEventListener("keyup", (event) => {
      this.inputState.keys[event.code.toLowerCase()] = false;
    });

    // Mouse events
    window.addEventListener("mousemove", (event) => {
      this.inputState.mousePosition.x =
        (event.clientX / window.innerWidth) * 2 - 1;
      this.inputState.mousePosition.y =
        -(event.clientY / window.innerHeight) * 2 + 1;
    });

    window.addEventListener("mousedown", (event) => {
      if (event.button === 0) {
        this.inputState.isMouseDown = true;
      }
    });

    window.addEventListener("mouseup", (event) => {
      if (event.button === 0) {
        this.inputState.isMouseDown = false;
      }
    });
  }

  getInputState(): InputState {
    return this.inputState;
  }

  isKeyPressed(key: string): boolean {
    return !!this.inputState.keys[key.toLowerCase()];
  }
}
