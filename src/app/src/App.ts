import { globalState } from "./utils/globalState";
import { constants } from "./utils/constants";
import { debounce } from "./utils/debounce";
import { Scene } from "./Scene";

export class App {
  private rafId: number | null = null;
  private isResumed = true;
  private lastFrameTime: number | null = null;
  private scene = new Scene();

  constructor() {
    this.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.addListeners();
    this.resumeAppFrame();
    this.onResize();
  }

  private onResizeDebounced = debounce(() => this.onResize(), 300);

  private onResize() {
    if (!globalState.canvasEl) return;
    const bounds = globalState.canvasEl.getBoundingClientRect();
    const stageX = bounds.width;
    const stageY = bounds.height;
    globalState.stageSize.value = [stageX, stageY];

    this.scene.onResize();
  }

  private setPixelRatio(pixelRatio: number) {
    globalState.pixelRatio.value = pixelRatio;
  }

  private onVisibilityChange = () => {
    if (document.hidden) {
      this.stopAppFrame();
    } else {
      this.resumeAppFrame();
    }
  };

  private addListeners() {
    window.addEventListener("resize", this.onResizeDebounced);
    window.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  private resumeAppFrame() {
    this.isResumed = true;
    if (!this.rafId) {
      this.rafId = window.requestAnimationFrame(this.renderOnFrame);
    }
  }

  private renderOnFrame = (time: number) => {
    this.rafId = window.requestAnimationFrame(this.renderOnFrame);

    if (this.isResumed || !this.lastFrameTime) {
      this.lastFrameTime = window.performance.now();
      this.isResumed = false;
      return;
    }

    const delta = time - this.lastFrameTime;
    const slowDownFactor = delta / constants.DT_FPS;
    globalState.slowDownFactor.value = slowDownFactor;
    globalState.uTime.value = time * 0.001;

    this.lastFrameTime = time;

    this.scene.update();
  };

  private stopAppFrame() {
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  destroy() {
    this.stopAppFrame();
    window.removeEventListener("resize", this.onResizeDebounced);
    window.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.scene.destroy();
  }
}
