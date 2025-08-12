/**
 * iOS Debugging Utility
 * Helps identify and fix iOS-specific rendering issues
 */

export class IOSDebugger {
  private static instance: IOSDebugger;

  private constructor() {}

  public static getInstance(): IOSDebugger {
    if (!IOSDebugger.instance) {
      IOSDebugger.instance = new IOSDebugger();
    }
    return IOSDebugger.instance;
  }

  /**
   * Detect if running on iOS device
   */
  public static isIOS(): boolean {
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );
  }

  /**
   * Get iOS-specific information for debugging
   */
  public static getIOSInfo(): any {
    if (!this.isIOS()) {
      return { isIOS: false };
    }

    return {
      isIOS: true,
      userAgent: navigator.userAgent,
      devicePixelRatio: window.devicePixelRatio,
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      webkitVersion: this.getWebKitVersion(),
      safariVersion: this.getSafariVersion(),
    };
  }

  /**
   * Log comprehensive iOS debug information
   */
  public static logIOSDebugInfo(): void {
    if (!this.isIOS()) {
      console.log("🖥️ Not running on iOS");
      return;
    }

    const info = this.getIOSInfo();
    console.log("📱 iOS Debug Information:");
    console.log("  Device Pixel Ratio:", info.devicePixelRatio);
    console.log("  Screen:", `${info.screenWidth}x${info.screenHeight}`);
    console.log("  Viewport:", `${info.viewportWidth}x${info.viewportHeight}`);
    console.log("  WebKit Version:", info.webkitVersion);
    console.log("  Safari Version:", info.safariVersion);
    console.log("  User Agent:", info.userAgent);
  }

  /**
   * Check for common iOS WebGL issues
   */
  public static checkWebGLCompatibility(canvas: HTMLCanvasElement): any {
    if (!this.isIOS()) {
      return { isIOS: false, issues: [] };
    }

    const issues: string[] = [];

    try {
      // Check WebGL context
      const gl =
        canvas.getContext("webgl") ||
        (canvas.getContext("experimental-webgl") as WebGLRenderingContext);
      if (!gl || !(gl instanceof WebGLRenderingContext)) {
        issues.push("WebGL context not available");
        return { isIOS: true, issues };
      }

      // Check for common iOS WebGL limitations
      const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
      if (maxTextureSize < 2048) {
        issues.push(`Low max texture size: ${maxTextureSize}`);
      }

      const maxViewportDims = gl.getParameter(
        gl.MAX_VIEWPORT_DIMS
      ) as Int32Array;
      console.log("📱 iOS WebGL Info:");
      console.log("  Max Texture Size:", maxTextureSize);
      console.log("  Max Viewport:", maxViewportDims);

      // Check for white patch indicators
      const clearColor = gl.getParameter(gl.COLOR_CLEAR_VALUE) as Float32Array;
      if (clearColor[0] === 1 && clearColor[1] === 1 && clearColor[2] === 1) {
        issues.push("Clear color is white - potential white patch cause");
      }

      return { isIOS: true, issues, maxTextureSize, maxViewportDims };
    } catch (error) {
      issues.push(`WebGL check failed: ${error}`);
      return { isIOS: true, issues };
    }
  }

  /**
   * Apply iOS-specific fixes to prevent white patches
   */
  public static applyIOSFixes(canvas: HTMLCanvasElement): void {
    if (!this.isIOS()) return;

    console.log("🔧 Applying iOS-specific fixes...");

    // Force background color
    canvas.style.backgroundColor = "#000811";

    // Prevent iOS zoom and interaction issues
    canvas.style.touchAction = "none";
    (canvas.style as any).webkitTouchCallout = "none";
    (canvas.style as any).webkitUserSelect = "none";

    // Force hardware acceleration
    canvas.style.transform = "translateZ(0)";
    (canvas.style as any).webkitTransform = "translateZ(0)";

    // Prevent iOS rendering glitches
    canvas.style.backfaceVisibility = "hidden";
    (canvas.style as any).webkitBackfaceVisibility = "hidden";

    // Force immediate layout
    canvas.offsetHeight;

    console.log("✅ iOS fixes applied");
  }

  private static getWebKitVersion(): string {
    const match = navigator.userAgent.match(/WebKit\/(\d+)/);
    return match ? match[1] : "unknown";
  }

  private static getSafariVersion(): string {
    const match = navigator.userAgent.match(/Version\/([^\s]+)/);
    return match ? match[1] : "unknown";
  }
}
