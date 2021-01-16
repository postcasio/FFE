import Prim from "prim";
import { Slice } from "../Data/ROM";
import { Graphics } from "../Graphics/Graphics";
import { PaletteSet } from "../Graphics/PaletteSet";

export class SpriteAnimation {
  type: SpriteAnimationType;
  frames: number[];

  constructor(type: SpriteAnimationType, frames: number[]) {
    this.type = type;
    this.frames = frames;
  }
}

export interface SpriteFrame {
  index: number;
  tiles: number[];
}

export enum SpriteAnimationType {
  VehicleMovingUp = 0,
  VehicleMovingRight = 1,
  VehicleMovingDown = 2,
  VehicleMovingLeft = 3,
  WalkingUp = 4,
  WalkingRight = 5,
  WalkingDown = 6,
  WalkingLeft = 7,
  StandingUp = 8,
  StandingRight = 9,
  StandingDown = 10,
  StandingLeft = 11,
}

const flippedFeet: Partial<Record<SpriteAnimationType, boolean>> = {
  [SpriteAnimationType.WalkingUp]: true,
  [SpriteAnimationType.WalkingDown]: true,
};

export class Sprite {
  frames: SpriteFrame[] = [];
  animations: Record<SpriteAnimationType, SpriteAnimation>;

  constructor(tileLayoutSlice: Slice, animations: SpriteAnimation[]) {
    for (let frame = 0; frame < tileLayoutSlice.data.length / 12; frame++) {
      const tiles = [];
      for (let tile = 0; tile < 6; tile++) {
        tiles.push(
          (tileLayoutSlice.data[frame * 12 + tile * 2] |
            (tileLayoutSlice.data[frame * 12 + tile * 2 + 1] << 8)) /
            32
        );
      }

      this.frames.push({
        index: frame,
        tiles,
      });
    }

    this.animations = animations.reduce((animations, animation) => {
      animations[animation.type] = animation;
      return animations;
    }, {} as Record<SpriteAnimationType, SpriteAnimation>);
  }

  draw(
    topTarget: Surface,
    bottomTarget: Surface,
    x: number,
    y: number,
    animation: SpriteAnimation,
    frameIndex: number,
    graphics: Graphics,
    paletteSet: PaletteSet,
    indexInPaletteSet: number
  ) {
    const rows = 3;
    const columns = 2;

    const index = animation.frames[frameIndex];

    const frame = this.frames[index & 0x3f];
    const mirrored = (index & 0x40) !== 0;
    for (let tx = 0; tx < columns; tx++) {
      for (let ty = 0; ty < rows; ty++) {
        const tile =
          frame.tiles[+mirrored ? (tx + ty * columns) ^ 1 : tx + ty * columns];
        const flipFeet =
          ty === 2 &&
          frameIndex === 3 &&
          (flippedFeet[animation.type] || false);

        graphics.drawTile(
          ty > 1 ? bottomTarget : topTarget,
          tile,
          x + (flipFeet ? 1 - tx : tx) * 8,
          y + ty * 8,
          paletteSet,
          indexInPaletteSet,
          mirrored !== flipFeet
        );
      }
    }
  }
}
