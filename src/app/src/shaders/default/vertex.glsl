#version 300 es

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;

out vec2 v_uv;

// all shaders have a main function
void main() {
    gl_Position = vec4(a_position, 1.0);

    v_uv = a_uv;
}