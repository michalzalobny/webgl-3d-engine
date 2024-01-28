import { updateDebug } from "./utils/updateDebug";
import { globalState } from "./utils/globalState";

import fragmentShaderSource from "./shaders/default/fragment.glsl";
import vertexShaderSource from "./shaders/default/vertex.glsl";

import { ShaderProgram } from "./lib/ShaderProgram";
import { Mesh } from "./lib/Mesh";
import { parseOBJ } from "./lib/parseOBJ";
import { Camera } from "./lib/Camera";
import { lerp } from "./utils/lerp";
import { vec3 } from "gl-matrix";
import { useTexture } from "./lib/Util";
import { TexturesManager } from "./lib/TexturesManager";

export class Scene {
  private gl: WebGL2RenderingContext | null = null;

  private camera = new Camera();

  private mesh: Mesh | null = null;
  private shaderProgram: ShaderProgram | null = null;

  private texturesManager;

  constructor() {
    if (globalState.canvasEl) {
      this.gl = globalState.canvasEl.getContext("webgl2");
    }
    if (!this.gl) throw new Error("WebGL2 not supported");

    this.texturesManager = new TexturesManager({
      texturesToLoad: [
        "/public/assets/models/crab/crab.png",
        "/public/assets/models/f22/f22.png",
        "/public/assets/models/efa/efa.png",
        "/public/assets/models/f117/f117.png",
        "/public/assets/models/cube/cube.png",
      ],
      gl: this.gl,
    });

    void this.init();
  }

  private async init() {
    if (!this.gl) return;

    const response = await fetch("/public/assets/models/crab/crab.obj");
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

    // Lerp mouse position
    const mouse2DTarget = globalState.mouse2DTarget.value;
    const mouse2DCurrent = globalState.mouse2DCurrent.value;
    mouse2DCurrent[0] = lerp(
      mouse2DCurrent[0],
      mouse2DTarget[0],
      0.06 * globalState.slowDownFactor.value
    );
    mouse2DCurrent[1] = lerp(
      mouse2DCurrent[1],
      mouse2DTarget[1],
      0.06 * globalState.slowDownFactor.value
    );

    this.camera.updateViewMatrix({
      eye: [-mouse2DCurrent[0] * 0.5, -mouse2DCurrent[1] * 0.1, 0.5],
    });

    // Use proper texture
    const textureObj = this.texturesManager.getTexture(
      "/public/assets/models/crab/crab.png"
    );
    if (textureObj) {
      useTexture({
        gl: this.gl,
        shaderProgram: this.shaderProgram.program,
        uniformLocations: [this.shaderProgram.getUniformLocation("u_image")],
        texture: textureObj.texture,
        textureIndex: textureObj.textureIndex,
      });
    }

    if (this.mesh) {
      this.mesh.rotation[2] += 0.01 * globalState.slowDownFactor.value;
      this.mesh.rotation[0] += 0.02 * globalState.slowDownFactor.value;

      this.mesh.scale = vec3.fromValues(
        mouse2DCurrent[1] * 1 + 1.2,
        mouse2DCurrent[1] * 1 + 1.2,
        mouse2DCurrent[1] * 1 + 1.2
      );

      this.mesh.render({ camera: this.camera });
    }
  }

  update() {
    this.render();
  }

  onResize() {
    let w = globalState.stageSize.value[0];
    let h = globalState.stageSize.value[1];

    updateDebug(`Window size: ${w.toFixed(1)} X ${h.toFixed(1)}`);

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

    this.camera.updateProjectionMatrix({
      fov: Math.PI / 3,
      aspect_ratio: w / h,
      near: 0.1,
      far: 20,
    });
  }

  destroy() {
    this.shaderProgram?.destroy();

    this.mesh?.destroy();
  }
}
