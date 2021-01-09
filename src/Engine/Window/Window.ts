import { Game } from "../Game";
import { Graphics } from "../Graphics/Graphics";
import { PaletteSet } from "../Graphics/PaletteSet";

export class Window {
  paletteSet: PaletteSet;

  graphics: Graphics;

  style = 0;

  smoothGradient = true;

  constructor(graphics: Graphics, paletteSet: PaletteSet) {
    this.graphics = graphics;
    this.paletteSet = paletteSet;
  }

  async initialize() {
    await this.graphics.loadShader("window", this.setupShader.bind(this));
  }

  static async create(graphics: Graphics, paletteSet: PaletteSet) {
    const window = new Window(graphics, paletteSet);

    await window.initialize();

    return window;
  }

  setupShader(shader: Shader) {
    shader.setFloat("screen_height", Game.current.screen.height);
    shader.setBoolean("smooth_gradient", this.smoothGradient);
  }

  setStyle(index: number) {
    this.style = index;
  }

  private drawTile(target: Surface, index: number, x: number, y: number) {
    this.graphics.drawTile(
      target,
      index + this.style * 28,
      x,
      y,
      this.paletteSet.palettes[this.style]
    );
  }

  draw(
    target: Surface,
    x: number,
    y: number,
    widthInTiles: number,
    heightInTiles: number
  ) {
    this.drawTile(target, 16, x, y);

    for (let i = 0; i < widthInTiles - 2; i++) {
      this.drawTile(target, 17 + (i & 0x1), x + (i + 1) * 8, y);
    }

    this.drawTile(target, 19, x + (widthInTiles - 1) * 8, y);

    y += 8;

    let pattern = 0;

    for (let my = 0; my < heightInTiles; my++) {
      this.drawTile(target, 20 + (my & 0x1) * 2, x, y);

      for (let i = 0; i < widthInTiles - 2; i++) {
        this.drawTile(target, pattern * 4 + (i % 4), x + (i + 1) * 8, y);
      }

      this.drawTile(target, 21 + (my & 0x1) * 2, x + (widthInTiles - 1) * 8, y);

      pattern = (pattern + 1) % 4;

      y += 8;
    }

    this.drawTile(target, 24, x, y);

    for (let i = 0; i < widthInTiles - 2; i++) {
      this.drawTile(target, 25 + (i & 0x1), x + (i + 1) * 8, y);
    }

    this.drawTile(target, 27, x + (widthInTiles - 1) * 8, y);
  }
}
