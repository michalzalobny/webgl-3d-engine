import { mat4, vec3 } from "gl-matrix";

import { ShaderProgram } from "./ShaderProgram";
import { createAndInitBuffer, setupVertexAttribute } from "./Util";
import { Camera } from "./Camera";
import { GeometryObject } from "./parseOBJ";

interface Constructor {
  geometry: GeometryObject | null;
  shaderProgram: ShaderProgram;
  gl: WebGL2RenderingContext;
}

interface Render {
  camera: Camera;
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

  private modelViewMatrix = mat4.create();

  position = vec3.fromValues(0, 0, 0);
  scale = vec3.fromValues(1, 1, 1);
  rotation = vec3.fromValues(0, 0, 0);

  constructor(props: Constructor) {
    const { gl, shaderProgram, geometry } = props;

    if (!geometry) throw new Error("No geometry provided for the Mesh");

    this.gl = gl;
    this.shaderProgram = shaderProgram;
    this.vertices = geometry.vertices.map((n) => n * 0.04);
    this.normals = geometry.normals;
    this.texcoords = geometry.texcoords;

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

  render(props: Render) {
    const { camera } = props;

    this.shaderProgram.use();
    this.gl.bindVertexArray(this.VAO);

    // Construct model matrix
    mat4.identity(this.modelViewMatrix);
    mat4.translate(this.modelViewMatrix, this.modelViewMatrix, this.position);
    mat4.scale(this.modelViewMatrix, this.modelViewMatrix, this.scale);
    mat4.rotateX(this.modelViewMatrix, this.modelViewMatrix, this.rotation[0]);
    mat4.rotateY(this.modelViewMatrix, this.modelViewMatrix, this.rotation[1]);
    mat4.rotateZ(this.modelViewMatrix, this.modelViewMatrix, this.rotation[2]);

    // Multiply model matrix with view matrix (camera)
    mat4.multiply(
      this.modelViewMatrix,
      camera.viewMatrix,
      this.modelViewMatrix
    );

    this.shaderProgram.setUniformMatrix4fv(
      "u_modelViewMatrix",
      this.modelViewMatrix
    );

    this.shaderProgram.setUniformMatrix4fv(
      "u_projectionMatrix",
      camera.perspectiveProjectionMatrix
    );

    const drawMode = this.gl.TRIANGLES;
    this.gl.drawArrays(drawMode, 0, this.vertices.length / 3);

    // Unbind VAO
    this.gl.bindVertexArray(null);

    // Unbind textures - doing it here due to asynchronous nature of WebGL handling
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    this.gl.activeTexture(this.gl.TEXTURE0);
  }

  destroy() {
    this.gl.deleteBuffer(this.positionBuffer);
    this.gl.deleteBuffer(this.normalBuffer);
    this.gl.deleteBuffer(this.uvBuffer);
    this.gl.deleteVertexArray(this.VAO);
  }
}
