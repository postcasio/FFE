#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D al_tex;
uniform bool al_use_tex;
uniform vec4 mask;

varying vec4 varying_color;
varying vec2 varying_texcoord;

void main()
{
	gl_FragColor = mask;
}
