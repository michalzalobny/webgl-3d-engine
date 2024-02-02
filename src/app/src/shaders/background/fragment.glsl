#version 300 es

precision highp float;

in vec2 v_uv;

uniform float u_time;

// we need to declare an output for the fragment shader
out vec4 outColor;


void main() {
  vec2 uv = v_uv;

  vec3 color1 = vec3(0.4, 0.4, 0.4);
  vec3 color2 = vec3(0.85, 0.85, 0.85);

  vec3 colorMixed = mix(color1, color2, uv.y + uv.x);

  vec4 color = vec4(colorMixed, 1.0);

  outColor = color;
}
    