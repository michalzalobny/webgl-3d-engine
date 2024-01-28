#version 300 es

precision highp float;

in vec2 v_uv;
in vec3 v_normal;
in mat4 v_modelMatrix;
in mat4 v_viewMatrix;

uniform sampler2D u_image;
uniform float u_time;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {

  vec2 uv = v_uv;
  uv.y = 1.0 - uv.y;

  vec4 color = texture(u_image, uv);

  vec3 normal = v_normal;
  normal = (v_modelMatrix * vec4(normal, 0.0)).xyz;
  normal = normalize(normal);

  // Ambient lighting
  float ambient = 0.12;

  // Diffuse lighting
  vec3 lightPosition = vec3(0.0, 2.0, 3.0);
  vec3 lightDirection = normalize(lightPosition);
  float diffuse = max(dot(normal, lightDirection), 0.0);

  // Specular lighting
  vec3 viewDirection = normalize(vec3(0.0, 0.0, 1.0) - normal);
  vec3 reflectDirection = reflect(-lightDirection, normal);
  float specular = pow(max(dot(viewDirection, reflectDirection), 0.0), 32.0);
  
  // Apply lighting
  color.rgb *= diffuse;
  color.rgb += specular;
  color.rgb += ambient;

  outColor = color;
}
    