import Prim from "prim";
import { Slice } from "../Data/ROM";
import { Game } from "../Game";
import { PaletteSet } from "./PaletteSet";

export interface RGB555Color {
  r: number;
  g: number;
  b: number;
}

export class Palette {
  colors: Color[] = [];
  offset: number;
  rgb555: RGB555Color[] = [];
  indexInSet = -1;
  set?: PaletteSet;

  static parseColor(lo: number, hi: number) {
    return {
      r: lo & 0x1f,
      g: ((lo & 0xe0) >> 5) | ((hi & 0x03) << 3),
      b: (hi & 0x7c) >> 2,
    };
  }

  constructor(slice: Slice | Color[]) {
    if (Array.isArray(slice)) {
      this.offset = -1;
      this.colors = slice.map((color) => color.clone());
    } else {
      this.offset = slice.offset;

      for (let i = 0; i < slice.data.length; i += 2) {
        const rgb555 = Palette.parseColor(slice.data[i], slice.data[i + 1]);

        this.colors.push(
          new Color(rgb555.r / 0x1f, rgb555.g / 0x1f, rgb555.b / 0x1f, 1)
        );
        this.rgb555.push(rgb555);
      }
    }
  }

  getRGB555(index: number) {
    return this.rgb555[index];
  }

  setRGB555(index: number, r: number, g: number, b: number) {
    const color = this.rgb555[index];

    color.r = r;
    color.g = g;
    color.b = b;

    this.colors[index] = new Color(
      color.r / 0x1f,
      color.g / 0x1f,
      color.b / 0x1f,
      1
    );

    if (this.set) {
      this.set.dirty = true;
    }
  }

  draw(target: Surface, x: number, y: number, size: number) {
    for (let i = 0; i < this.colors.length; i++) {
      Prim.drawSolidRectangle(
        target,
        x + i * size,
        y,
        size,
        size,
        this.colors[i]
      );
    }
  }
}
