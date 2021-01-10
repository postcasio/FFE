attribute vec4 al_color;
attribute vec4 al_pos;
attribute vec2 al_texcoord;

uniform mat4 al_projview_matrix;
uniform vec2 layer_offsets[8];
uniform vec2 layer_sizes[8];
uniform vec2 output_size;

// input to fragment shader
varying vec2 layer_texcoords[8];
varying vec2 texcoords;

float map(float value, float inMin, float inMax, float outMin, float outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}

void main()
{
	gl_Position = al_projview_matrix * al_pos;
	texcoords = al_texcoord;

	for (int i = 0; i < 8; i++) {
		float layer_width = output_size.x / layer_sizes[i].x;
		float layer_height = output_size.y / layer_sizes[i].y;

		vec2 pixel_coords = vec2(
			map(al_texcoord.x, 0.0, 1.0, layer_offsets[i].x, layer_offsets[i].x + output_size.x),
			map(al_texcoord.y, 0.0, 1.0, layer_offsets[i].y + output_size.y, layer_offsets[i].y)
		);

		vec2 uv_coords = vec2(
			map(pixel_coords.x, 0.0, layer_sizes[i].x, 0.0, 1.0),
			map(pixel_coords.y, 0.0, layer_sizes[i].y, 1.0, 0.0)
		);

		layer_texcoords[i] = uv_coords;
	}
}
