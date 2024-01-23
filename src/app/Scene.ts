import { updateDebug } from "./utils/updateDebug";
import { globalState } from "./utils/globalState";

import fragmentShaderSource from "./shaders/default/fragment.glsl";
import vertexShaderSource from "./shaders/default/vertex.glsl";

export class Scene {
  gl: WebGL2RenderingContext | null = null;

  constructor() {
    if (globalState.canvasEl) {
      this.gl = globalState.canvasEl.getContext("webgl2");
    }
    if (!this.gl) throw new Error("WebGL2 not supported");
  }

  update() {}

  onResize() {
    let w = globalState.stageSize.value[0];
    let h = globalState.stageSize.value[1];
    const ratio = globalState.pixelRatio.value;

    // Possibly need to Math.round() w and h here, but will leave for now
    w = w * ratio;
    h = h * ratio;

    const canvas = globalState.canvasEl;
    if (!canvas || !this.gl) return;

    // Sets only the resolution of the canvas
    canvas.width = w;
    canvas.height = h;
    this.gl.viewport(0, 0, w, h);

    this.render();
    updateDebug(`Canvas size: ${w}x${h}`);
  }

  destroy() {}

  // Fill the buffer with the values that define a rectangle.
  setRectangle(
    gl: WebGL2RenderingContext,
    x: number,
    y: number,
    width: number,
    height: number
  ) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
      gl.STATIC_DRAW
    );
  }

  render() {
    const gl = this.gl;

    if (!gl) return;

    // Use our boilerplate utils to compile the shaders and link into a program
    function createShader(
      gl: WebGL2RenderingContext,
      type: number,
      source: string
    ) {
      var shader = gl.createShader(type);
      if (!shader) throw new Error(`Shader not created for type ${type}`);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (success) {
        return shader;
      }

      gl.deleteShader(shader);
    }

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    if (!vertexShader || !fragmentShader)
      throw new Error("Could not create shaders");

    function createProgram(
      gl: WebGL2RenderingContext,
      vertexShader: WebGLShader,
      fragmentShader: WebGLShader
    ) {
      var program = gl.createProgram();
      if (!program) throw new Error("Program not created");
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      var success = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (success) {
        return program;
      }

      gl.deleteProgram(program);
    }

    var program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) throw new Error("Could not create program");

    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    var colorLocation = gl.getUniformLocation(program, "u_color");

    // Create a buffer
    var positionBuffer = gl.createBuffer();

    // Create a vertex array object (attribute state)
    var vao = gl.createVertexArray();

    // and make it the one we're currently working with
    gl.bindVertexArray(vao);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size = 2; // 2 components per iteration
    var type = gl.FLOAT; // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // draw X random rectangles in random colors
    for (var ii = 0; ii < 2; ++ii) {
      const x = (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 2;
      // Put a rectangle in the position buffer
      this.setRectangle(gl, 0, 0, x, y);

      // Set a random color.
      gl.uniform4f(
        colorLocation,
        Math.random(),
        Math.random(),
        Math.random(),
        1
      );

      // Draw the rectangle.
      var primitiveType = gl.TRIANGLES;
      var offset = 0;
      var count = 6;
      gl.drawArrays(primitiveType, offset, count);
    }
  }
}
