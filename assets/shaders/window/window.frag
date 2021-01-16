#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D al_tex;
uniform bool al_use_tex;
uniform bool gradient_uses_window_height;
uniform float screen_height;
uniform float window_height;
uniform float segments;
uniform bool smooth_gradient;
uniform float top;
uniform float bottom;
varying vec4 varying_color;
varying vec2 varying_texcoord;

float map(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

float getYForGradient() {
	if (!gradient_uses_window_height) {
		return (gl_FragCoord.y / screen_height);
	}
	else {
		return varying_texcoord.y;
	}
}

void main()
{
	float ypos = getYForGradient();

	float quantized = map(ypos, 0.0, 1.0, 0.0, segments - 1.0);

	if (!smooth_gradient) {
		quantized = ceil(quantized);
	}

	vec4 color = texture2D(al_tex, varying_texcoord) * varying_color;

	color += map(quantized, 0.0, segments - 1.0, bottom, top);
	color.w = 1.0;

	gl_FragColor = color;
}
