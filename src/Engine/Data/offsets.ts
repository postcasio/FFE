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
export const ROM_VARIABLE_WIDTH_FONT_GRAPHICS_SIZE = 0xdc0;

export const ROM_OFFSET_CHOICE_POINTER_GRAPHICS = hirom(0xc08832);
export const ROM_CHOICE_POINTER_GRAPHICS_SIZE = 11;

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

export const ROM_OFFSET_MAP_TRIGGER_POINTER_LIST = hirom(0xc40000);
export const ROM_OFFSET_MAP_TRIGGERS = hirom(0xc40000);

export const ROM_OFFSET_SPRITE_ANIM_VEHICLE_MOVEMENT = hirom(0xc0580d);
export const ROM_OFFSET_SPRITE_ANIM_CHARACTER_MOVEMENT = hirom(0xc0581d);
export const ROM_OFFSET_SPRITE_ANIM_CHARACTER_STANDING = hirom(0xc0582d);
export const ROM_OFFSET_SPRITE_ANIM_SPECIAL = hirom(0xc0582d);

export const ROM_OFFSET_MAP_TILE_PROPERTIES_POINTER_LIST = hirom(0xd9cd10);
export const ROM_OFFSET_MAP_TILE_PROPERTIES = hirom(0xd9a800);

export const ROM_OFFSET_DIALOG_PAGE_INDEX = hirom(0xcce600);

export const ROM_OFFSET_SINGLE_TILE_EXIT_POINTER_LIST = hirom(0xdfbb00);
export const ROM_OFFSET_MULTI_TILE_EXIT_POINTER_LIST = hirom(0xedf480);
export const ROM_OFFSET_CHARACTER_NAMES = hirom(0xc478c0);

export const ROM_OFFSET_FIXED_WIDTH_FONT_GRAPHICS = hirom(0xc487c0);
export const ROM_FIXED_WIDTH_FONT_GRAPHICS_SIZE = 0x800;

export const ROM_OFFSET_CURSOR_GRAPHICS = hirom(0xed5ac0);
export const ROM_CURSOR_GRAPHICS_SIZE = 0x800;

export const ROM_OFFSET_MENU_PALETTES = hirom(0xd8e800);
export const ROM_MENU_PALETTES_SIZE = 0xa0;
