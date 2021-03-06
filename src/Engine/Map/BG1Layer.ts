import Prim from "prim";
import { Slice } from "../Data/ROM";
import { BG1Tileset } from "./BG1Tileset";
import { Layer, LayerType } from "./Layer";
import { Tileset } from "./Tileset";

export enum ZLevel {
  bottom = 0, // force to bottom
  snesBk = 0, // snes back area
  snes4L = 2, // snes layer 4, low priority
  snes3L = 3, // snes layer 3, low priority
  snesS0 = 4, // snes sprites, priority 0
  snes4H = 6, // snes layer 4, high priority
  snes3H = 7, // snes layer 3, high priority
  snesS1 = 8, // snes sprites, priority 1
  snes2L = 10, // snes layer 2, low priority
  snes1L = 11, // snes layer 1, low priority
  snesS2 = 12, // snes sprites, priority 2
  snes2H = 14, // snes layer 2, high priority
  snes1H = 15, // snes layer 1, high priority
  snesS3 = 16, // snes sprites, priority 3
  snes3P = 17, // snes layer 3, highest priority
  top = 100, // force to top
}

interface TileAreaModification {
  type: "tile-area";
  x: number;
  y: number;
  w: number;
  h: number;
}

type Modification = TileAreaModification;

export class BG12Layer implements Layer {
  type = LayerType.BG12;

  subscreen = false;
  mainscreen = false;

  math = false;

  zLevels: [ZLevel, ZLevel] = [ZLevel.bottom, ZLevel.bottom];
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

  scrollPositionX = 0;
  scrollPositionY = 0;
  fineScrollPositionX = 0;
  fineScrollPositionY = 0;

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

  layer3Priority = false;

  pendingModifications: Modification[] = [];

  utilShape: Shape = new Shape(
    ShapeType.TriStrip,
    null,
    new VertexList([
      { x: 0, y: 0, u: 0, v: 1, color: Color.Transparent },
      { x: 1, y: 0, u: 1, v: 1, color: Color.Transparent },
      { x: 0, y: 1, u: 0, v: 0, color: Color.Transparent },
      { x: 1, y: 1, u: 1, v: 0, color: Color.Transparent },
    ])
  );
  utilModel: Model = new Model([this.utilShape]);

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
    if (!this.dirty && !force) {
      return;
    }

    if (this.tiles.length === 0 || !this.tileset) {
      this.lowSurface.clear(Color.Transparent);
      this.highSurface.clear(Color.Transparent);

      this.dirty = false;

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

      this.makeShapes();
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
          this.layer3Priority ? this.highSurface : this.lowSurface,
          this.highSurface,
          tile,
          pixelX,
          pixelY
        );
      }
    }

    this.dirty = false;
  }

  renderArea(x: number, y: number, w: number, h: number) {
    if (!this.tileset) {
      return;
    }

    this.utilModel.transform
      .identity()
      .scale(w * this.tileWidth, h * this.tileHeight)
      .translate(x * this.tileWidth, y * this.tileHeight);
    this.utilModel.draw(this.lowSurface);
    this.utilModel.draw(this.highSurface);

    for (let tileY = y; tileY < y + h; tileY++) {
      for (let tileX = x; tileX < x + w; tileX++) {
        if (tileY * this.width + tileX >= this.tiles.length) {
          break;
        }

        const tile = this.tiles[tileY * this.width + tileX];

        const pixelX = tileX * this.tileWidth;
        const pixelY = tileY * this.tileHeight;

        this.tileset.drawTile(
          this.layer3Priority ? this.highSurface : this.lowSurface,
          this.highSurface,
          tile,
          pixelX,
          pixelY
        );
      }
    }
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
    if (!this.tiles.length) {
      return;
    }

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

  updateScroll() {
    if (this.parallaxSpeedX) {
      this.fineScrollPositionX =
        (this.fineScrollPositionX + this.parallaxSpeedX / 60) % this.width;

      this.scrollPositionX = Math.round(this.fineScrollPositionX);
    } else {
      this.fineScrollPositionX = this.scrollPositionX = 0;
    }
    if (this.parallaxSpeedY) {
      this.fineScrollPositionY =
        (this.fineScrollPositionY + this.parallaxSpeedY / 60) % this.height;
      this.scrollPositionY = Math.round(this.fineScrollPositionY);
    } else {
      this.fineScrollPositionY = this.scrollPositionY = 0;
    }
  }

  renderDynamicTiles(
    xOffset: number,
    yOffset: number,
    width: number,
    height: number
  ) {
    for (let i = 0; i < this.dynamicTiles.length; i++) {
      const tilemapIndex = this.dynamicTiles[i];
      const x = (tilemapIndex % this.width) * this.tileWidth;
      const y = Math.floor(tilemapIndex / this.width) * this.tileHeight;

      if (
        x >= xOffset - 16 &&
        y >= yOffset - 16 &&
        x <= xOffset + width &&
        y <= yOffset + height
      ) {
        this.tileset?.drawTile(
          this.lowSurface,
          this.highSurface,
          this.tiles[tilemapIndex],
          x,
          y,
          true
        );
      }
    }
  }

  frameRender(
    x: number,
    y: number,
    w: number,
    h: number,
    xOffset: number,
    yOffset: number
  ) {
    if (this.dirty) {
      this.updateDynamicTiles();
      this.render();
    }

    this.renderDynamicTiles(xOffset, yOffset, w, h);

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

  getTileAt(x: number, y: number) {
    return this.tiles[x + y * this.width];
  }

  setTile(x: number, y: number, tile: number) {
    if (!this.tileset) {
      return;
    }
    const index = x + y * this.width;
    if (index >= this.tiles.length) {
      return;
    }
    this.tiles[index] = tile;
  }

  getOffset(
    cameraX: number,
    cameraY: number,
    targetW: number,
    targetH: number
  ) {
    const xOffset =
      cameraX / this.parallaxMultiplierX +
      this.scrollPositionX +
      this.shiftX * 16 -
      targetW / 2 +
      8;
    const yOffset =
      cameraY / this.parallaxMultiplierY +
      this.scrollPositionY +
      this.shiftY * 16 -
      targetH / 2;

    return [xOffset, yOffset];
  }

  applyPendingModifications() {
    for (const mod of this.pendingModifications) {
      switch (mod.type) {
        case "tile-area":
          this.renderArea(mod.x, mod.y, mod.w, mod.h);
          break;
      }
    }

    this.pendingModifications = [];
  }

  setArea(x: number, y: number, w: number, h: number, data: number[]) {
    for (let i = 0; i < data.length; i++) {
      const tx = x + (i % w);
      const ty = y + Math.floor(i / w);

      this.setTile(tx, ty, data[i]);
    }

    this.pendingModifications.push({
      type: "tile-area",
      x,
      y,
      w,
      h,
    });
  }

  positionToTile(x: number, y: number) {
    return [Math.floor(x / 16), Math.floor(y / 16)];
  }
}
