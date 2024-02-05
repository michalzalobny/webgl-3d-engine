#version 300 es

precision highp float;

in vec2 v_uv;

uniform float u_time;
uniform sampler2D u_image;
uniform vec2 u_resolution;

// we need to declare an output for the fragment shader
out vec4 outColor;

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

float S(float a, float b, float t){
    return clamp((t - a) / (b - a), 0.0, 1.0);
}

vec2 Rain(vec2 uv, float t){
    t *= 40.0;
    vec2 a = vec2(3.0, 1.0);//aspect ratio
    vec2 st = uv * a;
    vec2 id = floor(st);
    st.y += t * 0.22;
    float n = fract(sin(id.x * 716.34) * 768.32);
    st.y += n; //offsets by random number in the given field 
    uv.y +=n;
    id = floor(st); //recalculate id because of shifting
    st = fract(st) - 0.5;
    t += fract(sin(id.x * 76.34 + id.y * 1453.7) * 768.32) * 2.0 * PI; 

    float y = -sin(t + sin(t + sin(t) * 0.5)) * 0.43;
    vec2 p1 = vec2(0.0, y);

    vec2 o1 = (st - p1)/a;
    float d = length(o1);
    float m1 = S(0.07, 0.0, d);

    vec2 o2 = (fract(uv * a.x * vec2(1.0, 2.0)) - 0.5) /  vec2(1.0, 2.0);
    d = length(o2);

    float m2 = S(0.3 * (0.5 - st.y), 0.0, d) * S( -.1, .1, st.y - p1.y);

    // if(st.x> .48 || st.y > .49) m1 = 1.0;
    return vec2(m1 * o1 * 10.0 + m2 * o2 * 2.0);
}

void main() {
  vec2 uv = v_uv;

  //fix uv aspect ratio
  vec2 uv_aspect = uv;

  float aspect = u_resolution.x / u_resolution.y;
  uv_aspect.x *= aspect;

   // Rain effect
  float t = u_time * 0.1;
  vec2 rainDistort = Rain(uv_aspect * 15.0, t) * 0.1;
  rainDistort += Rain(uv_aspect * 9.0, t) * 0.4;
  uv += rainDistort *0.4;

  float c = SmoothNoise2(vec2(uv_aspect.x + t * 1.3, uv_aspect.y + t *0.1));
  
  // Texture
  vec4 color = texture(u_image, uv);

  color = mix(color, vec4(c), 0.02);
  
  outColor = color;
}
    