import { updateDebug } from "./utils/updateDebug";
import { globalState } from "./utils/globalState";

import fragmentShaderSource from "./shaders/default/fragment.glsl";
import vertexShaderSource from "./shaders/default/vertex.glsl";

import { ShaderProgram } from "./lib/ShaderProgram";
import { Mesh } from "./lib/Mesh";
import { parseOBJ } from "./lib/parseOBJ";

export class Scene {
  private gl: WebGL2RenderingContext | null = null;

  private mesh: Mesh | null = null;
  private shaderProgram: ShaderProgram | null = null;

  constructor() {
    if (globalState.canvasEl) {
      this.gl = globalState.canvasEl.getContext("webgl2");
    }
    if (!this.gl) throw new Error("WebGL2 not supported");

    void this.init();
  }

  private async init() {
    if (!this.gl) return;

    const response = await fetch("/public/assets/models/cube/cube.obj");
    const text = await response.text();
    const objData = parseOBJ(text);

    this.shaderProgram = new ShaderProgram({
      gl: this.gl,
      fragmentCode: fragmentShaderSource,
      vertexCode: vertexShaderSource,
    });

    this.mesh = new Mesh({
      gl: this.gl,
      shaderProgram: this.shaderProgram,
      vertices: objData.vertices,
      normals: objData.normals,
      texcoords: objData.texcoords,
    });
  }

  private render() {
    const gl = this.gl;
    if (!gl || !this.shaderProgram) return;

    // Clear the canvas and depth buffer
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    this.mesh?.render();
  }

  update() {
    this.render();
  }

  onResize() {
    let w = globalState.stageSize.value[0];
    let h = globalState.stageSize.value[1];
    const ratio = globalState.pixelRatio.value;

    // Possibly need to Math.round() w and h here, but will leave for now
    w = w * ratio;
    h = h * ratio;

    const canvas = globalState.canvasEl;
    if (!canvas || !this.gl) return;

    if (canvas.width !== w && canvas.height !== h) {
      // Sets only the resolution of the canvas
      canvas.width = w;
      canvas.height = h;
    }

    this.gl.viewport(0, 0, w, h);

    updateDebug(`Canvas size: ${w.toFixed(2)}x${h.toFixed(2)}`);
  }

  destroy() {
    this.shaderProgram?.destroy();

    this.mesh?.destroy();
  }
}
