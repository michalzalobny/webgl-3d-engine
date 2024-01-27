#version 300 es

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelViewMatrix;


out vec2 v_uv;


void main() {
    gl_Position =  u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
    v_uv = a_uv;
}