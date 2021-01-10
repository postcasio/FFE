#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D al_tex;
uniform bool al_use_tex;

struct Layer {
	sampler2D tex;
	bool wavy_effect;
	bool wavy_effect_battle;
	vec2 offset;
	int depth;
	bool subscreen;
	bool mainscreen;
	bool math;
};

uniform Layer layers[8];

uniform float t;

uniform vec2 output_size;
uniform vec2 layer_sizes[8];
uniform vec2 layer_offsets[8];

varying vec2 layer_texcoords[8];
varying vec2 texcoords;

uniform float math_sign;
uniform float math_multiplier;

#define MAX_WAVY_DISPLACEMENT_Y 1.0

vec4 getLayerColor(int layer, vec2 uv) {
	return texture2D(layers[layer].tex, uv);
}

vec4 paletteLookup(vec4 color) {
	float paletteX = color.r;
	float paletteY = color.g;

	return texture2D(al_tex, vec2(paletteX, 1.0 - paletteY));
}

vec2 apply_uv_modifiers(int layer) {
	vec2 uv = layer_texcoords[layer];

	uv = fract(uv);

	if (layers[layer].wavy_effect) {
		float amplitudey = sin(t*2.0) * sin(texcoords.y * 76.0);
		// float amplitudey = sin(t / 20.0 + uv.y * 48.0);

		vec2 displacement = vec2(
			0.0,
			ceil(amplitudey * MAX_WAVY_DISPLACEMENT_Y + 0.5) / layer_sizes[layer]
		);

		uv -= displacement;
	}

	return uv;
}

vec4 doColorMath(vec4 main, vec4 sub, int layer) {
	if (!layers[layer].math || length(sub.xyz) < 0.00001) {
		return main;
	}
	else {
		if (math_sign < 0.0) {
			return clamp(vec4(((sub - main) * math_multiplier).xyz, 1.0), 0.0, 1.0);
		}
		else {
			return clamp(vec4(((sub + main) * math_multiplier).xyz, 1.0), 0.0, 1.0);
		}
		// return clamp(vec4(((sub) + (main) * math_sign).xyz * math_multiplier, 1.0), 0.0, 1.0);
	}
}

void main() {
	// render sub screen
	int depth = 0;
	vec4 color_sub = vec4(0.0, 0.0, 0.0, 0.0);
	vec4 color_main = vec4(0.0, 0.0, 0.0, 0.0);

	for (int i = 0; i < 8; i++) {
		if (!layers[i].subscreen) {
			continue;
		}

		vec2 uv = apply_uv_modifiers(i);


		vec4 entry = getLayerColor(i, uv);

		if (entry.w > 0.5 && layers[i].depth > depth) {
			vec4 color = paletteLookup(entry);
			color_sub = color;
			depth = layers[i].depth;
		}
	}

	depth = 0;

	for (int j = 0; j < 8; j++) {
		if (!layers[j].mainscreen) {
			continue;
		}

		vec2 uv = apply_uv_modifiers(j);

		vec4 entry = getLayerColor(j, uv);

		if (entry.w > 0.5 && layers[j].depth > depth) {
			vec4 color = paletteLookup(entry);

			if (color_sub.w > 0.5) {
				color_main = doColorMath(color, color_sub, j);
			}
			else {
				color_main = color;
			}
			depth = layers[j].depth;
		}
	}

	gl_FragColor = color_main;
	// gl_FragColor = texture2D(layers[5].tex, layer_texcoords[5]);
	// gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
