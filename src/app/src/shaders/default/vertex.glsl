#version 300 es

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;

out vec2 v_uv;
out vec3 v_normal;
out mat4 v_modelMatrix;
out mat4 v_viewMatrix;


void main() {
    gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.0);
    v_uv = a_uv;
    v_normal = a_normal;
    v_modelMatrix = u_modelMatrix;
    v_viewMatrix = u_viewMatrix;

    // Used only in Point rendering mode
    gl_PointSize = 8.0;
    gl_PointSize = gl_PointSize / gl_Position.w;
}