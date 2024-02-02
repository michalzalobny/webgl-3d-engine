import { mat4, vec3 } from 'gl-matrix';

interface MakeProjectionMatrix {
  fov: number;
  aspect_ratio: number;
  near: number;
  far: number;
}

interface MakeLookAtMatrix {
  eye?: vec3;
  target?: vec3;
  up?: vec3;
}

export class Camera {
  public perspectiveProjectionMatrix = mat4.create();
  public orthoProjectionMatrix = mat4.create();
  public viewMatrix = mat4.create();

  public position = vec3.fromValues(0, 0, 0.36);
  private target = vec3.fromValues(0, 0, -1);
  private up = vec3.fromValues(0, 1, 0);

  constructor() {
    this.viewMatrix = this.makeLookAtMatrix({
      eye: this.position,
      target: this.target,
      up: this.up,
    });
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

  private makeLookAtMatrix(props: MakeLookAtMatrix) {
    const { eye = this.position, target = this.target, up = this.up } = props;

    // LookAt matrix: https://www.songho.ca/opengl/gl_camera.html
    const forward = vec3.create();
    vec3.subtract(forward, eye, target);
    vec3.normalize(forward, forward);

    const left = vec3.create();
    vec3.cross(left, up, forward);
    vec3.normalize(left, left);

    const newUp = vec3.create();
    vec3.cross(newUp, forward, left);

    const out = mat4.create();

    out[0] = left[0];
    out[1] = newUp[0];
    out[2] = forward[0];
    out[3] = 0;

    out[4] = left[1];
    out[5] = newUp[1];
    out[6] = forward[1];
    out[7] = 0;

    out[8] = left[2];
    out[9] = newUp[2];
    out[10] = forward[2];
    out[11] = 0;

    out[12] = -left[0] * eye[0] - left[1] * eye[1] - left[2] * eye[2];
    out[13] = -newUp[0] * eye[0] - newUp[1] * eye[1] - newUp[2] * eye[2];
    out[14] = -forward[0] * eye[0] - forward[1] * eye[1] - forward[2] * eye[2];
    out[15] = 1;

    return out;
  }

  public updateProjectionMatrix(props: MakeProjectionMatrix) {
    this.perspectiveProjectionMatrix = this.makePerspectiveProjMatrix(props);
    this.orthoProjectionMatrix = this.makeOrthoProjMatrix(props);
  }

  public updateViewMatrix({ eye, target, up }: MakeLookAtMatrix) {
    this.viewMatrix = this.makeLookAtMatrix({ eye, target, up });
  }
}
