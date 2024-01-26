#version 300 es
  precision highp float;
 
  in vec3 v_normal;
 
  uniform vec4 u_diffuse;
  uniform vec3 u_lightDirection;
 
  out vec4 outColor;
 
  void main () {
    vec3 normal = normalize(v_normal);
    float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
    outColor = vec4(u_diffuse.rgb * fakeLight, u_diffuse.a);
  }