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

  // Create VAO and make it current, subsequent calls to bindBuffer, vertexAttribPointer, etc. will be stored in the VAO
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  // Get the location of the program's attribute
  const location = gl.getAttribLocation(program, name);

  // Sets buffer as the current ARRAY_BUFFER.
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

  // It uses the current ARRAY_BUFFER to feed data to the attribute at the location
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);

  // Enable the attribute at the location. Data stored in this location will be accessible and fed to the vertex shader when rendering
  gl.enableVertexAttribArray(location);

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
