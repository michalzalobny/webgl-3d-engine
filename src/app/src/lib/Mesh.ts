import { ShaderProgram } from "./ShaderProgram";
import { createAndInitBuffer, setupVertexAttribute } from "./Util";

interface Constructor {
  vertices: number[];
  normals: number[];
  texcoords: number[];
  shaderProgram: ShaderProgram;
  gl: WebGL2RenderingContext;
}

export class Mesh {
  private gl: WebGL2RenderingContext;
  private shaderProgram: ShaderProgram;
  private vertices: number[];
  private normals: number[];
  private texcoords: number[];
  private VAO: WebGLVertexArrayObject | null = null;

  private positionBuffer: WebGLBuffer | null = null;
  private normalBuffer: WebGLBuffer | null = null;
  private uvBuffer: WebGLBuffer | null = null;

  constructor(props: Constructor) {
    const { gl, shaderProgram, vertices, normals, texcoords } = props;

    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.vertices = vertices;
    this.normals = normals;
    this.texcoords = texcoords;

    this.init();
  }

  private init() {
    // Create VAO for buffer bindings
    this.VAO = this.gl.createVertexArray();
    this.gl.bindVertexArray(this.VAO);

    // Position buffer
    this.positionBuffer = createAndInitBuffer({
      gl: this.gl,
      target: this.gl.ARRAY_BUFFER,
      data: new Float32Array(this.vertices),
    });

    setupVertexAttribute({
      gl: this.gl,
      name: "a_position",
      program: this.shaderProgram.program,
      buffer: this.positionBuffer,
      size: 3,
    });

    // Normal buffer
    this.normalBuffer = createAndInitBuffer({
      gl: this.gl,
      target: this.gl.ARRAY_BUFFER,
      data: new Float32Array(this.normals),
    });

    setupVertexAttribute({
      gl: this.gl,
      name: "a_normal",
      program: this.shaderProgram.program,
      buffer: this.normalBuffer,
      size: 3,
    });

    // UV buffer
    this.uvBuffer = createAndInitBuffer({
      gl: this.gl,
      target: this.gl.ARRAY_BUFFER,
      data: new Float32Array(this.texcoords),
    });

    setupVertexAttribute({
      gl: this.gl,
      name: "a_uv",
      program: this.shaderProgram.program,
      buffer: this.uvBuffer,
      size: 2,
    });

    // Unbind VAO
    this.gl.bindVertexArray(null);
  }

  render() {
    this.shaderProgram.use();
    this.gl.bindVertexArray(this.VAO);

    const drawMode = this.gl.TRIANGLES;
    this.gl.drawArrays(drawMode, 0, this.vertices.length / 3);
  }

  destroy() {
    this.gl.deleteBuffer(this.positionBuffer);
    this.gl.deleteBuffer(this.normalBuffer);
    this.gl.deleteBuffer(this.uvBuffer);
    this.gl.deleteVertexArray(this.VAO);
  }
}
