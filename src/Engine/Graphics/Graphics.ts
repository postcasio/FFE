import { ByteSwap } from "@/src/Engine/Data/ByteSwap";
import { Linear1bpp } from "@/src/Engine/Data/Linear1bpp";
import { Snes4bpp } from "@/src/Engine/Data/Snes4bpp";
import { Slice } from "../Data/ROM";
import { Snes2bpp } from "../Data/Snes2bpp";
import { hex } from "../utils";
import { Palette } from "./Palette";
import { PaletteSet } from "./PaletteSet";

export enum GraphicsFormat {
  ByteSwappedLinear1bpp,
  Snes4bpp,
  Snes2bpp,
}

export enum GraphicsAtlasType {
  RGBA,
  Palette,
}

export interface TileRenderingObjects {
  model: Model;
  shape: Shape;
}

export interface AtlasCollectionElement {
  atlas: Atlas;
  paletteSet: PaletteSet;
  indexInPaletteSet: number;
}
export class AtlasCollection {
  atlases: AtlasCollectionElement[] = [];

  has(paletteSet: PaletteSet, indexInPaletteSet: number) {
    for (const element of this.atlases) {
      if (
        element.paletteSet === paletteSet &&
        element.indexInPaletteSet === indexInPaletteSet
      ) {
        return true;
      }
    }

    return false;
  }

  get(paletteSet: PaletteSet, indexInPaletteSet: number) {
    for (const element of this.atlases) {
      if (
        element.paletteSet === paletteSet &&
        element.indexInPaletteSet === indexInPaletteSet
      ) {
        return element.atlas;
      }
    }

    return undefined;
  }

  set(paletteSet: PaletteSet, indexInPaletteSet: number, atlas: Atlas) {
    this.atlases.push({
      atlas,
      paletteSet,
      indexInPaletteSet,
    });
  }
}
export class Atlas {
  surface: Surface;
  buffer: Uint8Array;
  dirty = false;

  constructor(buffer: Uint8Array, surface: Surface) {
    this.buffer = buffer;
    this.surface = surface;
    this.upload();
  }

  update() {
    if (this.dirty) {
      this.upload();
      this.dirty = false;
    }
  }

  upload() {
    this.surface.upload(this.buffer);
  }
}

export class Graphics {
  type: GraphicsFormat;
  data: Uint8Array;

  atlases: AtlasCollection = new AtlasCollection();
  atlasWidthInTiles: number;
  atlasHeightInTiles: number;
  tileWidth = 8;
  tileHeight = 8;
  atlasWidth: number;
  atlasHeight: number;
  tileSize: number = this.tileWidth * this.tileHeight;
  tileCount: number;

  tileRenderingObjects: TileRenderingObjects[];
  tileTransform: Transform = new Transform();

  shader?: Shader;
  shaderSetup?: (shader: Shader) => void;

  name?: string;

  atlasType: GraphicsAtlasType = GraphicsAtlasType.RGBA;

  async enablePaletteRendering() {
    this.atlasType = GraphicsAtlasType.Palette;
  }

  constructor(
    slice: Slice,
    type: GraphicsFormat,
    tileWidth = 8,
    tileHeight = 8,
    atlasWidthInTiles = 32
  ) {
    this.type = type;
    this.tileWidth = tileWidth;
    this.tileHeight = tileHeight;
    this.tileSize = this.tileWidth * this.tileHeight;

    switch (type) {
      case GraphicsFormat.Snes4bpp:
        this.data = this.decodeSnes4bpp(slice.data);
        break;
      case GraphicsFormat.ByteSwappedLinear1bpp:
        this.data = this.decodeByteSwappedLinear1bpp(slice.data);
        break;
      case GraphicsFormat.Snes2bpp:
        this.data = this.decodeSnes2bpp(slice.data);
        break;
      default:
        throw "not supported format";
    }

    this.atlasWidthInTiles = atlasWidthInTiles;
    this.atlasHeightInTiles = Math.ceil(
      this.data.length / this.tileSize / this.atlasWidthInTiles
    );
    this.atlasWidth = this.atlasWidthInTiles * this.tileWidth;
    this.atlasHeight = this.atlasHeightInTiles * this.tileHeight;
    this.tileCount = this.atlasWidthInTiles * this.atlasHeightInTiles;
    this.tileRenderingObjects = new Array(this.tileCount);
  }

  decodeSnes4bpp(data: Uint8Array): Uint8Array {
    return Snes4bpp.decode(data);
  }

  decodeSnes2bpp(data: Uint8Array): Uint8Array {
    return Snes2bpp.decode(data);
  }

  decodeByteSwappedLinear1bpp(data: Uint8Array): Uint8Array {
    return ByteSwap.decode(Linear1bpp.decode(data), 16);
  }

  renderAtlasWithPalette(
    paletteSet: PaletteSet,
    indexInPaletteSet: number
  ): Atlas {
    const buffer = new Uint8Array(this.atlasWidth * this.atlasHeight * 4);

    for (let y = 0; y < this.atlasHeightInTiles; y++) {
      for (let x = 0; x < this.atlasWidthInTiles; x++) {
        const index = x + y * this.atlasWidthInTiles;

        this.renderTileWithPalette(
          buffer,
          index,
          x * this.tileWidth,
          y * this.tileHeight,
          paletteSet,
          indexInPaletteSet
        );
      }
    }

    const atlas = new Atlas(
      buffer,
      new Surface(
        this.atlasWidthInTiles * this.tileWidth,
        this.atlasHeightInTiles * this.tileHeight,
        buffer
      )
    );

    return atlas;
  }

  getAtlas(paletteSet: PaletteSet, indexInPaletteSet: number): Atlas {
    if (this.atlases.has(paletteSet, indexInPaletteSet)) {
      return this.atlases.get(paletteSet, indexInPaletteSet)!;
    }

    const atlas = this.renderAtlasWithPalette(paletteSet, indexInPaletteSet);

    this.atlases.set(paletteSet, indexInPaletteSet, atlas);

    return atlas;
  }

  getTileRenderingObjects(index: number) {
    if (this.tileRenderingObjects[index]) {
      return this.tileRenderingObjects[index];
    }

    const sourceX = (index % this.atlasWidthInTiles) * this.tileWidth;
    const sourceY =
      Math.floor(index / this.atlasWidthInTiles) * this.tileHeight;

    const texW = this.atlasWidthInTiles * this.tileWidth;
    const texH = this.atlasHeightInTiles * this.tileHeight;

    const u0 = sourceX / texW;
    const v0 = 1.0 - sourceY / texH;
    const u1 = (sourceX + this.tileWidth) / texW;
    const v1 = 1.0 - (sourceY + this.tileHeight) / texH;

    const shape = new Shape(
      ShapeType.TriStrip,
      null,
      new VertexList([
        { x: 0, y: 0, u: u0, v: v0 },
        { x: 1, y: 0, u: u1, v: v0 },
        { x: 0, y: 1, u: u0, v: v1 },
        { x: 1, y: 1, u: u1, v: v1 },
      ])
    );

    const model = new Model([shape]);

    this.tileRenderingObjects[index] = {
      shape,
      model,
    };

    return this.tileRenderingObjects[index];
  }

  drawTile(
    target: Surface,
    index: number,
    x: number,
    y: number,
    paletteSet: PaletteSet,
    indexInPaletteSet: number,
    mirrored = false,
    inverted = false
  ) {
    const atlas = this.getAtlas(paletteSet, indexInPaletteSet);

    const rendering = this.getTileRenderingObjects(index);

    const w = this.tileWidth;
    const h = this.tileHeight;

    this.tileTransform
      .identity()
      .scale(mirrored ? -w : w, inverted ? -h : h)
      .translate(x + (mirrored ? 8 : 0), y + (inverted ? 8 : 0));

    rendering.shape.texture = atlas.surface;
    rendering.model.transform = this.tileTransform;

    if (this.shader) {
      rendering.model.shader = this.shader;
    } else {
      rendering.model.shader = Shader.Default;
    }

    if (this.shader) {
      this.shaderSetup?.(this.shader);
    }

    rendering.model.draw(target);
  }

  private renderTileWithPalette(
    buffer: Uint8Array,
    index: number,
    x: number,
    y: number,
    paletteSet: PaletteSet,
    indexInPaletteSet: number
  ) {
    const tileStart = index * this.tileSize;

    for (let py = 0; py < this.tileHeight; py++) {
      for (let px = 0; px < this.tileWidth; px++) {
        if (tileStart + py * this.tileWidth + px >= this.data.length) {
          return;
        }

        const value = this.data[tileStart + py * this.tileWidth + px];

        const color =
          value === 0
            ? Color.Transparent
            : paletteSet.getColor(indexInPaletteSet + value);

        const colorIndex =
          (indexInPaletteSet + value) % paletteSet.colorsPerPalette;

        const pixel = (x + px + (y + py) * this.atlasWidth) * 4;

        switch (this.atlasType) {
          case GraphicsAtlasType.RGBA:
            buffer[pixel] = color.r * 255;
            buffer[pixel + 1] = color.g * 255;
            buffer[pixel + 2] = color.b * 255;
            buffer[pixel + 3] = color.a * 255;
            break;
          case GraphicsAtlasType.Palette:
            buffer[pixel] =
              (255 / paletteSet.colorsPerPalette) * (colorIndex + 0.5);
            buffer[pixel + 1] =
              (255 / (paletteSet.palettes.length || 8)) *
              (paletteSet.getPaletteForColorIndex(indexInPaletteSet + value)
                .indexInSet +
                0.5);
            buffer[pixel + 2] = 0;
            buffer[pixel + 3] = value === 0 ? 0 : 255;
        }
      }
    }
  }

  async loadShader(name: string, setup?: (shader: Shader) => void) {
    this.shader = await Shader.fromFiles({
      fragmentFile: `@/assets/shaders/${name}/${name}.frag`,
      vertexFile: `@/assets/shaders/${name}/${name}.vert`,
    });

    this.shaderSetup = setup;
  }

  unloadShader() {
    this.shader = undefined;
    this.shaderSetup = undefined;
  }
}
