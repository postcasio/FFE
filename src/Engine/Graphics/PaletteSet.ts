import { Slice } from "../Data/ROM";
import { hex } from "../utils";
import { Palette } from "./Palette";

export class PaletteSet {
  palettes: Palette[] = [];
  texture: Surface;
  dirty = true;
  magnification = 4;
  colorsPerPalette: number;
  slice?: Slice;
  offset: number;

  constructor(slice: Slice | Color[][], colorsPerPalette?: number) {
    if (slice instanceof Slice) {
      if (!colorsPerPalette) {
        throw "PaletteSet must have colorsPerPalette when constructing with Slice";
      }

      this.colorsPerPalette = colorsPerPalette;
      this.slice = slice;
      this.offset = slice.offset;

      const paletteSize = colorsPerPalette * 2;
      const paletteCount = slice.data.length / paletteSize;

      for (let i = 0; i < paletteCount; i += 1) {
        const paletteROMOffset = slice.offset + paletteSize * i;
        const palette = new Palette(
          new Slice(
            paletteROMOffset,
            slice.getArraySlice(i * paletteSize, (i + 1) * paletteSize)
          )
        );

        palette.indexInSet = i;
        palette.set = this;

        this.palettes.push(palette);
      }
    } else {
      this.colorsPerPalette = slice[0].length;
      this.offset = -1;

      for (let i = 0; i < slice.length; i++) {
        const palette = new Palette(slice[i]);
        palette.indexInSet = i;
        palette.set = this;

        this.palettes.push(palette);
      }
    }

    this.texture = new Surface(
      this.palettes[0].colors.length * this.magnification,
      this.palettes.length * this.magnification
    );

    this.texture.blendOp = BlendOp.Replace;

    this.draw(this.texture, this.magnification);
  }

  draw(target: Surface, size: number) {
    let y = 0;

    for (const palette of this.palettes) {
      palette.draw(target, 0, y, size);

      y += size;
    }
  }

  getTexture() {
    if (this.dirty) {
      this.draw(this.texture, this.magnification);
      this.dirty = false;
    }

    return this.texture;
  }

  clone() {
    return this.slice
      ? new PaletteSet(this.slice, this.colorsPerPalette)
      : new PaletteSet(
          this.palettes.map((palette) => palette.colors.map((c) => c.clone()))
        );
  }

  getColor(index: number) {
    return this.palettes[Math.floor(index / this.colorsPerPalette)].colors[
      index % this.colorsPerPalette
    ];
  }

  getRGB555(index: number) {
    return this.palettes[Math.floor(index / this.colorsPerPalette)].getRGB555(
      index % this.colorsPerPalette
    );
  }

  setRGB555(index: number, r: number, g: number, b: number) {
    this.palettes[Math.floor(index / this.colorsPerPalette)].setRGB555(
      index % this.colorsPerPalette,
      r,
      g,
      b
    );
  }

  getPaletteForColorIndex(index: number) {
    return this.palettes[Math.floor(index / this.colorsPerPalette)];
  }
}
