import { vec3 } from 'gl-matrix';

import { ShaderProgram } from '../lib/ShaderProgram';
import { Mesh } from '../lib/Mesh';
import { TexturesManager } from '../lib/TexturesManager';
import { globalState } from '../utils/globalState';
import { GeometriesManager } from '../lib/GeometriesManager';
import { Camera } from '../lib/Camera';

import fragmentShaderSource from '../shaders/default/fragment.glsl';
import vertexShaderSource from '../shaders/default/vertex.glsl';

interface Constructor {
  gl: WebGL2RenderingContext | null;
  texturesManager: TexturesManager;
  geometriesManager: GeometriesManager;
  camera: Camera;
}

export class Objects3D {
  private gl: WebGL2RenderingContext;

  private jet1: Mesh | null = null;
  private jet2: Mesh | null = null;

  private jetProgram1: ShaderProgram | null = null;
  private jetProgram2: ShaderProgram | null = null;

  private texturesManager: TexturesManager;
  private geometriesManager: GeometriesManager;
  private camera: Camera;

  constructor(props: Constructor) {
    const { gl, texturesManager, geometriesManager, camera } = props;
    if (!gl) throw new Error('WebGL2 not supported, cannot create Objects3D');

    this.gl = gl;
    this.texturesManager = texturesManager;
    this.geometriesManager = geometriesManager;
    this.camera = camera;

    this.init();
  }

  private init() {
    this.jetProgram1 = new ShaderProgram({
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

    this.jetProgram2 = new ShaderProgram({
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

    this.jet1 = new Mesh({
      gl: this.gl,
      shaderProgram: this.jetProgram1,
      geometry: this.geometriesManager.getGeometry('/public/assets/models/efa/efa.obj'),
    });

    this.jet2 = new Mesh({
      gl: this.gl,
      shaderProgram: this.jetProgram2,
      geometry: this.geometriesManager.getGeometry('/public/assets/models/f22/f22.obj'),
    });
  }

  public update() {
    const mouse2DCurrent = globalState.mouse2DCurrent.value;

    if (this.jet1) {
      this.jet1.rotation[2] = -mouse2DCurrent[0] * 0.4;
      this.jet1.rotation[0] = mouse2DCurrent[1] * 3.2;

      const floatY = Math.sin(globalState.uTime.value * 1.2) * 0.035;

      this.jet1.position = vec3.fromValues(
        mouse2DCurrent[0] * -0.5,
        mouse2DCurrent[1] * -0.1 + floatY - 0.03,
        -mouse2DCurrent[1] * 0.25 - 0.02
      );

      this.jet1.render({ camera: this.camera });
    }

    if (this.jet2) {
      this.jet2.rotation[2] = mouse2DCurrent[0] * 0.8;
      this.jet2.rotation[0] = -mouse2DCurrent[1] * 1.2;

      const floatY = Math.sin(globalState.uTime.value * 1.6) * 0.02;

      this.jet2.position = vec3.fromValues(
        mouse2DCurrent[0] * 0.5,
        mouse2DCurrent[1] * 0.1 + floatY + 0.03,
        mouse2DCurrent[1] * 0.2 - 0.05
      );

      this.jet2.render({ camera: this.camera });
    }
  }

  public destroy() {
    if (this.jet1) this.jet1.destroy();
    if (this.jet2) this.jet2.destroy();
    if (this.jetProgram1) this.jetProgram1.destroy();
    if (this.jetProgram2) this.jetProgram2.destroy();
  }
}
