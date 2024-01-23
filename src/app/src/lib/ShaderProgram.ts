interface Props {
  vertexCode: string;
  fragmentCode: string;
  gl: WebGL2RenderingContext | null;
}

export class ShaderProgram {
  vertexCode: string;
  fragmentCode: string;
  gl: WebGL2RenderingContext | null;
  program: WebGLProgram | null = null;

  constructor(props: Props) {
    const { vertexCode, fragmentCode, gl } = props;

    this.vertexCode = vertexCode;
    this.fragmentCode = fragmentCode;

    this.gl = gl;

    this.init();
  }

  createShader(gl: WebGL2RenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error(`Shader not created for type ${type}`);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) return shader;
    gl.deleteShader(shader);
  }

  createProgram(
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

  init() {
    const gl = this.gl;
    if (!gl) return;

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

  getAttributeLocation(name: string) {
    if (!this.program)
      throw new Error("Program not initialized, cannot get attribute location");

    if (!this.gl)
      throw new Error(
        "WebGL2 context not initialized, cannot get attribute location"
      );
    return this.gl.getAttribLocation(this.program, name);
  }

  getUniformLocation(name: string) {
    if (!this.program)
      throw new Error("Program not initialized, cannot get uniform location");

    if (!this.gl)
      throw new Error(
        "WebGL2 context not initialized, cannot get uniform location"
      );
    return this.gl.getUniformLocation(this.program, name);
  }

  setUniform1f(name: string, value: number) {
    if (!this.gl)
      throw new Error("WebGL2 context not initialized, cannot set uniform");
    let location = this.getUniformLocation(name);
    this.gl.uniform1f(location, value);
  }

  setUniform4f(name: string, value: [number, number, number, number]) {
    if (!this.gl)
      throw new Error("WebGL2 context not initialized, cannot set uniform");
    let location = this.getUniformLocation(name);
    this.gl.uniform4f(location, value[0], value[1], value[2], value[3]);
  }

  use() {
    if (!this.gl || !this.program)
      throw new Error("Cannot use program, WebGL2 context or program not set");
    this.gl.useProgram(this.program);
  }

  destroy() {
    this.gl?.deleteProgram(this.program);
  }
}
