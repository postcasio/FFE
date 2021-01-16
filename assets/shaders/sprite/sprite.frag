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
	vec4 color = texture2D(al_tex, varying_texcoord) * varying_color;

	gl_FragColor = color;

	if (color.a < 0.5) {
		discard;
	}
}
