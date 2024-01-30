#version 300 es

precision highp float;

in vec2 v_uv;
in vec3 v_fragNormal;
in vec3 v_fragPosition;

uniform sampler2D u_image;
uniform float u_time;
uniform vec3 u_cameraPositionWorld;
uniform mat4 u_viewMatrix;

// we need to declare an output for the fragment shader
out vec4 outColor;

#define PI 3.14159265359

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
    return vec2(m1 * o1 * 30.0 + m2 * o2 * 10.0);
}

void main() {
  vec2 uv = v_uv;
  uv.y = 1.0 - uv.y;

  // Rain effect
  float t = u_time * 0.1;
  vec2 rainDistort = Rain(vec2(uv.y, 1.0-uv.x) * 5.0, t) * 0.5;
  rainDistort += Rain(vec2(uv.y, 1.0-uv.x) * 7.0, t) * 0.5;
  uv += rainDistort;

  // Texture
  vec4 color = texture(u_image, uv);

  // Lighting
  vec3 lightPositionWorld = vec3(1.0, 3.0, 3.0);

  // Normal vector in view space
  vec3 normal = normalize(v_fragNormal);

  // Ambient lighting
  float ambient = 0.37;

  // Diffuse lighting
  vec3 lightPosition_view = (u_viewMatrix * vec4(lightPositionWorld, 1.0)).xyz;
  vec3 lightDirection = normalize(lightPosition_view - v_fragPosition); 
  float diffuse = max(dot(normal, lightDirection), 0.0);

  // View direction in view space
  vec3 viewPosition = (u_viewMatrix * vec4(u_cameraPositionWorld, 1.0)).xyz;
  vec3 viewDirection = normalize(v_fragPosition - viewPosition);

  // Specular lighting
  vec3 reflectDirection = reflect(lightDirection, normal);
  float specularStrength = 0.5;
  float shininess = 32.0;
  float specular = pow(max(dot(viewDirection, reflectDirection), 0.0), shininess) * specularStrength;

  // Apply lighting
  vec3 lighting = vec3(ambient + diffuse + specular);
  color.rgb *= lighting;

  outColor = color;
}
    