import { Slice } from "../Data/ROM";
import { hex } from "../utils";
import { Palette } from "./Palette";

export class PaletteSet {
  palettes: Palette[] = [];
  texture: Surface;
  dirty = true;
  magnification = 4;
  colorsPerPalette: number;
  slice: Slice;

  constructor(slice: Slice, colorsPerPalette: number) {
    this.colorsPerPalette = colorsPerPalette;
    this.slice = slice;

    const paletteSize = colorsPerPalette * 2;
    const paletteCount = slice.data.length / paletteSize;

    for (let i = 0; i < paletteCount; i += 1) {
      const paletteROMOffset = slice.offset + paletteSize * i;
      const palette = new Palette(
        new Slice(
          paletteROMOffset,
          slice.slice(i * paletteSize, (i + 1) * paletteSize)
        )
      );

      palette.indexInSet = i;
      palette.set = this;

      this.palettes.push(palette);
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
    return new PaletteSet(this.slice, this.colorsPerPalette);
  }
}
