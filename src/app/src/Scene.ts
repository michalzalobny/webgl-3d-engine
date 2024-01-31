import { vec3 } from 'gl-matrix';

import fragmentShaderSource from './shaders/default/fragment.glsl';
import vertexShaderSource from './shaders/default/vertex.glsl';

import fragmentShaderPostSource from './shaders/post/fragment.glsl';
import vertexShaderPostSource from './shaders/post/vertex.glsl';

import { globalState } from './utils/globalState';
import { ShaderProgram } from './lib/ShaderProgram';
import { Mesh } from './lib/Mesh';
import { Camera } from './lib/Camera';
import { lerp } from './utils/lerp';
import { TexturesManager, TextureObject } from './lib/TexturesManager';
import { GeometriesManager } from './lib/GeometriesManager';

export class Scene {
  private gl: WebGL2RenderingContext | null = null;
  private camera = new Camera();

  private mesh: Mesh | null = null;
  private mesh2: Mesh | null = null;
  private shaderProgram: ShaderProgram | null = null;
  private shaderProgram2: ShaderProgram | null = null;

  private texturesManager;
  private geometriesManager = new GeometriesManager();

  private postProcessShaderProgram: ShaderProgram | null = null;
  private postProcessMesh: Mesh | null = null;

  constructor() {
    if (globalState.canvasEl) {
      this.gl = globalState.canvasEl.getContext('webgl2');
    }
    if (!this.gl) throw new Error('WebGL2 not supported');

    this.texturesManager = new TexturesManager({ gl: this.gl });

    this.postProcess();

    void this.init();
    this.addEventListeners();
  }

  private postProcess() {
    const { gl } = this;
    if (!gl) return;
    const { width, height } = gl.canvas;

    // Create a texture to render to
    this.texturesManager.createFrameBufferTexture(width, height, 'postProcessTexture');

    this.postProcessShaderProgram = new ShaderProgram({
      gl: this.gl,
      fragmentCode: fragmentShaderPostSource,
      vertexCode: vertexShaderPostSource,
      texturesManager: this.texturesManager,
      texturesToUse: [
        {
          textureSrc: 'postProcessTexture',
          uniformName: 'u_image',
        },
      ],
      uniforms: {
        u_time: globalState.uTime,
        u_resolution: globalState.stageSize,
      },
    });

    // Plane made out of two triangles
    const planeVertices = [-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0];

    const planeTexcoords = [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1];

    this.postProcessMesh = new Mesh({
      gl,
      shaderProgram: this.postProcessShaderProgram,
      geometry: {
        vertices: planeVertices,
        normals: [],
        texcoords: planeTexcoords,
      },
    });
  }

  private async init() {
    if (!this.gl) return;

    await this.geometriesManager.addObjectsToLoad([
      // "/public/assets/models/crab/crab.obj",
      '/public/assets/models/f22/f22.obj',
      '/public/assets/models/efa/efa.obj',
      // "/public/assets/models/f117/f117.obj",
      // "/public/assets/models/cube/cube.obj",
    ]);

    await this.texturesManager.addTexturesToLoad([
      // "/public/assets/models/crab/crab.png",
      '/public/assets/models/f22/f22.webp',
      '/public/assets/models/efa/efa.webp',
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
          textureSrc: '/public/assets/models/efa/efa.webp',
          uniformName: 'u_image',
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
          textureSrc: '/public/assets/models/f22/f22.webp',
          uniformName: 'u_image',
        },
      ],
      uniforms: {
        u_time: globalState.uTime,
      },
    });

    this.mesh = new Mesh({
      gl: this.gl,
      shaderProgram: this.shaderProgram,
      geometry: this.geometriesManager.getGeometry('/public/assets/models/efa/efa.obj'),
    });

    this.mesh2 = new Mesh({
      gl: this.gl,
      shaderProgram: this.shaderProgram2,
      geometry: this.geometriesManager.getGeometry('/public/assets/models/f22/f22.obj'),
    });
  }

  private render() {
    const gl = this.gl;
    if (!gl || !this.shaderProgram) return;

    // Render to post process texture
    const textureObj = this.texturesManager.getTextureObj('postProcessTexture');
    if (textureObj && textureObj.frameBuffer) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, textureObj.frameBuffer);
    }

    // Clear the canvas and depth buffer
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // Lerp mouse position
    const mouse2DTarget = globalState.mouse2DTarget.value;
    const mouse2DCurrent = globalState.mouse2DCurrent.value;
    mouse2DCurrent[0] = lerp(mouse2DCurrent[0], mouse2DTarget[0], 0.06 * globalState.slowDownFactor.value);
    mouse2DCurrent[1] = lerp(mouse2DCurrent[1], mouse2DTarget[1], 0.06 * globalState.slowDownFactor.value);

    // Update camera
    this.camera.updateViewMatrix({
      target: vec3.fromValues(mouse2DCurrent[0] * -0.25, mouse2DCurrent[1] * 0.05, -1),
    });

    if (this.mesh) {
      this.mesh.rotation[2] = -mouse2DCurrent[0] * 0.4;
      this.mesh.rotation[0] = mouse2DCurrent[1] * 3.2;

      const floatY = Math.sin(globalState.uTime.value * 1.2) * 0.035;

      this.mesh.position = vec3.fromValues(
        mouse2DCurrent[0] * -0.5,
        mouse2DCurrent[1] * -0.1 + floatY - 0.03,
        -mouse2DCurrent[1] * 0.25 - 0.02
      );

      this.mesh.render({ camera: this.camera });
    }

    if (this.mesh2) {
      this.mesh2.rotation[2] = mouse2DCurrent[0] * 0.8;
      this.mesh2.rotation[0] = -mouse2DCurrent[1] * 1.2;

      const floatY = Math.sin(globalState.uTime.value * 1.6) * 0.02;

      this.mesh2.position = vec3.fromValues(
        mouse2DCurrent[0] * 0.5,
        mouse2DCurrent[1] * 0.1 + floatY + 0.03,
        mouse2DCurrent[1] * 0.2 - 0.05
      );

      this.mesh2.render({ camera: this.camera });
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Render plane where post process texture is applied
    this.postProcessShaderProgram?.use();
    this.postProcessMesh?.render({
      camera: this.camera,
    });
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

    this.texturesManager.resize();
  }

  private onPointerClick = () => {
    // Limit to 3 draw modes
    globalState.drawMode += 1;
    globalState.drawMode %= 3;
  };

  private addEventListeners() {
    window.addEventListener('pointerdown', this.onPointerClick);
  }

  private removeEventListeners() {
    window.removeEventListener('pointerdown', this.onPointerClick);
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
