interface CreateAndInitBuffer {
  target: number;
  data: Float32Array | Uint16Array;
  gl: WebGL2RenderingContext;
}

export const createAndInitBuffer = (props: CreateAndInitBuffer) => {
  const { target, data, gl } = props;
  const buffer = gl.createBuffer();
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, gl.STATIC_DRAW);
  gl.bindBuffer(target, null);
  return buffer;
};

interface SetupVertexAttribute {
  name: string;
  program: WebGLProgram | null;
  buffer: WebGLBuffer | null;
  size: number;
  gl: WebGL2RenderingContext;
}

export const setupVertexAttribute = (props: SetupVertexAttribute) => {
  const { name, program, buffer, size, gl } = props;
  if (!program) throw new Error("Could not create VAO, no program");
  const location = gl.getAttribLocation(program, name);
  if (location === -1) {
    console.warn(
      `Could not find attribute location for ${name}. Either the attribute is not used in the vertex shader or the name is misspelled.`
    );
    return null;
  }
  gl.enableVertexAttribArray(location);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  return location;
};
