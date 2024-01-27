import { mat4 } from "gl-matrix";

interface MakeProjectionMatrix {
  fov: number;
  aspect_ratio: number;
  near: number;
  far: number;
}

export class Camera {
  perspectiveProjectionMatrix;
  orthoProjectionMatrix;

  constructor() {
    this.perspectiveProjectionMatrix = mat4.create();
    this.orthoProjectionMatrix = mat4.create();
  }

  private makePerspectiveProjMatrix(props: MakeProjectionMatrix) {
    const { fov, aspect_ratio, near, far } = props;

    const r = near * Math.tan(fov / 2.0) * aspect_ratio; // aspect_ratio = width / height
    const t = near * Math.tan(fov / 2.0);
    const f = far;

    const l = -r;
    const b = -t;
    const n = near;

    const out = mat4.create();

    //Perspective projection: https://www.songho.ca/opengl/gl_projectionmatrix.html
    out[0] = (2 * n) / (r - l); // m[0][0]
    out[5] = (2 * n) / (t - b); // m[1][1]
    out[8] = (r + l) / (r - l); // m[2][0]
    out[9] = (t + b) / (t - b); // m[2][1]
    out[10] = -(f + n) / (f - n); // m[2][2]
    out[11] = -1.0; // m[2][3]
    out[14] = -(2 * f * n) / (f - n); // m[3][2]
    out[15] = 0.0; // m[3][3]

    return out;
  }

  private makeOrthoProjMatrix(props: MakeProjectionMatrix) {
    const { fov, aspect_ratio, near, far } = props;

    const r = near * Math.tan(fov / 2.0) * aspect_ratio; // aspect_ratio = width / height
    const t = near * Math.tan(fov / 2.0);
    const f = far;

    const l = -r;
    const b = -t;
    const n = near;

    const out = mat4.create();

    //Orthographic projection: https://www.songho.ca/opengl/gl_projectionmatrix.html
    out[0] = 2 / (r - l); // m[0][0]
    out[5] = 2 / (t - b); // m[1][1]
    out[10] = -2 / (f - n); // m[2][2]
    out[12] = -(r + l) / (r - l); // m[0][3]
    out[13] = -(t + b) / (t - b); // m[1][3]
    out[14] = -(f + n) / (f - n); // m[2][3]
    out[15] = 1.0; // m[3][3]

    return out;
  }

  updateProjectionMatrix(props: MakeProjectionMatrix) {
    this.perspectiveProjectionMatrix = this.makePerspectiveProjMatrix(props);
    this.orthoProjectionMatrix = this.makeOrthoProjMatrix(props);
  }
}
