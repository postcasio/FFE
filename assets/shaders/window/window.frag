#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D al_tex;
uniform bool al_use_tex;
uniform float screen_height;
uniform bool smooth_gradient;

varying vec4 varying_color;
varying vec2 varying_texcoord;

float map(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

void main()
{
	float ypos = (gl_FragCoord.y / screen_height) - (4.0 / screen_height);

	float quantized = map(ypos, 0.0, 1.0, 0.0, 31.0);

	if (!smooth_gradient) {
		quantized = ceil(quantized);
	}

	vec4 color = texture2D(al_tex, varying_texcoord) * varying_color;

	color += map(quantized, 0.0, 31.0, -0.4, 0.3);
	color.w = 1.0;

	gl_FragColor = color;
}
