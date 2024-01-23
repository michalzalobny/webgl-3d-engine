import { updateDebug } from "./utils/updateDebug";
import { globalState } from "./utils/globalState";

import fragmentShaderSource from "./shaders/default/fragment.glsl";
import vertexShaderSource from "./shaders/default/vertex.glsl";

import { ShaderProgram } from "./lib/ShaderProgram";

export class Scene {
  gl: WebGL2RenderingContext | null = null;
  _shaderProgram: ShaderProgram;

  constructor() {
    if (globalState.canvasEl) {
      this.gl = globalState.canvasEl.getContext("webgl2");
    }
    if (!this.gl) throw new Error("WebGL2 not supported");

    this._shaderProgram = new ShaderProgram({
      gl: this.gl,
      fragmentCode: fragmentShaderSource,
      vertexCode: vertexShaderSource,
    });
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

    if (canvas.width !== w && canvas.height !== h) {
      // Sets only the resolution of the canvas
      canvas.width = w;
      canvas.height = h;
    }

    this.gl.viewport(0, 0, w, h);

    this.render();
    updateDebug(`Canvas size: ${w.toFixed(2)}x${h.toFixed(2)}`);
  }

  destroy() {
    this._shaderProgram.destroy();
  }

  render() {
    const gl = this.gl;
    if (!gl) return;

    const setRectangle = (
      gl: WebGL2RenderingContext,
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const x1 = x;
      const x2 = x + width;
      const y1 = y;
      const y2 = y + height;
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
        gl.STATIC_DRAW
      );
    };

    // const program = this._shaderProgram.program;
    // if (!program) throw new Error("Could not create program");

    // look up where the vertex data needs to go.
    const positionAttributeLocation =
      this._shaderProgram.getAttributeLocation("a_position");

    // Create a buffer
    const positionBuffer = gl.createBuffer();

    // Create a vertex array object (attribute state)
    const vao = gl.createVertexArray();

    // and make it the one we're currently working with
    gl.bindVertexArray(vao);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2; // 2 components per iteration
    const type = gl.FLOAT; // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0; // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0; // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionAttributeLocation,
      size,
      type,
      normalize,
      stride,
      offset
    );

    // Clear the canvas and depth buffer before drawing
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    this._shaderProgram.use();

    // Turn on culling. By default backfacing triangles
    gl.enable(gl.DEPTH_TEST);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // draw X random rectangles in random colors
    for (let ii = 0; ii < 2; ++ii) {
      const x = (Math.random() - 0.5) * 2;
      const y = (Math.random() - 0.5) * 2;
      // Put a rectangle in the position buffer
      setRectangle(gl, 0, 0, x, y);

      // Set a random color.
      this._shaderProgram.setUniform4f("u_color", [
        Math.random(),
        Math.random(),
        Math.random(),
        1,
      ]);

      // Draw the rectangle.
      const primitiveType = gl.TRIANGLES;
      const offset = 0;
      const count = 6;
      gl.drawArrays(primitiveType, offset, count);
    }
  }
}
