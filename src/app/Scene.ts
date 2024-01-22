import { updateDebug } from "./utils/updateDebug";
import { globalState } from "./utils/globalState";

export class Scene {
  gl: WebGL2RenderingContext | null = null;

  constructor() {
    if (globalState.canvasEl) {
      this.gl = globalState.canvasEl.getContext("webgl2");
    }
    if (!this.gl) throw new Error("WebGL2 not supported");

    this._setup();
  }

  update() {}

  onResize() {
    updateDebug(globalState.stageSize.value.join(" x "));

    const gl = this.gl;
    if (!gl) return;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }

  onPixelRatioChange() {}

  destroy() {}

  // Returns a random integer from 0 to range - 1.
  randomInt(range) {
    return Math.floor(Math.random() * range);
  }

  // Fill the buffer with the values that define a rectangle.
  setRectangle(gl, x, y, width, height) {
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

  _setup() {
    var vertexShaderSource = `#version 300 es

    // an attribute is an input (in) to a vertex shader.
    // It will receive data from a buffer
    in vec2 a_position;
    
    // Used to pass in the resolution of the canvas
    uniform vec2 u_resolution;
    
    // all shaders have a main function
    void main() {
    
      // convert the position from pixels to 0.0 to 1.0
      vec2 zeroToOne = a_position / u_resolution;
    
      // convert from 0->1 to 0->2
      vec2 zeroToTwo = zeroToOne * 2.0;
    
      // convert from 0->2 to -1->+1 (clipspace)
      vec2 clipSpace = zeroToTwo - 1.0;
    
      gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    }
    `;

    var fragmentShaderSource = `#version 300 es
    
    precision highp float;
    
    uniform vec4 u_color;
    
    // we need to declare an output for the fragment shader
    out vec4 outColor;
    
    void main() {
      outColor = u_color;
    }
    `;

    const gl = this.gl;

    if (!gl) return;

    // Use our boilerplate utils to compile the shaders and link into a program
    function createShader(gl, type, source) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (success) {
        return shader;
      }

      console.log(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
    }

    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    function createProgram(gl, vertexShader, fragmentShader) {
      var program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      var success = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (success) {
        return program;
      }

      console.log(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
    }

    var program = createProgram(gl, vertexShader, fragmentShader);

    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    // look up uniform locations
    var resolutionUniformLocation = gl.getUniformLocation(
      program,
      "u_resolution"
    );
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

    const canvas = gl.canvas;
    if (!canvas) return;
    const multiplier = 2 || 1;
    const width = (canvas.clientWidth * multiplier) | 0;
    const height = (canvas.clientHeight * multiplier) | 0;
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      // return true;
    }
    // return false;

    // webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Pass in the canvas resolution so we can convert from
    // pixels to clipspace in the shader
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // draw 50 random rectangles in random colors
    for (var ii = 0; ii < 50; ++ii) {
      // Put a rectangle in the position buffer
      this.setRectangle(
        gl,
        this.randomInt(300),
        this.randomInt(300),
        this.randomInt(300),
        this.randomInt(300)
      );

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
