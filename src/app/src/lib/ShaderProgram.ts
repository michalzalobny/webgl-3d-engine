import { useTexture } from './Util';
import { TexturesManager } from './TexturesManager';

interface TextureToUse {
  textureSrc: string;
  uniformName: string;
}

interface UniformValue {
  value: number | number[] | Float32Array;
}
type Uniforms = Record<string, UniformValue>;

interface Props {
  vertexCode: string;
  fragmentCode: string;
  gl: WebGL2RenderingContext | null;
  texturesToUse?: TextureToUse[];
  uniforms?: Uniforms;
  texturesManager: TexturesManager;
}

export class ShaderProgram {
  private vertexCode: string;
  private fragmentCode: string;
  private gl: WebGL2RenderingContext;
  public program: WebGLProgram | null = null;
  private texturesManager;

  private uniformLocations = new Map<string, WebGLUniformLocation>();

  public texturesToUse: TextureToUse[] = [];
  private uniforms: Uniforms = {};

  constructor(props: Props) {
    const { vertexCode, fragmentCode, gl, texturesToUse, texturesManager, uniforms } = props;

    if (!gl) {
      throw new Error('No gl context provided to ShaderProgram constructor');
    }
    this.gl = gl;

    this.vertexCode = vertexCode;
    this.fragmentCode = fragmentCode;

    this.texturesManager = texturesManager;

    if (texturesToUse) this.texturesToUse = texturesToUse;
    if (uniforms) this.uniforms = uniforms;

    this.init(this.gl);
  }

  private createShader(gl: WebGL2RenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error(`Shader not created for type ${type}`);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) return shader;
    gl.deleteShader(shader);
  }

  private createProgram(gl: WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    const program = gl.createProgram();
    if (!program) throw new Error('Program not created');
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);

    // Clean up
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (success) return program;
    gl.deleteProgram(program);
  }

  private init(gl: WebGL2RenderingContext) {
    const vertexShader = this.createShader(gl, gl.VERTEX_SHADER, this.vertexCode);
    if (!vertexShader) throw new Error('Could not create vertex shader');

    const fragmentShader = this.createShader(gl, gl.FRAGMENT_SHADER, this.fragmentCode);
    if (!fragmentShader) throw new Error('Could not create fragment shader');

    const program = this.createProgram(gl, vertexShader, fragmentShader);
    if (!program) throw new Error('Could not create program');
    this.program = program;
  }

  private getUniformLocation(name: string) {
    if (!this.program) {
      throw new Error('Cannot get uniform location, program not initialized');
    }

    // If uniform location is not cached, get it from the GPU
    if (!this.uniformLocations.has(name)) {
      const location = this.gl.getUniformLocation(this.program, name);
      if (!location) {
        return undefined;
      }
      this.uniformLocations.set(name, location);
    }
    const cachedLocation = this.uniformLocations.get(name);
    return cachedLocation;
  }

  public setUniform1f(name: string, value: number) {
    const location = this.getUniformLocation(name);
    if (!location) {
      return undefined;
    }
    this.gl.uniform1f(location, value);
  }

  public setUniform4f(name: string, value: [number, number, number, number]) {
    const location = this.getUniformLocation(name);
    if (!location) {
      return undefined;
    }
    this.gl.uniform4f(location, value[0], value[1], value[2], value[3]);
  }

  public setUniform2f(name: string, value: [number, number] | Float32Array) {
    const location = this.getUniformLocation(name);
    if (!location) {
      return undefined;
    }
    this.gl.uniform2f(location, value[0], value[1]);
  }

  public setUniform3f(name: string, value: [number, number, number] | Float32Array) {
    const location = this.getUniformLocation(name);
    if (!location) {
      return undefined;
    }
    this.gl.uniform3f(location, value[0], value[1], value[2]);
  }

  public setUniformMatrix4fv(name: string, value: Float32Array | number[]) {
    const location = this.getUniformLocation(name);
    if (!location) {
      return undefined;
    }
    this.gl.uniformMatrix4fv(location, false, value);
  }

  public use() {
    if (!this.program) {
      throw new Error('Cannot use program, program is not set');
    }
    this.gl.useProgram(this.program);

    // Bind textures
    this.texturesToUse.forEach((el) => {
      const textureObj = this.texturesManager.getTextureObj(el.textureSrc);
      if (!textureObj) return;

      useTexture({
        gl: this.gl,
        shaderProgram: this.program,
        uniformLocation: this.getUniformLocation(el.uniformName),
        texture: textureObj.texture,
        textureIndex: textureObj.textureIndex,
      });
    });

    // Set uniforms
    Object.entries(this.uniforms).forEach(([objKey, objValue]) => {
      const value = objValue.value;
      if (typeof value === 'number') {
        this.setUniform1f(objKey, value);
      } else if (value instanceof Array) {
        if (value.length === 4) {
          this.setUniform4f(objKey, [value[0], value[1], value[2], value[3]]);
        }
        if (value.length === 2) {
          this.setUniform2f(objKey, [value[0], value[1]]);
        }
      } else if (value instanceof Float32Array) {
        this.setUniformMatrix4fv(objKey, value);
      }
    });
  }

  public destroy() {
    this.gl.deleteProgram(this.program);
  }
}
