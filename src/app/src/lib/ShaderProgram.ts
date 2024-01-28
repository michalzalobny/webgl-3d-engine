import { useTexture } from "./Util";
import { TexturesManager } from "./TexturesManager";

interface TextureToUse {
  textureSrc: string;
  uniformName: string;
}

interface Props {
  vertexCode: string;
  fragmentCode: string;
  gl: WebGL2RenderingContext | null;
  texturesToUse?: TextureToUse[];
  texturesManager: TexturesManager;
}

export class ShaderProgram {
  private vertexCode: string;
  private fragmentCode: string;
  private gl: WebGL2RenderingContext;
  program: WebGLProgram | null = null;
  private texturesManager;

  uniformLocations = new Map<string, WebGLUniformLocation>();

  texturesToUse: TextureToUse[] = [];

  constructor(props: Props) {
    const { vertexCode, fragmentCode, gl, texturesToUse, texturesManager } =
      props;

    this.vertexCode = vertexCode;
    this.fragmentCode = fragmentCode;

    if (!gl) {
      throw new Error("No gl context provided to ShaderProgram constructor");
    }

    this.gl = gl;

    this.texturesManager = texturesManager;
    if (texturesToUse) this.texturesToUse = texturesToUse;

    this.init(this.gl);
  }

  private createShader(
    gl: WebGL2RenderingContext,
    type: number,
    source: string
  ) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error(`Shader not created for type ${type}`);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) return shader;
    gl.deleteShader(shader);
  }

  private createProgram(
    gl: WebGL2RenderingContext,
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) {
    const program = gl.createProgram();
    if (!program) throw new Error("Program not created");
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
    const vertexShader = this.createShader(
      gl,
      gl.VERTEX_SHADER,
      this.vertexCode
    );
    if (!vertexShader) throw new Error("Could not create vertex shader");

    const fragmentShader = this.createShader(
      gl,
      gl.FRAGMENT_SHADER,
      this.fragmentCode
    );
    if (!fragmentShader) throw new Error("Could not create fragment shader");

    const program = this.createProgram(gl, vertexShader, fragmentShader);
    if (!program) throw new Error("Could not create program");
    this.program = program;
  }

  getUniformLocation(name: string) {
    if (!this.program) {
      throw new Error("Cannot get uniform location, program not initialized");
    }

    // If uniform location is not cached, get it from the GPU
    if (!this.uniformLocations.has(name)) {
      const location = this.gl.getUniformLocation(this.program, name);
      if (!location) throw new Error(`Uniform ${name} not found`);
      this.uniformLocations.set(name, location);
    }
    const cachedLocation = this.uniformLocations.get(name);
    return cachedLocation;
  }

  setUniform1f(name: string, value: number) {
    const location = this.getUniformLocation(name);
    if (!location) throw new Error(`Uniform ${name} not found`);
    this.gl.uniform1f(location, value);
  }

  setUniform4f(name: string, value: [number, number, number, number]) {
    const location = this.getUniformLocation(name);
    if (!location) throw new Error(`Uniform ${name} not found`);
    this.gl.uniform4f(location, value[0], value[1], value[2], value[3]);
  }

  setUniformMatrix4fv(name: string, value: Float32Array) {
    const location = this.getUniformLocation(name);
    if (!location) throw new Error(`Uniform ${name} not found`);
    this.gl.uniformMatrix4fv(location, false, value);
  }

  use() {
    if (!this.program) {
      throw new Error("Cannot use program, program is not set");
    }
    this.gl.useProgram(this.program);

    // Bind textures
    this.texturesToUse.forEach((el) => {
      const textureObj = this.texturesManager.getTexture(el.textureSrc);

      if (!textureObj) return;

      useTexture({
        gl: this.gl,
        shaderProgram: this.program,
        uniformLocation: this.getUniformLocation(el.uniformName),
        texture: textureObj.texture,
        textureIndex: textureObj.textureIndex,
      });
    });
  }

  destroy() {
    this.gl.deleteProgram(this.program);
  }
}
