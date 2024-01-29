import { vec3 } from "gl-matrix";

import fragmentShaderSource from "./shaders/default/fragment.glsl";
import vertexShaderSource from "./shaders/default/vertex.glsl";
import { globalState } from "./utils/globalState";
import { ShaderProgram } from "./lib/ShaderProgram";
import { Mesh } from "./lib/Mesh";
import { Camera } from "./lib/Camera";
import { lerp } from "./utils/lerp";
import { TexturesManager } from "./lib/TexturesManager";
import { GeometriesManager } from "./lib/GeometriesManager";

export class Scene {
  private gl: WebGL2RenderingContext | null = null;
  private camera = new Camera();

  private mesh: Mesh | null = null;
  private mesh2: Mesh | null = null;
  private shaderProgram: ShaderProgram | null = null;
  private shaderProgram2: ShaderProgram | null = null;

  private texturesManager;
  private geometriesManager = new GeometriesManager();

  constructor() {
    if (globalState.canvasEl) {
      this.gl = globalState.canvasEl.getContext("webgl2");
    }
    if (!this.gl) throw new Error("WebGL2 not supported");

    this.texturesManager = new TexturesManager({ gl: this.gl });

    void this.init();
    this.addEventListeners();
  }

  private async init() {
    if (!this.gl) return;

    await this.geometriesManager.addObjectsToLoad([
      // "/public/assets/models/crab/crab.obj",
      "/public/assets/models/f22/f22.obj",
      "/public/assets/models/efa/efa.obj",
      // "/public/assets/models/f117/f117.obj",
      // "/public/assets/models/cube/cube.obj",
    ]);

    await this.texturesManager.addTexturesToLoad([
      // "/public/assets/models/crab/crab.png",
      "/public/assets/models/f22/f22.png",
      "/public/assets/models/efa/efa.png",
      // "/public/assets/models/f117/f117.png",
      // "/public/assets/models/cube/cube.png",
    ]);

    this.shaderProgram = new ShaderProgram({
      gl: this.gl,
      fragmentCode: fragmentShaderSource,
      vertexCode: vertexShaderSource,
      texturesManager: this.texturesManager,
      texturesToUse: [
        {
          textureSrc: "/public/assets/models/efa/efa.png",
          uniformName: "u_image",
        },
      ],
      uniforms: {
        u_time: globalState.uTime,
      },
    });

    this.shaderProgram2 = new ShaderProgram({
      gl: this.gl,
      fragmentCode: fragmentShaderSource,
      vertexCode: vertexShaderSource,
      texturesManager: this.texturesManager,
      texturesToUse: [
        {
          textureSrc: "/public/assets/models/f22/f22.png",
          uniformName: "u_image",
        },
      ],
      uniforms: {
        u_time: globalState.uTime,
      },
    });

    this.mesh = new Mesh({
      gl: this.gl,
      shaderProgram: this.shaderProgram,
      geometry: this.geometriesManager.getGeometry(
        "/public/assets/models/efa/efa.obj"
      ),
    });

    this.mesh2 = new Mesh({
      gl: this.gl,
      shaderProgram: this.shaderProgram2,
      geometry: this.geometriesManager.getGeometry(
        "/public/assets/models/f22/f22.obj"
      ),
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

    // Update camera
    this.camera.updateViewMatrix({
      target: vec3.fromValues(
        mouse2DCurrent[0] * -0.25,
        mouse2DCurrent[1] * 0.05,
        -1
      ),
    });

    if (this.mesh) {
      this.mesh.rotation[2] = -mouse2DCurrent[0] * 0.4;
      this.mesh.rotation[0] = mouse2DCurrent[1] * 3.2;

      this.mesh.scale = vec3.fromValues(
        -mouse2DCurrent[1] * 1 + 1.2,
        -mouse2DCurrent[1] * 1 + 1.2,
        -mouse2DCurrent[1] * 1 + 1.2
      );

      const floatY = Math.sin(globalState.uTime.value * 1.2) * 0.03;

      this.mesh.position = vec3.fromValues(
        mouse2DCurrent[0] * -0.5,
        mouse2DCurrent[1] * -0.1 + floatY - 0.03,
        -mouse2DCurrent[1] * 0.2 - 0.02
      );

      this.mesh.render({ camera: this.camera });
    }

    if (this.mesh2) {
      this.mesh2.rotation[2] = mouse2DCurrent[0] * 0.8;
      this.mesh2.rotation[0] = -mouse2DCurrent[1] * 1.2;

      this.mesh2.scale = vec3.fromValues(
        mouse2DCurrent[1] * 0.5 + 1.2,
        mouse2DCurrent[1] * 0.5 + 1.2,
        mouse2DCurrent[1] * 0.5 + 1.2
      );

      const floatY = Math.sin(globalState.uTime.value * 0.8) * 0.02;

      this.mesh2.position = vec3.fromValues(
        mouse2DCurrent[0] * 0.5,
        mouse2DCurrent[1] * 0.1 + floatY + 0.03,
        mouse2DCurrent[1] * 0.2 - 0.05
      );

      this.mesh2.render({ camera: this.camera });
    }
  }

  update() {
    this.render();
  }

  onResize() {
    let w = globalState.stageSize.value[0];
    let h = globalState.stageSize.value[1];

    // updateDebug(`Window size: ${w.toFixed(1)} X ${h.toFixed(1)}`);

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

  private onPointerClick = () => {
    // Limit to 3 draw modes
    globalState.drawMode += 1;
    globalState.drawMode %= 3;
  };

  private addEventListeners() {
    window.addEventListener("pointerdown", this.onPointerClick);
  }

  private removeEventListeners() {
    window.removeEventListener("pointerdown", this.onPointerClick);
  }

  destroy() {
    this.shaderProgram?.destroy();
    this.shaderProgram2?.destroy();

    this.mesh?.destroy();
    this.mesh2?.destroy();

    this.geometriesManager?.destroy();
    this.texturesManager?.destroy();

    this.removeEventListeners();
  }
}
