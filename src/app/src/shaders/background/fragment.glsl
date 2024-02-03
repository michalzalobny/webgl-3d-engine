#version 300 es

precision highp float;

in vec2 v_uv;

uniform float u_time;

uniform vec2 u_resolution;

#define PI 3.14159265359

float N21 (vec2 p){
    return fract(sin(p.x * 100.0 + p.y * 657.0) * 5647.0);
}

float SmoothNoise(vec2 uv){
    vec2 lv = fract(uv);
    vec2 id = floor(uv);

    lv = lv * lv * (3.0 - 2.0 * lv); //3x^2 - 2x^3

    float bl = N21(id);
    float br = N21(id + vec2(1.0, 0.0));
    float b = mix(bl, br, lv.x);

    float tl = N21(id + vec2(0.0, 1.0));
    float tr = N21(id + vec2(1.0, 1.0));
    float t = mix(tl, tr, lv.x);

    return mix(b, t, lv.y);
}

float SmoothNoise2(vec2 uv){
    float c = SmoothNoise(uv * 4.0);
    c += SmoothNoise(uv * 8.0) * 0.5;
    c += SmoothNoise(uv * 16.0) * 0.25;
    c += SmoothNoise(uv * 32.0) * 0.125;
    c += SmoothNoise(uv * 65.0) * 0.0625;

    return c /= 1.9375; // (sum of all possible maximum values)so that it's always between 0 - 1
}

// we need to declare an output for the fragment shader
out vec4 outColor;


void main() {
  vec2 uv = v_uv;

  //fix uv aspect ratio
  float aspect = u_resolution.x / u_resolution.y;
  uv.x *= aspect * 0.5;

  float t = u_time * 0.1;

  vec3 color1 = vec3(0.12, 0.12, 0.12);
  vec3 color2 = vec3(0.7, 0.7, 0.7);
  vec3 colorMixed = mix(color1, color2, uv.y);
  
  float c = SmoothNoise2(vec2(uv.x + t * 1.3, uv.y + t *0.1));
  float c2 = SmoothNoise2(vec2(uv.x + t * 8.0, uv.y));
  c = mix(c, c2, 0.2);

  colorMixed = mix(colorMixed, vec3(c), 0.31);

  outColor = vec4(colorMixed, 1.0);
}
    