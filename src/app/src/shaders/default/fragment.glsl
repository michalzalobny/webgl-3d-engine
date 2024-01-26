#version 300 es

precision highp float;

in vec2 v_uv;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = vec4(v_uv, 0.0, 1);
}
    