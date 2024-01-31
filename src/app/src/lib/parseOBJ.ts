export interface GeometryObject {
  vertices: number[];
  normals: number[];
  texcoords: number[];
}

export const parseOBJ = (text: string): GeometryObject => {
  const vertices_lookup: number[][] = [];
  const normals_lookup: number[][] = [];
  const texcoords_lookup: number[][] = [];

  const finalVertices: number[][] = [];
  const finalNormals: number[][] = [];
  const finalTexcoords: number[][] = [];

  const lines = text.split('\n');

  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    // Remove whitespace from both sides of a string
    const line = lines[lineNo].trim();

    // Skip comments and empty lines
    if (line === '' || line.startsWith('#')) {
      continue;
    }

    // Split a string into an array of substrings - after each space or tab
    const lineParts = line.split(/\s+/);
    const keyword = lineParts[0];

    // Load vertices_lookup
    if (keyword === 'v') {
      const x = parseFloat(lineParts[1]);
      const y = parseFloat(lineParts[2]);
      const z = parseFloat(lineParts[3]);
      vertices_lookup.push([x, y, z]);
    }

    // Load normals_lookup
    if (keyword === 'vn') {
      const x = parseFloat(lineParts[1]);
      const y = parseFloat(lineParts[2]);
      const z = parseFloat(lineParts[3]);
      normals_lookup.push([x, y, z]);
    }

    // Load texture coordinates lookup
    if (keyword === 'vt') {
      const u = parseFloat(lineParts[1]);
      const v = parseFloat(lineParts[2]);
      texcoords_lookup.push([u, v]);
    }

    // Load face data. It's in the format of "f v1/vt1/vn1 v2/vt2/vn2 v3/vt3/vn3"
    if (keyword === 'f') {
      const faceVertices: number[][] = [];
      const faceNormals: number[][] = [];
      const faceTexcoords: number[][] = [];

      for (let i = 1; i < lineParts.length; ++i) {
        const facePart = lineParts[i].split('/');

        const vertexIndex = parseInt(facePart[0]);
        const vertex = vertices_lookup[vertexIndex - 1];
        faceVertices.push(vertex);

        const texcoordIndex = parseInt(facePart[1]);
        const texcoord = texcoords_lookup[texcoordIndex - 1];
        faceTexcoords.push(texcoord);

        const normalIndex = parseInt(facePart[2]);
        const normal = normals_lookup[normalIndex - 1];
        faceNormals.push(normal);
      }

      // Add vertices, normals and texture coordinates to the final arrays
      finalVertices.push(...faceVertices);
      finalNormals.push(...faceNormals);
      finalTexcoords.push(...faceTexcoords);
    }
  }

  return {
    vertices: finalVertices.flat().map((v) => v * 0.04),
    normals: finalNormals.flat(),
    texcoords: finalTexcoords.flat(),
  };
};
