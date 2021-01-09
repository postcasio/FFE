attribute vec4 al_color;
attribute vec4 al_pos;
attribute vec2 al_texcoord;

uniform mat4 al_projview_matrix;

// input to fragment shader
varying vec4 varying_color;
varying vec2 varying_texcoord;

void main()
{
	gl_Position = al_projview_matrix * al_pos;
	varying_color = al_color;
	varying_texcoord = al_texcoord;
}
