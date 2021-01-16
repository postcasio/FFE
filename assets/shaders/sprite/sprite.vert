attribute vec4 al_color;
attribute vec4 al_pos;
attribute vec2 al_texcoord;

uniform mat4 al_projview_matrix;

// input to fragment shader
varying vec4 varying_color;
varying vec2 varying_texcoord;

void main()
{
	gl_Position = al_projview_matrix * vec4(al_pos.x, al_pos.y, 0.0, al_pos.w);
	gl_Position.z = al_pos.z;
	varying_color = al_color;
	varying_texcoord = al_texcoord;
}
