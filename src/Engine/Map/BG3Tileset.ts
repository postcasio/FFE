import Prim from "prim";
import { Slice } from "../Data/ROM";
import { Graphics } from "../Graphics/Graphics";
import { PaletteSet } from "../Graphics/PaletteSet";
import { hex } from "../utils";
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

export class BG3Tileset implements Tileset {
  offset: number;
  tiles: Tile[] = [];
  graphics: Graphics;
  paletteSet: PaletteSet;
  animatedTileset?: AnimatedTileset;

  constructor(
    graphics: Graphics,
    layer3PaletteBytes: Uint8Array,
    paletteSet: PaletteSet,
    animatedTileset?: AnimatedTileset
  ) {
    this.offset = -1;
    this.graphics = graphics;
    this.paletteSet = paletteSet;
    this.animatedTileset = animatedTileset;

    // const subtiles = [];

    // for (let i = 0; i < 0x400; i++) {
    //   const paletteByte = layer3PaletteBytes[Math.floor(i / 4)];
    //   const palette = paletteByte & 0x07;
    //   const mirrored = (i & 0x40) !== 0;
    //   const inverted = (i & 0x80) !== 0;
    //   const priority = true;

    //   subtiles.push({
    //     index: i % 0x100,
    //     palette,
    //     priority,
    //     mirrored,
    //     inverted,
    //   });

    //   if (subtiles.length === 4) {
    //     this.tiles.push({ subtiles: subtiles.splice(0) });
    //   }
    // }

    for (let i = 0; i < 0x100; i++) {
      const paletteByte = layer3PaletteBytes[i % 0x100];
      const mirrored = (i & 0x40) !== 0;
      const inverted = (i & 0x80) !== 0;

      this.tiles.push({
        subtiles: [
          {
            index: i * 4 + (mirrored ? 1 : 0) + (inverted ? 2 : 0),
            palette: 4,
            priority: (paletteByte & 0x20) !== 0,
            mirrored,
            inverted,
          },
          {
            index: i * 4 + (mirrored ? 0 : 1) + (inverted ? 2 : 0),
            palette: 4,
            priority: (paletteByte & 0x20) !== 0,
            mirrored,
            inverted,
          },
          {
            index: i * 4 + (mirrored ? 3 : 2) - (inverted ? 2 : 0),
            palette: 4,
            priority: (paletteByte & 0x20) !== 0,
            mirrored,
            inverted,
          },
          {
            index: i * 4 + (mirrored ? 2 : 3) - (inverted ? 2 : 0),
            palette: 4,
            priority: (paletteByte & 0x20) !== 0,
            mirrored,
            inverted,
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

      // if (
      //   this.animatedTileset &&
      //   renderDynamic &&
      //   index >= 640 &&
      //   index < 640 + this.animatedTileset.tiles.length * 4
      // ) {
      //   this.animatedTileset.drawTile(
      //     subtile.priority ? highPriorityTarget! : target!,
      //     index - 640,
      //     x + (i === 1 || i === 3 ? 8 : 0),
      //     y + (i === 2 || i === 3 ? 8 : 0),
      //     this.paletteSet.palettes[subtile.palette],
      //     subtile.mirrored,
      //     subtile.inverted
      //   );
      // } else {
      // palette is an index to a color in the palettes

      this.graphics.drawTile(
        subtile.priority ? highPriorityTarget! : target!,
        index,
        x + (i === 1 || i === 3 ? 8 : 0),
        y + (i === 2 || i === 3 ? 8 : 0),
        this.paletteSet,
        subtile.palette,
        subtile.mirrored,
        subtile.inverted
      );
      // }
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
