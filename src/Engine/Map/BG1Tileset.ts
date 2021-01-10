import Prim from "prim";
import { Slice } from "../Data/ROM";
import { Graphics } from "../Graphics/Graphics";
import { PaletteSet } from "../Graphics/PaletteSet";
import { AnimatedTileset } from "./AnimatedTileset";
import { Tileset } from "./Tileset";

interface Tile {
  subtiles: {
    index: number;
    palette: number;
    priority: boolean;
    mirrored: boolean;
    inverted: boolean;
  }[];
}

export class BG1Tileset implements Tileset {
  offset: number;
  tiles: Tile[] = [];
  graphics: Graphics;
  paletteSet: PaletteSet;
  animatedTileset: AnimatedTileset;

  constructor(
    slice: Slice,
    graphics: Graphics,
    paletteSet: PaletteSet,
    animatedTileset: AnimatedTileset
  ) {
    this.offset = slice.offset;
    this.graphics = graphics;
    this.paletteSet = paletteSet;
    this.animatedTileset = animatedTileset;

    for (let i = 0; i < 0x100; i++) {
      const attrsTopLeft = slice.data[0x400 + i];
      const attrsTopRight = slice.data[0x500 + i];
      const attrsBottomLeft = slice.data[0x600 + i];
      const attrsBottomRight = slice.data[0x700 + i];

      this.tiles.push({
        subtiles: [
          {
            index: ((attrsTopLeft & 0x03) << 8) | slice.data[i],
            palette: (attrsTopLeft & 0x1c) >> 2,
            priority: (attrsTopLeft & 0x20) != 0,
            mirrored: (attrsTopLeft & 0x40) != 0,
            inverted: (attrsTopLeft & 0x80) != 0,
          },
          {
            index: ((attrsTopRight & 0x03) << 8) | slice.data[0x100 + i],
            palette: (attrsTopRight & 0x1c) >> 2,
            priority: (attrsTopRight & 0x20) != 0,
            mirrored: (attrsTopRight & 0x40) != 0,
            inverted: (attrsTopRight & 0x80) != 0,
          },
          {
            index: ((attrsBottomLeft & 0x03) << 8) | slice.data[0x200 + i],
            palette: (attrsBottomLeft & 0x1c) >> 2,
            priority: (attrsBottomLeft & 0x20) != 0,
            mirrored: (attrsBottomLeft & 0x40) != 0,
            inverted: (attrsBottomLeft & 0x80) != 0,
          },
          {
            index: ((attrsBottomRight & 0x03) << 8) | slice.data[0x300 + i],
            palette: (attrsBottomRight & 0x1c) >> 2,
            priority: (attrsBottomRight & 0x20) != 0,
            mirrored: (attrsBottomRight & 0x40) != 0,
            inverted: (attrsBottomRight & 0x80) != 0,
          },
        ],
      });
    }
  }

  drawTile(
    target: Surface | null,
    highPriorityTarget: Surface | null,
    index: number,
    x: number,
    y: number,
    renderDynamic = false
  ) {
    const tile = this.tiles[index];

    for (let i = 0; i < tile.subtiles.length; i++) {
      const subtile = tile.subtiles[i];

      if (subtile.priority && !highPriorityTarget) continue;
      if (!subtile.priority && !target) continue;

      const index = subtile.index;

      if (
        renderDynamic &&
        index >= 640 &&
        index < 640 + this.animatedTileset.tiles.length * 4
      ) {
        this.animatedTileset.drawTile(
          subtile.priority ? highPriorityTarget! : target!,
          index - 640,
          x + (i === 1 || i === 3 ? 8 : 0),
          y + (i === 2 || i === 3 ? 8 : 0),
          this.paletteSet,
          subtile.palette * this.paletteSet.colorsPerPalette,
          subtile.mirrored,
          subtile.inverted
        );
      } else {
        this.graphics.drawTile(
          subtile.priority ? highPriorityTarget! : target!,
          index,
          x + (i === 1 || i === 3 ? 8 : 0),
          y + (i === 2 || i === 3 ? 8 : 0),
          this.paletteSet,
          subtile.palette * this.paletteSet.colorsPerPalette,
          subtile.mirrored,
          subtile.inverted
        );
      }
    }
  }

  drawTileset(target: Surface, x: number, y: number) {
    for (let i = 0; i < this.tiles.length; i++) {
      const x = i % 16;
      const y = Math.floor(i / 16);

      this.drawTile(target, target, i, x * 16, y * 16);
    }
  }

  isDynamicTile(index: number) {
    const tile = this.tiles[index];

    for (let i = 0; i < tile.subtiles.length; i++) {
      const subtile = tile.subtiles[i];

      const index = subtile.index;

      if (index >= 640 && index < 768) {
        return true;
      }
    }

    return false;
  }

  // getDynamicTileSpeed(index: number): number | null {
  //   const tile = this.tiles[index];

  //   let speed = -1;

  //   for (let i = 0; i < tile.subtiles.length; i++) {
  //     const subtile = tile.subtiles[i];

  //     let index = subtile.index;

  //     if (index >= 640 && index < 640 + this.animatedTileset.tiles.length * 4) {
  //       speed = Math.max(speed, this.animatedTileset.getTileSpeed(index - 640));
  //     }
  //   }

  //   return speed || null;

  //   return false;
  // }
}
