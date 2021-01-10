export function hirom(offset: number) {
  return offset - 0xc00000;
}

export function withHeader(offset: number) {
  return offset + 0x200;
}

export const ROM_OFFSET_HEADER = 0x00ffb0;
export const ROM_OFFSET_LOCATION_LIST = hirom(0xed8f00);
export const ROM_OFFSET_LOCATION_NAME_POINTER_LIST = hirom(0xe68400);
export const ROM_OFFSET_LOCATION_NAMES = hirom(0xcef100);
export const ROM_OFFSET_TILESETS = hirom(0xde0000);
export const ROM_OFFSET_TILESET_POINTER_LIST = hirom(0xdfba00);
export const ROM_OFFSET_ANIMATED_TILESET_POINTER_LIST = hirom(0xc091d5);
export const ROM_OFFSET_ANIMATED_TILESETS = hirom(0xc091ff);
export const ROM_OFFSET_ANIMATED_MAP_GRAPHICS = hirom(0xe60000);

export const ROM_TILESETS_SIZE = 0x01b400;

export const ROM_OFFSET_MAP_GRAPHICS_POINTER_LIST = hirom(0xdfda00);
export const ROM_OFFSET_MAP_GRAPHICS = hirom(0xdfdb00);

export const ROM_OFFSET_TILEMAPS = hirom(0xd9d1b0);
export const ROM_OFFSET_TILEMAP_POINTER_LIST = hirom(0xd9cd90);

export const ROM_TILEMAPS_SIZE = 0x042e50;

export const ROM_OFFSET_MAP_PALETTES = hirom(0xedc480);
export const ROM_MAP_PALETTE_SIZE = 256;
export const ROM_MAP_PALETTE_COUNT = 48;
export const ROM_MAP_PALETTES_SIZE =
  ROM_MAP_PALETTE_SIZE * ROM_MAP_PALETTE_COUNT;

export const ROM_OFFSET_EVENT_SCRIPTS = hirom(0xca0000);

export const ROM_OFFSET_NPC_POINTER_LIST = hirom(0xc41a10);
export const ROM_OFFSET_NPCS = hirom(0xc41d52);

export const ROM_OFFSET_SPRITES_POINTER_LIST_LO = hirom(0xc0d0f2);
export const ROM_OFFSET_SPRITES_POINTER_LIST_HI = hirom(0xc0d23c);
export const ROM_OFFSET_SPRITE_FORMATION = hirom(0xc0ce3a);

export const ROM_OFFSET_FIELD_SPRITES_GRAPHICS = hirom(0xd50000);

export const ROM_OFFSET_SPRITE_TILE_FORMATIONS = hirom(0xc0ce3a);

export const ROM_OFFSET_CHARACTER_PALETTES = hirom(0xe68000);

export const ROM_MAP_CHARACTER_PALETTE_SIZE = 32;

export const ROM_OFFSET_INITIAL_NPC_EVENT_BITS = hirom(0xc0e0a0);

export const ROM_OFFSET_MAP_EVENT_POINTER_LIST = hirom(0xd1fa00);

export const ROM_OFFSET_DIALOG = hirom(0xcd0000);
export const ROM_OFFSET_DIALOG_POINTER_LIST = hirom(0xcce602);

export const ROM_OFFSET_VARIABLE_WIDTH_FONT = hirom(0xc48fc0);
export const ROM_VARIABLE_WIDTH_FONT_SIZE = 0x1500;

export const ROM_OFFSET_VARIABLE_WIDTH_FONT_GRAPHICS = hirom(0xc490c0);
export const ROM_VARIABLE_WIDTH_FONT_GRAPHICS_SIZE = 0x1400;

export const ROM_OFFSET_WINDOW_GRAPHICS = hirom(0xed0000);
export const ROM_WINDOW_GRAPHIC_SIZE = 896;
export const ROM_WINDOW_GRAPHIC_COUNT = 8;

export const ROM_OFFSET_WINDOW_PALETTES = hirom(0xed1c00);
export const ROM_WINDOW_PALETTE_SIZE = 32;
export const ROM_WINDOW_PALETTE_COUNT = 8;

export const ROM_OFFSET_MAP_PARALLAX = hirom(0xc0fe40);
export const ROM_MAP_PARALLAX_COUNT = 21;
export const ROM_MAP_PARALLAX_SIZE = 8;

export const ROM_OFFSET_BG3_GRAPHIC_POINTER_LIST = hirom(0xe6cd60);
export const ROM_OFFSET_BG3_GRAPHICS = hirom(0xe68780);

export const ROM_OFFSET_ANIMATED_BG3_TILESET_POINTER_LIST = hirom(0xc0979f);
export const ROM_OFFSET_ANIMATED_BG3_TILESETS = hirom(0xc097ad);
export const ROM_OFFSET_ANIMATED_BG3_GRAPHICS_POINTER_LIST = hirom(0xe6cda0);
export const ROM_OFFSET_ANIMATED_BG3_GRAPHICS = hirom(0xe6cdc0);

export const ROM_OFFSET_MAP_PALETTE_ANIMATIONS = hirom(0xc09825);
export const ROM_MAP_PALETTE_ANIMATION_SIZE = 12;
export const ROM_MAP_PALETTE_ANIMATION_COUNT = 10;

export const ROM_OFFSET_MAP_PALETTE_ANIMATION_PALETTES = hirom(0xe6f200);
export const ROM_MAP_PALETTE_ANIMATION_PALETTE_SIZE = 32;

export const ROM_OFFSET_COLOR_MATH = hirom(0xc0fe00);
export const ROM_COLOR_MATH_SIZE = 3;
