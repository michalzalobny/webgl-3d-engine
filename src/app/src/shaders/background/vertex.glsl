#version 300 es

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;

uniform mat4 u_projectionMatrix;
uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;

out vec2 v_uv;

void main() {
    vec3 pos = a_position;
    // Clip space (GL_Position) is from -1 to 1.  
    // Your square is a 1x1, so it doesn't fill the complete space. 
    // Multiplying it by 2 makes it fill the whole range from -1 to 1
    // ~ Daniel Velasquez
    pos.xy *= 2.0;

    gl_Position = vec4(pos, 1.0);

    v_uv = a_uv; 
}