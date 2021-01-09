import { ROM, Slice } from "@/src/Engine/Data/ROM";
import Prim from "prim";
import { Graphics } from "../Graphics/Graphics";
import { Palette } from "../Graphics/Palette";
import { Tileset } from "./Tileset";

export interface AnimatedTile {
  speed: number;
  frames: number[];
}

export class AnimatedTileset {
  offset: number;
  tiles: AnimatedTile[] = [];
  graphics: Graphics;

  constructor(slice: Slice, graphics: Graphics) {
    this.offset = slice.offset;
    this.graphics = graphics;
    for (let i = 0; i < Math.min(160, slice.data.length); i += 10) {
      const speed = (slice.data[i + 1] << 8) | slice.data[i + 0];

      // if (!speed) {
      //   break;
      // }

      this.tiles.push({
        speed,
        frames: [
          ((slice.data[i + 3] << 8) | slice.data[i + 2]) / 32,
          ((slice.data[i + 5] << 8) | slice.data[i + 4]) / 32,
          ((slice.data[i + 7] << 8) | slice.data[i + 6]) / 32,
          ((slice.data[i + 9] << 8) | slice.data[i + 8]) / 32,
        ],
      });
    }
  }

  drawTile(
    target: Surface,
    index: number,
    x: number,
    y: number,
    palette: Palette,
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
      palette,
      mirrored,
      inverted
    );
  }
}
