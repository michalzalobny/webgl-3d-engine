#version 300 es

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;

out vec2 v_uv;
out vec3 v_fragNormal;
out vec3 v_fragPosition;

void main() {
    vec4 worldPosition = u_modelMatrix * vec4(a_position, 1.0);
    vec4 viewPosition = u_viewMatrix * worldPosition;

    gl_Position = u_projectionMatrix * viewPosition;
    // Used only in Point rendering mode
    gl_PointSize = 8.0;
    gl_PointSize = gl_PointSize / gl_Position.w;

    // Transform normal to world space (using the inverse transpose for normals)
    vec4 normal = vec4(a_normal, 0.0);
    mat4 normalMatrix = transpose(inverse(u_modelMatrix));
    normal = normalize(normalMatrix * normal);
    // Transform normal to view space
    normal = normalize(u_viewMatrix * normal);

    v_fragPosition = vec3(viewPosition);
    v_fragNormal = normal.xyz;
    v_uv = a_uv; 
}