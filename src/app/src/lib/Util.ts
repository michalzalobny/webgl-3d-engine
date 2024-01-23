interface CreateVertexArrayObject {
  name: string;
  program: WebGLProgram | null;
  buffer: WebGLBuffer | null;
  size: number;
  gl: WebGL2RenderingContext;
}

// Create VAO for a given attribute
export const createVertexArrayObject = (props: CreateVertexArrayObject) => {
  const { name, program, buffer, size, gl } = props;
  if (!program) throw new Error("Could not create VAO, no program");

  // Create and bind a new VAO
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // Get attribute location and set up the attribute for the current VAO
  const location = gl.getAttribLocation(program, name);
  gl.enableVertexAttribArray(location);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);

  // Unbind the VAO
  gl.bindVertexArray(null);

  return vao;
};

export const setRectangle = (
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
