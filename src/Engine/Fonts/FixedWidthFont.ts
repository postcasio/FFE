import { Slice } from "../Data/ROM";
import { Game } from "../Game";
import { Graphics } from "../Graphics/Graphics";
import { Palette } from "../Graphics/Palette";
import { PaletteSet } from "../Graphics/PaletteSet";

export class FixedWidthFont {
  graphics: Graphics;
  paletteSet: PaletteSet;
  mask?: Color;

  constructor(graphics: Graphics) {
    this.graphics = graphics;

    this.paletteSet = new PaletteSet([
      [
        new Color(0, 0, 0, 0),
        new Color(0.333, 0.333, 0.333, 1),
        new Color(0.666, 0.666, 0.666, 1),
        new Color(1, 1, 1),
      ],
    ]);
  }

  static async create(graphics: Graphics) {
    const font = new FixedWidthFont(graphics);
    await font.initialize();
    return font;
  }

  async initialize() {
    await this.graphics.loadShader("font", this.setupShader.bind(this));
  }

  setupShader(shader: Shader) {
    shader.setColorVector("mask", this.mask || Color.White);
  }

  drawText(target: Surface, x: number, y: number, text: string) {
    for (let i = 0; i < text.length; i++) {
      if (text.substr(i, 1) === " ") continue;
      this.drawCharacter(
        target,
        x + i * 8,
        y,
        Game.current.rom.tables.primary.encode(text.substr(i, 1))
      );
    }
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
    return 8;
  }
}
