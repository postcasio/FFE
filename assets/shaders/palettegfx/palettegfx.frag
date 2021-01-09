#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D al_tex;
uniform bool al_use_tex;

uniform sampler2D palette;

uniform vec2 tex_size;

uniform bool wavy_effect;
uniform bool wavy_effect_battle;
uniform float t;

varying vec4 varying_color;
varying vec2 varying_texcoord;

#define MAX_WAVY_DISPLACEMENT_X 2.0
#define MAX_WAVY_DISPLACEMENT_Y 1.0

void main() {
	vec2 texcoord = varying_texcoord;

	if (wavy_effect && !wavy_effect_battle) {

		float amplitudey = sin(t + varying_texcoord.y * tex_size.y / 2.0);

		vec2 displacement = vec2(
			0.0,
			floor(amplitudey * MAX_WAVY_DISPLACEMENT_Y + 0.5)
		);

		texcoord -= displacement / tex_size;
	}

	if (wavy_effect_battle) {

		float amplitudey = sin(t + varying_texcoord.y * tex_size.y / 2.0);
		float amplitudex = sin(2.0 + t + varying_texcoord.x * tex_size.x / 64.0);

		vec2 displacement = vec2(
			floor(amplitudex * sin(varying_texcoord.y) * MAX_WAVY_DISPLACEMENT_X + 0.5),
			floor(amplitudey * MAX_WAVY_DISPLACEMENT_Y + 0.5)
		);

		// displacement = vec2(amplitude / tex_width, amplitude / tex_height);

		if (!wavy_effect_battle) {
			displacement.x = 0.0;
		}

		texcoord -= displacement / tex_size;
	}

	vec4 color = texture2D(al_tex, texcoord);

	float paletteX = color.r;
	float paletteY = color.g;

	gl_FragColor = texture2D(palette, vec2(paletteX, 1.0 - paletteY));
	// gl_FragColor = color;

	gl_FragColor.w = color.w;
}
