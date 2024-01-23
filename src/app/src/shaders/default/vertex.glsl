#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// all shaders have a main function
void main() {
    gl_Position = vec4(a_position, 0, 1);
}