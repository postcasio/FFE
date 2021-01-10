import { Slice } from "../Data/ROM";
import { Graphics } from "../Graphics/Graphics";
import { Palette } from "../Graphics/Palette";
import { PaletteSet } from "../Graphics/PaletteSet";

export class VariableWidthFont {
  graphics: Graphics;
  characterWidths: number[];
  paletteSet: PaletteSet;
  mask?: Color;

  constructor(graphics: Graphics, characterWidths: Slice) {
    this.graphics = graphics;
    this.characterWidths = Array.from(characterWidths.data);

    this.paletteSet = new PaletteSet([
      [new Color(0, 0, 0, 0), new Color(1, 1, 1)],
    ]);
  }

  static async create(graphics: Graphics, characterWidths: Slice) {
    const font = new VariableWidthFont(graphics, characterWidths);
    await font.initialize();
    return font;
  }

  async initialize() {
    await this.graphics.loadShader("font", this.setupShader.bind(this));
  }

  setupShader(shader: Shader) {
    shader.setColorVector("mask", this.mask || Color.White);
  }

  drawCharacter(
    surface: Surface,
    x: number,
    y: number,
    character: number,
    mask?: Color
  ) {
    if (character < 0x20) {
      return;
    }

    this.mask = Color.Black;
    this.graphics.drawTile(
      surface,
      character - 0x20,
      x + 1,
      y + 1,
      this.paletteSet,
      0
    );
    this.mask = mask;
    this.graphics.drawTile(surface, character - 0x20, x, y, this.paletteSet, 0);
  }

  getCharacterWidth(character: number) {
    return this.characterWidths[character];
  }
}
