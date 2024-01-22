import { updateDebug } from "./utils/updateDebug";
import { globalState } from "./utils/globalState";

export class Scene {
  gl: WebGL2RenderingContext | null = null;

  constructor() {
    if (globalState.canvasEl) {
      this.gl = globalState.canvasEl.getContext("webgl2");
    }
    if (!this.gl) throw new Error("WebGL2 not supported");

    this.gl.clearColor(1, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  update() {}

  onResize() {
    updateDebug(globalState.stageSize.value.join(" x "));
  }

  onPixelRatioChange() {}

  destroy() {}
}
