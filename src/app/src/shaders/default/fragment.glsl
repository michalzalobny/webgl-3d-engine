#version 300 es

precision highp float;

in vec2 v_uv;
in vec3 v_normal;

uniform sampler2D u_image;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {

  vec2 uv = v_uv;
  uv.y = 1.0 - uv.y;
  // uv.x = 1.0 - uv.x;
  
  vec4 color = texture(u_image, uv);
    
  outColor = color;
}
    