import { ROM, Slice } from "@/src/Engine/Data/ROM";
import Prim from "prim";
import { Graphics } from "../Graphics/Graphics";
import { Palette } from "../Graphics/Palette";
import { PaletteSet } from "../Graphics/PaletteSet";
import { Tileset } from "./Tileset";

export interface AnimatedBG3Tile {
  speed: number;
  tileSize: number;
  frames: number[];
}

export class AnimatedBG3Tileset {
  offset: number;
  tiles: AnimatedBG3Tile[] = [];
  graphics: Graphics;

  constructor(slice: Slice, graphics: Graphics) {
    this.offset = slice.offset;
    this.graphics = graphics;
    for (let i = 0; i < Math.min(120, slice.data.length); i += 20) {
      const speed = (slice.data[i + 1] << 8) | slice.data[i + 0];
      const tileSize = (slice.data[i + 3] << 8) | slice.data[i + 2];

      // if (!speed) {
      //   break;
      // }

      this.tiles.push({
        speed,
        tileSize,
        frames: [
          ((slice.data[i + 5] << 8) | slice.data[i + 4]) / 32,
          ((slice.data[i + 7] << 8) | slice.data[i + 6]) / 32,
          ((slice.data[i + 9] << 8) | slice.data[i + 8]) / 32,
          ((slice.data[i + 11] << 8) | slice.data[i + 10]) / 32,
          ((slice.data[i + 13] << 8) | slice.data[i + 12]) / 32,
          ((slice.data[i + 15] << 8) | slice.data[i + 14]) / 32,
          ((slice.data[i + 17] << 8) | slice.data[i + 16]) / 32,
          ((slice.data[i + 19] << 8) | slice.data[i + 18]) / 32,
        ],
      });
    }
    SSj.log(this.tiles);
  }

  drawTile(
    target: Surface,
    index: number,
    x: number,
    y: number,
    paletteSet: PaletteSet,
    indexInPaletteSet: number,
    mirrored = false,
    inverted = false
  ) {
    const animatedTileIndex = Math.floor(index / 4);

    const animatedTile = this.tiles[animatedTileIndex];

    const frame =
      Math.floor((Sphere.now() / 60) * animatedTile.speed) %
      animatedTile.frames.length;

    const frameIndex = animatedTile.frames[frame] + (index % 4);

    this.graphics.drawTile(
      target,
      frameIndex,
      x,
      y,
      paletteSet,
      indexInPaletteSet,
      mirrored,
      inverted
    );
  }
}
