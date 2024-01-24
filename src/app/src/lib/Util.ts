interface CreateVertexArrayObject {
  name: string;
  program: WebGLProgram | null;
  buffer: WebGLBuffer | null;
  size: number;
  gl: WebGL2RenderingContext;
}

// Create VAO for a given attribute.
// VAO stores: vertexAttribPointer, enableVertexAttribArray, buffer binding (location -> buffer)
export const createVertexArrayObject = (props: CreateVertexArrayObject) => {
  const { name, program, buffer, size, gl } = props;
  if (!program) throw new Error("Could not create VAO, no program");

  // Create VAO and make it current, subsequent calls to bindBuffer, vertexAttribPointer, etc. will be stored in the VAO
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // Location of the program's attribute
  const location = gl.getAttribLocation(program, name);
  // Stored in the VAO
  gl.enableVertexAttribArray(location);
  // Sets buffer as the current ARRAY_BUFFER. Current vertex buffer object (VBO) for vertex attributes.
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  // Uses current ARRAY_BUFFER's buffer data as the source for vertex attributes
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);

  // Unbind the VAO and the buffer
  gl.bindVertexArray(null);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return vao;
};

export const setRectangle = (
  gl: WebGL2RenderingContext,
  x: number,
  y: number,
  width: number,
  height: number,
  buffer: WebGLBuffer | null
) => {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([x1, y1, x2, y1, x1, y2, x1, y2, x2, y1, x2, y2]),
    gl.STATIC_DRAW
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, null);
};
