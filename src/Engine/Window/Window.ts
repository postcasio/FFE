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

  shape: Shape;
  model?: Model;

  constructor(graphics: Graphics, paletteSet: PaletteSet) {
    this.graphics = graphics;
    this.paletteSet = paletteSet;
    this.shape = new Shape(
      ShapeType.TriStrip,
      null,
      new VertexList([
        { x: 0, y: 0, u: 0, v: 1 },
        { x: 1, y: 0, u: 1, v: 1 },
        { x: 0, y: 1, u: 0, v: 0 },
        { x: 1, y: 1, u: 1, v: 0 },
      ])
    );
  }

  async initialize() {
    this.model = new Model(
      [this.shape],
      await Shader.fromFiles({
        fragmentFile: "@/assets/shaders/window/window.frag",
        vertexFile: "@/assets/shaders/window/window.vert",
      })
    );
  }

  static async create(graphics: Graphics, paletteSet: PaletteSet) {
    const window = new Window(graphics, paletteSet);

    await window.initialize();

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
    heightInTiles: number,
    gradientUsesWindowHeight = false,
    smoothGradient = false
  ) {
    if (!this.model) {
      return;
    }

    const width = widthInTiles * 8;
    const height = heightInTiles * 8;

    const shader = this.model.shader!;

    shader.setBoolean("smooth_gradient", smoothGradient);
    shader.setBoolean("gradient_uses_window_height", gradientUsesWindowHeight);
    shader.setFloat("window_height", height);
    shader.setFloat("screen_height", target.height);
    shader.setFloat("segments", gradientUsesWindowHeight ? 13 : 32);
    shader.setFloat("top", 0.3);
    shader.setFloat("bottom", -0.3);

    const key = `${x},${y},${widthInTiles},${heightInTiles},${
      smoothGradient ? 1 : 0
    }`;

    let cache = this.cache.get(key);

    if (cache) {
      this.shape.texture = cache;
      this.model.transform.identity().scale(width, height).translate(x, y);
      this.model.draw(target);

      return;
    }

    cache = new Surface(width, height, Color.Transparent);

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

    this.shape.texture = cache;
    this.model.transform.identity().scale(width, height).translate(x, y);
    this.model.draw(target);
  }
}
