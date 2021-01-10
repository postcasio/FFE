import { hex } from "../utils";
import { decodeLZSS } from "./LZSS";
import {
  hirom,
  ROM_COLOR_MATH_SIZE,
  ROM_MAP_CHARACTER_PALETTE_SIZE,
  ROM_MAP_PALETTE_ANIMATION_SIZE,
  ROM_MAP_PALETTE_SIZE,
  ROM_MAP_PARALLAX_SIZE,
  ROM_OFFSET_ANIMATED_BG3_GRAPHICS,
  ROM_OFFSET_ANIMATED_BG3_GRAPHICS_POINTER_LIST,
  ROM_OFFSET_ANIMATED_BG3_TILESETS,
  ROM_OFFSET_ANIMATED_BG3_TILESET_POINTER_LIST,
  ROM_OFFSET_ANIMATED_MAP_GRAPHICS,
  ROM_OFFSET_ANIMATED_TILESETS,
  ROM_OFFSET_ANIMATED_TILESET_POINTER_LIST,
  ROM_OFFSET_BG3_GRAPHICS,
  ROM_OFFSET_BG3_GRAPHIC_POINTER_LIST,
  ROM_OFFSET_CHARACTER_PALETTES,
  ROM_OFFSET_COLOR_MATH,
  ROM_OFFSET_FIELD_SPRITES_GRAPHICS,
  ROM_OFFSET_HEADER,
  ROM_OFFSET_LOCATION_LIST,
  ROM_OFFSET_LOCATION_NAMES,
  ROM_OFFSET_LOCATION_NAME_POINTER_LIST,
  ROM_OFFSET_MAP_EVENT_POINTER_LIST,
  ROM_OFFSET_MAP_GRAPHICS,
  ROM_OFFSET_MAP_GRAPHICS_POINTER_LIST,
  ROM_OFFSET_MAP_PALETTES,
  ROM_OFFSET_MAP_PALETTE_ANIMATIONS,
  ROM_OFFSET_MAP_PALETTE_ANIMATION_PALETTES,
  ROM_OFFSET_MAP_PARALLAX,
  ROM_OFFSET_NPCS,
  ROM_OFFSET_NPC_POINTER_LIST,
  ROM_OFFSET_SPRITES_POINTER_LIST_HI,
  ROM_OFFSET_SPRITES_POINTER_LIST_LO,
  ROM_OFFSET_SPRITE_TILE_FORMATIONS,
  ROM_OFFSET_TILEMAPS,
  ROM_OFFSET_TILEMAP_POINTER_LIST,
  ROM_OFFSET_TILESETS,
  ROM_OFFSET_TILESET_POINTER_LIST,
  ROM_OFFSET_VARIABLE_WIDTH_FONT,
  ROM_OFFSET_VARIABLE_WIDTH_FONT_GRAPHICS,
  ROM_OFFSET_WINDOW_GRAPHICS,
  ROM_OFFSET_WINDOW_PALETTES,
  ROM_VARIABLE_WIDTH_FONT_GRAPHICS_SIZE,
  ROM_VARIABLE_WIDTH_FONT_SIZE,
  ROM_WINDOW_GRAPHIC_COUNT,
  ROM_WINDOW_GRAPHIC_SIZE,
  ROM_WINDOW_PALETTE_COUNT,
  ROM_WINDOW_PALETTE_SIZE,
} from "./offsets";
import { Table } from "../Text/Table";

export class Slice {
  offset: number;
  length: number;
  data: Uint8Array;
  compressedLength?: number;

  constructor(offset: number, data: Uint8Array, compressedLength?: number) {
    this.offset = offset;
    this.data = data;
    this.length = data.length;
    this.compressedLength = compressedLength;
  }

  getArraySlice(start: number, end?: number) {
    return this.data.slice(start, end);
  }

  slice(start: number, end?: number) {
    return new Slice(this.offset + start, this.data.slice(start, end));
  }
}

export enum ExpansionRAM {
  None = 0x00,
  RAM_16K = 0x01,
  RAM_64K = 0x03,
  RAM_256K = 0x05,
  RAM_512K = 0x06,
  RAM_1M = 0x07,
}

export class ROM {
  path: string;
  file: DataView;

  makerCode: number;
  gameCode: number;
  expansionRam: ExpansionRAM;
  specialVersion: number;
  cartridgeType: number;
  romName: string;

  tables = {
    primary: Table.fromFile("@/assets/tables/ff3us.tbl"),
  };

  buffer: ArrayBuffer;

  constructor(path: string) {
    this.path = path;
    this.buffer = FS.readFile(path, DataType.Raw);
    this.file = new DataView(this.buffer);

    this.makerCode = this.getUint16(ROM_OFFSET_HEADER);
    this.gameCode = this.getUint32(ROM_OFFSET_HEADER + 2);
    this.expansionRam = this.getUint8(ROM_OFFSET_HEADER + 13);
    this.specialVersion = this.getUint8(ROM_OFFSET_HEADER + 14);
    this.cartridgeType = this.getUint8(ROM_OFFSET_HEADER + 15);
    this.romName = this.getString(ROM_OFFSET_HEADER + 16, 21).trim();
  }

  getName() {
    return this.romName;
  }

  getSize() {
    return this.file.byteLength;
  }

  getMapPaletteSetSlice(index: number) {
    const offset = ROM_OFFSET_MAP_PALETTES + ROM_MAP_PALETTE_SIZE * index;

    return new Slice(
      offset,
      this.getArraySlice(offset, offset + ROM_MAP_PALETTE_SIZE)
    );
  }

  getMapGraphicsSlice(index: number, length: number) {
    const graphicsetPointerOffset =
      ROM_OFFSET_MAP_GRAPHICS_POINTER_LIST + index * 3;
    const graphicsetPointer = this.getUint24(graphicsetPointerOffset);
    const graphicsetOffset = graphicsetPointer + ROM_OFFSET_MAP_GRAPHICS;

    return new Slice(
      graphicsetOffset,
      this.getArraySlice(graphicsetOffset, graphicsetOffset + length)
    );
  }

  getMapTilesetSlice(index: number) {
    const tilesetPointerOffset = ROM_OFFSET_TILESET_POINTER_LIST + index * 3;
    const tilesetPointer = this.getUint24(tilesetPointerOffset);
    const tilesetOffset = tilesetPointer + ROM_OFFSET_TILESETS;
    const compressedLength = this.getUint16(tilesetOffset);
    const decoded = decodeLZSS(
      this.getArraySlice(tilesetOffset, tilesetOffset + compressedLength)
    );

    if (decoded.compressedLength !== compressedLength) {
      SSj.log(
        `WARN: Decoded compressed length ${decoded.compressedLength} is not expected ${compressedLength}`
      );
    }

    return new Slice(tilesetOffset, decoded.data, compressedLength);
  }

  getMessagePaletteSetSlice() {
    return new Slice(
      ROM_OFFSET_WINDOW_PALETTES,
      this.getArraySlice(
        ROM_OFFSET_WINDOW_PALETTES,
        ROM_OFFSET_WINDOW_PALETTES +
          ROM_WINDOW_PALETTE_SIZE * ROM_WINDOW_PALETTE_COUNT
      )
    );
  }

  getMessageGraphicsSlice() {
    const graphicsOffset = ROM_OFFSET_WINDOW_GRAPHICS;

    return new Slice(
      graphicsOffset,
      this.getArraySlice(
        graphicsOffset,
        graphicsOffset + ROM_WINDOW_GRAPHIC_SIZE * ROM_WINDOW_GRAPHIC_COUNT
      )
    );
  }

  getVariableWidthFontCharacterWidthsSlice() {
    return new Slice(
      ROM_OFFSET_VARIABLE_WIDTH_FONT,
      this.getArraySlice(
        ROM_OFFSET_VARIABLE_WIDTH_FONT,
        ROM_OFFSET_VARIABLE_WIDTH_FONT + 256
      )
    );
  }

  getVariableWidthFontGraphicsSlice() {
    return new Slice(
      ROM_OFFSET_VARIABLE_WIDTH_FONT_GRAPHICS,
      this.getArraySlice(
        ROM_OFFSET_VARIABLE_WIDTH_FONT_GRAPHICS,
        ROM_OFFSET_VARIABLE_WIDTH_FONT_GRAPHICS +
          ROM_VARIABLE_WIDTH_FONT_GRAPHICS_SIZE
      )
    );
  }

  getMapPropertiesSlice(index: number) {
    const propertiesOffset = ROM_OFFSET_LOCATION_LIST + index * 33;

    return new Slice(
      propertiesOffset,
      this.getArraySlice(propertiesOffset, propertiesOffset + 33)
    );
  }

  getMapLayoutSlice(index: number) {
    const tilemapPointerOffset = ROM_OFFSET_TILEMAP_POINTER_LIST + index * 3;
    const tilemapPointer = this.getUint24(tilemapPointerOffset);
    const tilemapOffset = tilemapPointer + ROM_OFFSET_TILEMAPS;
    const compressedLength = this.getUint16(tilemapOffset);
    const decoded = decodeLZSS(
      this.getArraySlice(tilemapOffset, tilemapOffset + compressedLength)
    );
    if (decoded.compressedLength !== compressedLength) {
      SSj.log(
        `WARN: Decoded compressed length ${decoded.compressedLength} is not expected ${compressedLength}`
      );
    }

    return new Slice(tilemapOffset, decoded.data, compressedLength);
  }

  getMapParallaxSlice(index: number) {
    const offset = ROM_OFFSET_MAP_PARALLAX + index * ROM_MAP_PARALLAX_SIZE;
    return new Slice(
      offset,
      this.getArraySlice(offset, offset + ROM_MAP_PARALLAX_SIZE)
    );
  }

  getLayer3GraphicsSlice(index: number) {
    const graphicsPointerOffset =
      ROM_OFFSET_BG3_GRAPHIC_POINTER_LIST + index * 3;
    const graphicsPointer = this.getUint24(graphicsPointerOffset);
    const graphicsOffset = ROM_OFFSET_BG3_GRAPHICS + graphicsPointer;

    const compressedLength = this.getUint16(graphicsOffset);
    const decoded = decodeLZSS(
      this.getArraySlice(graphicsOffset, graphicsOffset + compressedLength)
    );

    if (decoded.compressedLength !== compressedLength) {
      SSj.log(
        `WARN: Decoded compressed length ${decoded.compressedLength} is not expected ${compressedLength}`
      );
    }

    return new Slice(graphicsOffset, decoded.data, compressedLength);
  }

  getMapPaletteAnimationSlice(index: number) {
    const animOffset =
      ROM_OFFSET_MAP_PALETTE_ANIMATIONS +
      index * ROM_MAP_PALETTE_ANIMATION_SIZE;
    return new Slice(
      animOffset,
      this.getArraySlice(
        animOffset,
        animOffset + ROM_MAP_PALETTE_ANIMATION_SIZE
      )
    );
  }

  getMapPaletteAnimationPaletteSetSlice() {
    const paletteOffset = ROM_OFFSET_MAP_PALETTE_ANIMATION_PALETTES;

    return new Slice(
      paletteOffset,
      this.getArraySlice(paletteOffset, paletteOffset + 656)
    );
  }

  getMapProperties(index: number) {
    const propertiesOffset = ROM_OFFSET_LOCATION_LIST + index * 33;

    return this.getArraySlice(propertiesOffset, propertiesOffset + 33);
  }

  getMapName(index: number) {
    const namePointerOffset = ROM_OFFSET_LOCATION_NAME_POINTER_LIST + index * 2;
    const nameOffset =
      ROM_OFFSET_LOCATION_NAMES + this.getUint16(namePointerOffset);

    return this.getStringz(nameOffset, 64, this.tables.primary);
  }

  getTileset(index: number) {
    const tilesetPointerOffset = ROM_OFFSET_TILESET_POINTER_LIST + index * 3;
    const tilesetPointer = this.getUint24(tilesetPointerOffset);
    const tilesetOffset = tilesetPointer + ROM_OFFSET_TILESETS;
    const compressedLength = this.getUint16(tilesetOffset);
    const decoded = decodeLZSS(
      this.getArraySlice(tilesetOffset, tilesetOffset + compressedLength)
    );

    if (decoded.compressedLength !== compressedLength) {
      SSj.log(
        `WARN: Decoded compressed length ${decoded.compressedLength} is not expected ${compressedLength}`
      );
    }
    return decoded.data;
  }

  getBG3AnimatedGraphics(index: number) {
    const tilesetPointerOffset =
      ROM_OFFSET_ANIMATED_BG3_GRAPHICS_POINTER_LIST + index * 3;
    const tilesetPointer = this.getUint24(tilesetPointerOffset);
    const tilesetOffset = tilesetPointer + ROM_OFFSET_ANIMATED_BG3_GRAPHICS;
    const compressedLength = this.getUint16(tilesetOffset);
    const decoded = decodeLZSS(
      this.getArraySlice(tilesetOffset, tilesetOffset + compressedLength)
    );

    if (decoded.compressedLength !== compressedLength) {
      SSj.log(
        `WARN: Decoded compressed length ${decoded.compressedLength} is not expected ${compressedLength}`
      );
    }
    return decoded.data;
  }

  getSpriteGraphicsSlice(index: number) {
    const loPointerOffset = ROM_OFFSET_SPRITES_POINTER_LIST_LO + index * 2;
    const hiPointerOffset = ROM_OFFSET_SPRITES_POINTER_LIST_HI + index * 2;
    const hiPointer = this.getUint16(hiPointerOffset);
    const graphicsOffset = hirom(
      ((hiPointer << 16) | this.getUint16(loPointerOffset)) & 0xffffff
    );
    const nextGraphicsOffset = hirom(
      ((this.getUint16(hiPointerOffset + 2) << 16) |
        this.getUint16(loPointerOffset + 2)) &
        0xffffff
    );

    return new Slice(
      graphicsOffset,
      this.getArraySlice(graphicsOffset, nextGraphicsOffset)
    );
  }

  getCharacterPaletteSlice(index: number) {
    const offset =
      ROM_OFFSET_CHARACTER_PALETTES + ROM_MAP_CHARACTER_PALETTE_SIZE * index;

    return new Slice(
      offset,
      this.getArraySlice(offset, offset + ROM_MAP_CHARACTER_PALETTE_SIZE)
    );
  }

  getAnimatedMapGraphicsSlice() {
    return new Slice(
      ROM_OFFSET_ANIMATED_MAP_GRAPHICS,
      this.getArraySlice(
        ROM_OFFSET_ANIMATED_MAP_GRAPHICS,
        ROM_OFFSET_ANIMATED_MAP_GRAPHICS + 0x8000
      )
    );
  }

  getAnimatedMapTilesetSlice(index: number) {
    const tilesetPointerOffset =
      ROM_OFFSET_ANIMATED_TILESET_POINTER_LIST + index * 2;
    const tilesetPointer = this.getUint16(tilesetPointerOffset);
    const tilesetOffset = tilesetPointer + ROM_OFFSET_ANIMATED_TILESETS;

    return new Slice(
      tilesetOffset,
      this.getArraySlice(tilesetOffset, tilesetOffset + 10 * 16)
    );
  }

  getColorMathSlice(index: number) {
    const offset = ROM_OFFSET_COLOR_MATH + index * ROM_COLOR_MATH_SIZE;
    return new Slice(
      offset,
      this.getArraySlice(offset, offset + ROM_COLOR_MATH_SIZE)
    );
  }

  getAnimatedTileset(index: number) {
    const tilesetPointerOffset =
      ROM_OFFSET_ANIMATED_TILESET_POINTER_LIST + index * 2;
    const tilesetPointer = this.getUint16(tilesetPointerOffset);
    const tilesetOffset = tilesetPointer + ROM_OFFSET_ANIMATED_TILESETS;

    return this.getArraySlice(tilesetOffset, tilesetOffset + 10 * 10);
  }

  getAnimatedBG3Tileset(index: number) {
    const tilesetPointerOffset =
      ROM_OFFSET_ANIMATED_BG3_TILESET_POINTER_LIST + index * 2;
    const tilesetPointer = this.getUint16(tilesetPointerOffset);
    const tilesetOffset = tilesetPointer + ROM_OFFSET_ANIMATED_BG3_TILESETS;

    return this.getArraySlice(tilesetOffset, tilesetOffset + 10 * 20);
  }

  getLayout(index: number) {
    const tilemapPointerOffset = ROM_OFFSET_TILEMAP_POINTER_LIST + index * 3;
    const tilemapPointer = this.getUint24(tilemapPointerOffset);
    const tilemapOffset = tilemapPointer + ROM_OFFSET_TILEMAPS;
    const compressedLength = this.getUint16(tilemapOffset);
    const decoded = decodeLZSS(
      this.getArraySlice(tilemapOffset, tilemapOffset + compressedLength)
    );
    if (decoded.compressedLength !== compressedLength) {
      SSj.log(
        `WARN: Decoded compressed length ${decoded.compressedLength} is not expected ${compressedLength}`
      );
    }
    return decoded.data;
  }

  getUint32(offset: number) {
    return this.file.getUint32(offset, true);
  }

  getUint24(offset: number) {
    return (
      this.file.getUint16(offset, true) | (this.file.getUint8(offset + 2) << 16)
    );
  }

  getUint16(offset: number) {
    return this.file.getUint16(offset, true);
  }

  getUint8(offset: number) {
    return this.file.getUint8(offset);
  }

  getString(offset: number, length: number) {
    let str = "";

    for (let i = 0; i < length; i++) {
      str += String.fromCharCode(this.file.getUint8(offset + i));
    }

    return str;
  }

  getStringz(offset: number, maxLength = 256, table?: Table) {
    let str = "";

    for (let i = 0; i < maxLength; i++) {
      const c = this.file.getUint8(offset + i);

      if (c === 0) {
        break;
      }

      str += table ? table.decode(c) : String.fromCharCode(c);
    }

    return str;
  }

  getArraySlice(offset: number, end?: number) {
    return new Uint8Array(this.buffer).slice(offset, end);
  }

  getNPCData(index: number) {
    const npcDataPointerOffset = ROM_OFFSET_NPC_POINTER_LIST + index * 2;
    const npcDataPointer = this.getUint16(npcDataPointerOffset);
    const nextNpcDataPointer = this.getUint16(npcDataPointerOffset + 2);
    const length = nextNpcDataPointer - npcDataPointer;

    const npcDataOffset = npcDataPointer + ROM_OFFSET_NPC_POINTER_LIST;

    return this.getArraySlice(npcDataOffset, npcDataOffset + length);
  }

  getMapEventPointer(index: number) {
    const pointerOffset = ROM_OFFSET_MAP_EVENT_POINTER_LIST + index * 3;
    const pointer = this.getUint24(pointerOffset);

    return pointer;
  }

  getSpriteTileLayout(index: number) {
    return this.getArraySlice(
      ROM_OFFSET_SPRITE_TILE_FORMATIONS + index * 12,
      ROM_OFFSET_SPRITE_TILE_FORMATIONS + (index + 1) * 12
    );
  }
}
