import Prim from "prim";
import { Slice } from "../Data/ROM";
import { BG1Tileset } from "./BG1Tileset";
import { Layer, LayerType } from "./Layer";
import { Tileset } from "./Tileset";

export class BG12Layer implements Layer {
  type = LayerType.BG12;

  tiles: number[] = [];
  tileWidth = 16;
  tileHeight = 16;
  width = 0;
  height = 0;

  lowSurface: Surface = new Surface(32, 32, Color.Transparent);
  highSurface: Surface = new Surface(32, 32, Color.Transparent);

  tileset?: Tileset;

  shiftX = 0;
  shiftY = 0;

  parallaxSpeedX = 0;
  parallaxSpeedY = 0;
  parallaxMultiplierX = 1;
  parallaxMultiplierY = 1;

  dynamicTiles: number[] = [];

  dirty = false;

  lowShape!: Shape;
  highShape!: Shape;
  lowModel!: Model;
  highModel!: Model;

  paletteShader!: Shader;

  wavyEffect = false;

  makeShapes() {
    const w = this.lowSurface.width;
    const h = this.lowSurface.height;

    this.lowShape = new Shape(
      ShapeType.TriStrip,
      this.lowSurface,
      new VertexList([
        { x: 0, y: 0, u: 0, v: 1 },
        { x: w, y: 0, u: 1, v: 1 },
        { x: 0, y: h, u: 0, v: 0 },
        { x: w, y: h, u: 1, v: 0 },
      ])
    );

    this.highShape = new Shape(
      ShapeType.TriStrip,
      this.highSurface,
      new VertexList([
        { x: 0, y: 0, u: 0, v: 1 },
        { x: w, y: 0, u: 1, v: 1 },
        { x: 0, y: h, u: 0, v: 0 },
        { x: w, y: h, u: 1, v: 0 },
      ])
    );

    this.lowModel = new Model([this.lowShape], this.paletteShader);
    this.highModel = new Model([this.highShape], this.paletteShader);

    // this.lowModel = new Model([this.lowShape]);
    // this.highModel = new Model([this.highShape]);
  }

  render(force = false) {
    if ((!this.dirty && !force) || !this.tileset) {
      return;
    }

    const pixelWidth = this.width * this.tileWidth;
    const pixelHeight = this.height * this.tileHeight;

    if (
      pixelWidth !== this.lowSurface.width ||
      pixelHeight !== this.lowSurface.height
    ) {
      this.lowSurface = new Surface(pixelWidth, pixelHeight, Color.Transparent);
      this.highSurface = new Surface(
        pixelWidth,
        pixelHeight,
        Color.Transparent
      );
    }

    this.lowSurface.blendOp = BlendOp.Replace;
    this.highSurface.blendOp = BlendOp.Replace;
    this.lowSurface.clear(Color.Transparent);
    this.highSurface.clear(Color.Transparent);

    for (let tileY = 0; tileY < this.height; tileY++) {
      for (let tileX = 0; tileX < this.width; tileX++) {
        const tile = this.tiles[tileY * this.width + tileX];

        const pixelX = tileX * this.tileWidth;
        const pixelY = tileY * this.tileHeight;

        this.tileset.drawTile(
          this.lowSurface,
          this.highSurface,
          tile,
          pixelX,
          pixelY
        );
      }
    }

    this.makeShapes();

    this.dirty = false;
  }

  private draw(
    target: Surface,
    sourceModel: Model,
    x: number,
    y: number,
    w: number,
    h: number,
    cameraX: number,
    cameraY: number
  ) {
    const xOffset =
      cameraX / this.parallaxMultiplierX + this.shiftX * 16 - w / 2 + 8;
    const yOffset =
      cameraY / this.parallaxMultiplierY + this.shiftY * 16 - h / 2;

    this.paletteShader.setBoolean("wavy_effect", this.wavyEffect);
    this.paletteShader.setBoolean("wavy_effect_battle", false);
    this.paletteShader.setFloatVector("tex_size", [
      this.lowSurface.width,
      this.lowSurface.height,
    ]);
    this.paletteShader.setFloat("t", Sphere.now() / 10);

    sourceModel.transform.identity().translate(x - xOffset, y - yOffset);
    sourceModel.draw(target);
  }

  getPaletteShader() {
    return this.paletteShader;
  }

  updateDynamicTiles() {
    this.dynamicTiles = this.tiles.reduce((tiles, tile, index) => {
      if (this.tileset?.isDynamicTile(tile)) {
        tiles.push(index);
      }
      return tiles;
    }, [] as number[]);
  }

  renderDynamicTiles() {
    for (let i = 0; i < this.dynamicTiles.length; i++) {
      const tilemapIndex = this.dynamicTiles[i];

      this.tileset?.drawTile(
        this.lowSurface,
        this.highSurface,
        this.tiles[tilemapIndex],
        (tilemapIndex % this.width) * this.tileWidth,
        Math.floor(tilemapIndex / this.width) * this.tileHeight,
        true
      );
    }
  }

  frameRender(
    x: number,
    y: number,
    w: number,
    h: number,
    cameraX: number,
    cameraY: number
  ) {
    if (this.dirty) {
      this.updateDynamicTiles();
      this.render();
    }

    this.renderDynamicTiles();

    // this.lowShape.texture = this.lowSurface;
    // this.highShape.texture = this.highSurface;
  }

  drawLowPriority(
    target: Surface,
    x: number,
    y: number,
    w: number,
    h: number,
    cameraX: number,
    cameraY: number
  ) {
    this.draw(target, this.lowModel!, x, y, w, h, cameraX, cameraY);
  }

  drawHighPriority(
    target: Surface,
    x: number,
    y: number,
    w: number,
    h: number,
    cameraX: number,
    cameraY: number
  ) {
    this.draw(target, this.highModel!, x, y, w, h, cameraX, cameraY);
  }

  async initialize() {
    this.paletteShader = await Shader.fromFiles({
      fragmentFile: "@/assets/shaders/palettegfx/palettegfx.frag",
      vertexFile: "@/assets/shaders/palettegfx/palettegfx.vert",
    });
  }
}
