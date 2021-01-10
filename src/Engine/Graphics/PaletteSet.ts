import { Slice } from "../Data/ROM";
import { hex } from "../utils";
import { Palette } from "./Palette";

export class PaletteSet {
  palettes: Palette[] = [];
  texture: Surface;
  dirty = true;
  colorsPerPalette: number;
  slice?: Slice;
  offset: number;
  buffer: Uint8Array;

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

    this.buffer = new Uint8Array(
      this.colorsPerPalette * this.palettes.length * 4
    );

    this.texture = new Surface(
      this.palettes[0].colors.length,
      this.palettes.length
    );

    this.texture.blendOp = BlendOp.Replace;
  }

  updateBuffer() {
    for (let i = 0; i < this.palettes.length; i++) {
      for (let c = 0; c < this.palettes[i].colors.length; c++) {
        this.buffer[(i * this.colorsPerPalette + c) * 4] =
          this.palettes[i].colors[c].r * 255;
        this.buffer[(i * this.colorsPerPalette + c) * 4 + 1] =
          this.palettes[i].colors[c].g * 255;
        this.buffer[(i * this.colorsPerPalette + c) * 4 + 2] =
          this.palettes[i].colors[c].b * 255;
        this.buffer[(i * this.colorsPerPalette + c) * 4 + 3] =
          this.palettes[i].colors[c].a * 255;
      }
    }
  }

  draw(target: Surface) {
    target.upload(this.buffer);
  }

  getTexture() {
    if (this.dirty) {
      this.updateBuffer();
      this.draw(this.texture);
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
