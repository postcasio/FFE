import Prim from "prim";
import { Game } from "../Game";
import { Graphics } from "../Graphics/Graphics";
import { PaletteSet } from "../Graphics/PaletteSet";

export class Window {
  paletteSet: PaletteSet;

  graphics: Graphics;

  style = 0;

  smoothGradient = true;

  cache: Map<string, Surface> = new Map();

  constructor(graphics: Graphics, paletteSet: PaletteSet) {
    this.graphics = graphics;
    this.paletteSet = paletteSet;
  }

  static async create(graphics: Graphics, paletteSet: PaletteSet) {
    const window = new Window(graphics, paletteSet);

    return window;
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
      this.paletteSet,
      this.style * this.paletteSet.colorsPerPalette
    );
  }

  draw(
    target: Surface,
    x: number,
    y: number,
    widthInTiles: number,
    heightInTiles: number
  ) {
    const key = `${x},${y},${widthInTiles},${heightInTiles}`;

    let cache = this.cache.get(key);

    if (cache) {
      Prim.blit(target, x, y, cache);
      return;
    }

    cache = new Surface(widthInTiles * 8, heightInTiles * 8, Color.Transparent);

    let ty = 0;

    this.drawTile(cache, 16, 0, ty);

    for (let i = 0; i < widthInTiles - 2; i++) {
      this.drawTile(cache, 17 + (i & 0x1), (i + 1) * 8, ty);
    }

    this.drawTile(cache, 19, (widthInTiles - 1) * 8, ty);

    ty += 8;

    let pattern = 0;

    for (let my = 0; my < heightInTiles - 2; my++) {
      this.drawTile(cache, 20 + (my & 0x1) * 2, 0, ty);

      for (let i = 0; i < widthInTiles - 2; i++) {
        this.drawTile(cache, pattern * 4 + (i % 4), (i + 1) * 8, ty);
      }

      this.drawTile(cache, 21 + (my & 0x1) * 2, (widthInTiles - 1) * 8, ty);

      pattern = (pattern + 1) % 4;

      ty += 8;
    }

    this.drawTile(cache, 24, 0, ty);

    for (let i = 0; i < widthInTiles - 2; i++) {
      this.drawTile(cache, 25 + (i & 0x1), (i + 1) * 8, ty);
    }

    this.drawTile(cache, 27, (widthInTiles - 1) * 8, ty);

    this.cache.set(key, cache);

    Prim.blit(target, 0, 0, cache);
  }
}
