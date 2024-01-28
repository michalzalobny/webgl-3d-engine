#version 300 es

precision highp float;

in vec2 v_uv;
in vec3 v_normal;

uniform sampler2D u_image;
uniform sampler2D u_image2;
uniform float u_time;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {

  vec2 uv = v_uv;
  uv.y = 1.0 - uv.y;
  // uv.x = 1.0 - uv.x;
  
  vec4 color = texture(u_image, uv);
  vec4 color2 = texture(u_image2, uv);
  float t = (sin(u_time) + 1.0) * 0.5;
  vec4 finalColor = mix(color, color2, t);
    
  outColor = finalColor;
}
    