import { globalState } from "./utils/globalState";
import { constants } from "./utils/constants";
import { debounce } from "./utils/debounce";
import { Scene } from "./Scene";

export class App {
  _rafId: number | null = null;
  _isResumed = true;
  _lastFrameTime: number | null = null;

  _scene = new Scene();

  constructor() {
    this._onResize();
    this.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this._addListeners();
    this._resumeAppFrame();
  }

  _onResizeDebounced = debounce(() => this._onResize(), 300);

  _onResize() {
    if (!globalState.canvasEl) return;
    const stageX = globalState.canvasEl.clientWidth;
    const stageY = globalState.canvasEl.clientHeight;

    globalState.stageSize.value = [stageX, stageY];

    this._scene.onResize();
  }

  setPixelRatio(pixelRatio: number) {
    globalState.pixelRatio.value = pixelRatio;

    this._scene.onPixelRatioChange();
  }

  _onVisibilityChange = () => {
    if (document.hidden) {
      this._stopAppFrame();
    } else {
      this._resumeAppFrame();
    }
  };

  _addListeners() {
    window.addEventListener("resize", this._onResizeDebounced);
    window.addEventListener("visibilitychange", this._onVisibilityChange);
  }

  _resumeAppFrame() {
    this._isResumed = true;
    if (!this._rafId) {
      this._rafId = window.requestAnimationFrame(this._renderOnFrame);
    }
  }

  _renderOnFrame = (time: number) => {
    this._rafId = window.requestAnimationFrame(this._renderOnFrame);

    if (this._isResumed || !this._lastFrameTime) {
      this._lastFrameTime = window.performance.now();
      this._isResumed = false;
      return;
    }

    const delta = time - this._lastFrameTime;
    const slowDownFactor = delta / constants.DT_FPS;
    globalState.slowDownFactor.value = slowDownFactor;
    globalState.uTime.value = time * 0.001;

    this._lastFrameTime = time;

    this._scene.update();
  };

  _stopAppFrame() {
    if (this._rafId) {
      window.cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }
}
