import { vec3 } from 'gl-matrix';

import fragmentShaderPostSource from './shaders/post/fragment.glsl';
import vertexShaderPostSource from './shaders/post/vertex.glsl';

import { globalState } from './utils/globalState';
import { ShaderProgram } from './lib/ShaderProgram';
import { Mesh } from './lib/Mesh';
import { Camera } from './lib/Camera';
import { lerp } from './utils/lerp';
import { TexturesManager } from './lib/TexturesManager';
import { GeometriesManager } from './lib/GeometriesManager';

import { Objects3D } from './Components/Objects3D';

export class Scene {
  private gl: WebGL2RenderingContext | null = null;
  private camera = new Camera();

  private texturesManager;
  private geometriesManager;

  private objects3D: Objects3D | null = null;

  private postProcessShaderProgram: ShaderProgram | null = null;
  private postProcessMesh: Mesh | null = null;

  constructor() {
    if (globalState.canvasEl) {
      this.gl = globalState.canvasEl.getContext('webgl2');
    }
    if (!this.gl) throw new Error('WebGL2 not supported');

    this.texturesManager = new TexturesManager({ gl: this.gl });
    this.geometriesManager = new GeometriesManager();

    this.init();
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

    this.postProcessMesh = new Mesh({
      gl,
      shaderProgram: this.postProcessShaderProgram,
      geometry: this.geometriesManager.getGeometry('plane'),
    });
  }

  private async init() {
    if (!this.gl) return;

    await this.geometriesManager.addObjectsToLoad([
      '/public/assets/models/f22/f22.obj',
      '/public/assets/models/efa/efa.obj',
    ]);

    // Plane made out of two triangles
    const planeVertices = [-0.5, 0.5, 0, -0.5, -0.5, 0, 0.5, -0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0];
    const planeTexcoords = [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1];

    this.geometriesManager.addGeometry({
      geometryUrl: 'plane',
      geometryObject: { vertices: planeVertices, texcoords: planeTexcoords, normals: [] },
    });

    await this.texturesManager.addTexturesToLoad([
      '/public/assets/models/f22/f22.webp',
      '/public/assets/models/efa/efa.webp',
    ]);

    this.objects3D = new Objects3D({
      gl: this.gl,
      texturesManager: this.texturesManager,
      camera: this.camera,
      geometriesManager: this.geometriesManager,
    });

    this.postProcess();
  }

  private render() {
    const gl = this.gl;
    if (!gl) return;

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

    this.objects3D?.update();

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Render plane where post process texture is applied
    this.postProcessShaderProgram?.use();
    this.postProcessMesh?.render({
      camera: this.camera,
    });
  }

  public update() {
    this.render();
  }

  public onResize() {
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

  public destroy() {
    this.geometriesManager?.destroy();
    this.texturesManager?.destroy();

    this.objects3D?.destroy();
  }
}
