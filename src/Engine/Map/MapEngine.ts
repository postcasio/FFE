import { Slice } from "../Data/ROM";
import { Game } from "../Game";
import { Graphics, GraphicsFormat } from "../Graphics/Graphics";
import { PaletteSet } from "../Graphics/PaletteSet";
import { InputMapping, KeyboardAction } from "../Input/InputMapping";
import { Intent } from "../Input/Intent";
import { NPCData } from "./NPCData";
import { Direction } from "../Script/Direction";
import { ScriptContext } from "../Script/ScriptContext";
import { signed8 } from "../utils";
import { AnimatedPalette } from "./AnimatedPalette";
import { AnimatedTileset } from "./AnimatedTileset";
import { BG12Layer, ZLevel } from "./BG1Layer";
import { BG1Tileset } from "./BG1Tileset";
import { Layer, LayerType } from "./Layer";
import {
  MapObject,
  ObjectState,
  OBJECT_ID_CAMERA,
  OBJECT_ID_CHAR0,
  OBJECT_ID_PARTY1,
  OBJECT_ID_PARTY2,
  OBJECT_ID_PARTY3,
  OBJECT_ID_PARTY4,
  ZLevel as ObjectZLevel,
} from "./MapObject";
import { MapProperties } from "./MapProperties";
import { BG3Tileset } from "./BG3Tileset";
import { Trigger } from "./Trigger";
import { SpriteAnimation, SpriteAnimationType } from "./Sprite";
import { FadingDirection } from "../Fader";

export enum MathLayer {
  Layer1 = 1,
  Layer2 = 2,
  Layer3 = 4,
  Layer4 = 8,
  Sprites = 16,
}

const blend = new BlendOp(
  BlendType.Add,
  Blend.Alpha,
  Blend.SourceInverse,
  BlendType.Add,
  Blend.Zero,
  Blend.One
);

const doorTiles: Record<number, number> = {
  // two 1x2 doors
  5: 4,
  7: 6,

  21: 20,
  23: 22,

  // one 3x2 door
  11: 8,
  12: 9,
  13: 10,

  27: 24,
  28: 25,
  29: 26,
};

export enum TileProperties {
  PassableUpperZLevel = 0b0000_0000_0000_0001,
  PassableLowerZLevel = 0b0000_0000_0000_0010,
  PassableBothZlevels = 0b0000_0000_0000_0011,
  BridgeTile = 0b0000_0000_0000_0100,
  TopSpritePriority = 0b0000_0000_0000_1000,
  BottomSpritePriority = 0b0000_0000_0001_0000,
  DoorTile = 0b0000_0000_0010_0000,
  UpLeftMovement = 0b0000_0000_0100_0000,
  UpRightMovement = 0b0000_0000_1000_0000,
  PassableThroughLeft = 0b0000_0001_0000_0000,
  PassableThroughRight = 0b0000_0010_0000_0000,
  PassableThroughBottom = 0b0000_0100_0000_0000,
  PassableThroughTop = 0b0000_1000_0000_0000,
  Unknown1 = 0b0001_0000_0000_0000,
  Unknown2 = 0b0010_0000_0000_0000,
  AlwaysFaceUp = 0b0100_0000_0000_0000,
  PassableRandomly = 0b1000_0000_0000_0000,
  Impassable = 0b1111_1111_1111_0111,
  ThroughTile = 0b0000_0000_0000_0111,
}

class SingleTileExit {
  x: number;
  y: number;
  map: number;
  setParent: boolean;
  zLevel: ObjectZLevel;
  showMapName: boolean;
  direction: Direction;
  destinationX: number;
  destinationY: number;

  constructor(slice: Slice) {
    this.x = slice.data[0];
    this.y = slice.data[1];
    this.map = (slice.data[2] | (slice.data[3] << 8)) & 0x1ff;
    this.setParent = (slice.data[3] & 0x02) !== 0;
    this.zLevel = (slice.data[3] & 0x04) >> 2;
    this.showMapName = (slice.data[3] & 0x08) !== 0;
    this.direction = (slice.data[3] & 0x30) >> 4;
    this.destinationX = slice.data[4];
    this.destinationY = slice.data[5];
  }
}

class MultiTileExit {
  x: number;
  y: number;
  map: number;
  setParent: boolean;
  zLevel: ObjectZLevel;
  showMapName: boolean;
  direction: Direction;
  destinationX: number;
  destinationY: number;
  vertical: boolean;
  length: number;

  constructor(slice: Slice) {
    this.x = slice.data[0];
    this.y = slice.data[1];
    this.length = slice.data[2] & 0x7f;
    this.vertical = (slice.data[2] & 0x80) !== 0;
    this.map = (slice.data[3] | (slice.data[4] << 8)) & 0x1ff;
    this.setParent = (slice.data[4] & 0x02) !== 0;
    this.zLevel = (slice.data[4] & 0x04) >> 2;
    this.showMapName = (slice.data[4] & 0x08) !== 0;
    this.direction = (slice.data[4] & 0x30) >> 4;
    this.destinationX = slice.data[5];
    this.destinationY = slice.data[6];
  }
}

type Exit = SingleTileExit | MultiTileExit;

interface OpenDoor {
  x: number;
  y: number;
  tile: number;
}

export class MapEngine {
  name = "";
  index?: number;

  mapWidth = 0;
  mapHeight = 0;

  layers = {
    [LayerType.BG1]: new BG12Layer(),
    [LayerType.BG2]: new BG12Layer(),
    [LayerType.BG3]: new BG12Layer(),
  };

  objects: MapObject[];

  background: Surface = new Surface(256, 224, Color.Black);

  cameraLocked = false;

  scriptContext?: ScriptContext;

  animatedGraphics: Graphics;

  animatedPalette?: AnimatedPalette;

  paletteSet?: PaletteSet;
  layer3PaletteSet?: PaletteSet;

  directionInputsHeld: Direction[] = [];

  layer3Priority = false;

  triggers: Trigger[] = [];

  math: {
    index: number;
    half: boolean;
    subtract: boolean;
    mathLayers: number;
    mainScreen: MathLayer;
    subScreen: MathLayer;
  } = {
    index: 0,
    half: false,
    subtract: false,
    mathLayers: 0,
    mainScreen: 0,
    subScreen: 0,
  };

  compositorModel!: Model;
  compositorShape!: Shape;

  spriteLayerLow?: Surface;
  spriteLayerHigh?: Surface;

  spriteAnimations: SpriteAnimation[] = [];
  spriteTileLayoutSlice: Slice;

  pixelate = 0;

  tileProperties: TileProperties[] = [];

  singleTileExits: SingleTileExit[] = [];
  multiTileExits: MultiTileExit[] = [];

  stopped = false;

  openDoors: OpenDoor[] = [];

  getTileProperties(x: number, y: number) {
    const bg1 = this.layers[LayerType.BG1];
    const tile = bg1.tiles[x + y * bg1.width];
    return this.tileProperties[tile];
  }

  constructor() {
    this.animatedGraphics = new Graphics(
      Game.current.rom.getAnimatedMapGraphicsSlice(),
      GraphicsFormat.Snes4bpp,
      8,
      8,
      32
    );
    this.animatedGraphics.enablePaletteRendering();
    this.animatedGraphics.name = "Map Animated Graphics";

    const movementAnimations = Game.current.rom.getMovementAnimationSlice();
    for (let i = 0; i < 8; i++) {
      this.spriteAnimations.push(
        new SpriteAnimation(
          i,
          Array.from(movementAnimations.getArraySlice(i * 4, i * 4 + 4))
        )
      );
    }
    for (let i = 0; i < 4; i++) {
      this.spriteAnimations.push(
        new SpriteAnimation(
          8 + i,
          Array.from(movementAnimations.getArraySlice(32 + i, 33 + i))
        )
      );
    }

    this.spriteTileLayoutSlice = Game.current.rom.getSpriteTileLayoutSlice();
    this.objects = new Array(64).fill(0).map((n, i) => new MapObject(this, i));
    this.objects[OBJECT_ID_CAMERA].exists = true;
  }

  loadEmptyMap() {
    for (const layer of Object.values(this.layers)) {
      layer.tiles = [];
      layer.tileset = undefined;
      layer.dynamicTiles = [];
      layer.layer3Priority = false;
    }

    this.loadNPCs([]);

    this.animatedPalette = undefined;
    this.paletteSet = undefined;
  }

  loadMap(index: number, runScripts = true) {
    this.index = index;

    if (index === 3) {
      return this.loadEmptyMap();
    }

    const properties = new MapProperties(
      Game.current.rom.getMapPropertiesSlice(index)
    );

    SSj.log(properties);

    this.name = Game.current.rom.getMapName(properties.mapNameIndex);

    const tilePropertiesData = Game.current.rom.getTilePropertiesSlice(
      properties.layer1.tilePropertiesIndex
    ).data;

    this.tileProperties = [];

    const tilePropertiesCount = tilePropertiesData.length / 2;
    for (let i = 0; i < tilePropertiesCount; i++) {
      const value =
        tilePropertiesData[i] |
        (tilePropertiesData[tilePropertiesCount + i] << 8);
      this.tileProperties.push(value);
    }

    const graphicsBuffer = new Uint8Array(0xffff);

    const gs1 = Game.current.rom.getMapGraphicsSlice(
      properties.graphicset1Index,
      0x2000
    );
    graphicsBuffer.set(gs1.data, 0x0000);
    const gs2 = Game.current.rom.getMapGraphicsSlice(
      properties.graphicset2Index,
      0x1000
    );
    graphicsBuffer.set(gs2.data, 0x2000);
    const gs3 = Game.current.rom.getMapGraphicsSlice(
      properties.graphicset3Index,
      0x1000
    );
    graphicsBuffer.set(gs3.data, 0x3000);
    const gs4 = Game.current.rom.getMapGraphicsSlice(
      properties.graphicset4Index,
      0x1000
    );
    graphicsBuffer.set(gs4.data, 0x4000);

    const layer3GraphicsData = Game.current.rom.getLayer3GraphicsSlice(
      properties.layer3.graphicset
    );

    this.layers[LayerType.BG3].layer3Priority = properties.layer3.priority;

    const gsL3 = layer3GraphicsData.slice(0x40);

    const layer3Graphics = new Graphics(gsL3, GraphicsFormat.Snes2bpp);
    layer3Graphics.enablePaletteRendering();
    const layer3PaletteBytes = layer3GraphicsData.getArraySlice(0, 0x40);

    const animatedTileset = new AnimatedTileset(
      Game.current.rom.getAnimatedMapTilesetSlice(
        properties.animatedTilesetIndex
      ),
      this.animatedGraphics
    );

    const graphics = new Graphics(
      new Slice(properties.offset, graphicsBuffer),
      GraphicsFormat.Snes4bpp,
      8,
      8,
      48
    );
    graphics.enablePaletteRendering();
    graphics.name = `Map Graphics Combined #${index}`;

    const paletteSet = new PaletteSet(
      Game.current.rom
        .getMapPaletteSetSlice(properties.paletteIndex)
        .concat(Game.current.rom.getInitialCharacterPaletteSetSlice()),
      16
    );

    this.paletteSet = paletteSet;

    if (properties.paletteAnimationIndex) {
      this.animatedPalette = new AnimatedPalette(
        Game.current.rom.getMapPaletteAnimationSlice(
          properties.paletteAnimationIndex - 1
        ),
        paletteSet
      );
    } else {
      this.animatedPalette = undefined;
    }

    const tileset1 = new BG1Tileset(
      Game.current.rom.getMapTilesetSlice(properties.layer1.tilesetIndex),
      graphics,
      paletteSet,
      animatedTileset
    );
    const tileset2 = new BG1Tileset(
      Game.current.rom.getMapTilesetSlice(properties.layer2.tilesetIndex),
      graphics,
      paletteSet,
      animatedTileset
    );

    const {
      [LayerType.BG1]: bg1,
      [LayerType.BG2]: bg2,
      [LayerType.BG3]: bg3,
    } = this.layers;

    bg1.tileset = tileset1;
    bg1.tiles = Array.from(
      Game.current.rom.getMapLayoutSlice(properties.layer1.layoutIndex).data
    );
    bg1.width = properties.layer1.width;
    bg1.height = properties.layer1.height;
    bg1.wavyEffect = properties.layer1.wavyEffect;

    bg1.zLevels = [ZLevel.snes1L, ZLevel.snes1H];

    bg1.dirty = true;

    bg2.tileset = tileset2;
    bg2.tiles = Array.from(
      Game.current.rom.getMapLayoutSlice(properties.layer2.layoutIndex).data
    );
    bg2.width = properties.layer2.width;
    bg2.height = properties.layer2.height;
    bg2.shiftX = properties.layer2.shiftX;
    bg2.shiftY = properties.layer2.shiftY;
    bg2.wavyEffect = properties.layer2.wavyEffect;

    bg2.zLevels = [ZLevel.snes2L, ZLevel.snes2H];

    bg2.dirty = true;

    if (properties.layer3.layoutIndex) {
      bg3.tileset = new BG3Tileset(
        layer3Graphics,
        layer3PaletteBytes,
        this.paletteSet
      );
      bg3.tiles = Array.from(
        Game.current.rom.getMapLayoutSlice(properties.layer3.layoutIndex).data
      );
      bg3.width = properties.layer3.width;
      bg3.height = properties.layer3.height;
      bg3.shiftX = properties.layer3.shiftX;
      bg3.shiftY = properties.layer3.shiftY;
      bg3.wavyEffect = properties.layer3.wavyEffect;

      bg3.zLevels = [ZLevel.snes3L, ZLevel.snes3P];
    } else {
      bg3.tileset = undefined;
      bg3.tiles = [];
    }

    bg3.dirty = true;

    if (properties.mapParallaxIndex) {
      const parallax = Game.current.rom.getMapParallaxSlice(
        properties.mapParallaxIndex
      ).data;

      bg2.parallaxSpeedX = signed8(parallax[0]);
      bg2.parallaxSpeedY = signed8(parallax[1]);
      bg2.parallaxMultiplierX = parallax[4];
      bg2.parallaxMultiplierY = parallax[5];

      bg3.parallaxSpeedX = signed8(parallax[2]);
      bg3.parallaxSpeedY = signed8(parallax[3]);
      bg3.parallaxMultiplierX = parallax[6];
      bg3.parallaxMultiplierY = parallax[7];
    } else {
      bg2.parallaxSpeedX = 0;
      bg2.parallaxSpeedY = 0;
      bg2.parallaxMultiplierX = 1;
      bg2.parallaxMultiplierY = 1;

      bg3.parallaxSpeedX = 0;
      bg3.parallaxSpeedY = 0;
      bg3.parallaxMultiplierX = 1;
      bg3.parallaxMultiplierY = 1;
    }

    const npcs = NPCData.fromROM(Game.current.rom, index);

    this.loadNPCs(npcs);

    if (runScripts) {
      this.scriptContext?.stop();
      this.scriptContext = Game.current.createScriptContext(
        Game.current.rom.getMapEventPointer(index)
      );
    } else {
      this.scriptContext = undefined;
    }

    const colorMath = Game.current.rom.getColorMathSlice(
      properties.colorMathIndex
    );

    this.math = {
      index: properties.colorMathIndex,
      half: (colorMath.data[0] & 0x40) !== 0,
      subtract: (colorMath.data[0] & 0x80) !== 0,
      mathLayers: colorMath.data[0] & 0x3f,
      mainScreen: colorMath.data[1] & 0x3f,
      subScreen: colorMath.data[2] & 0x3f,
    };

    bg1.math = (this.math.mathLayers & MathLayer.Layer1) !== 0;
    bg2.math = (this.math.mathLayers & MathLayer.Layer2) !== 0;
    bg3.math = (this.math.mathLayers & MathLayer.Layer3) !== 0;
    bg1.mainscreen = true;
    bg1.subscreen = (this.math.subScreen & MathLayer.Layer1) !== 0;
    bg2.mainscreen = (this.math.mainScreen & MathLayer.Layer2) !== 0;
    bg2.subscreen = (this.math.subScreen & MathLayer.Layer2) !== 0;
    bg3.mainscreen = (this.math.mainScreen & MathLayer.Layer3) !== 0;
    bg3.subscreen = (this.math.subScreen & MathLayer.Layer3) !== 0;

    this.mapWidth = properties.mapWidth === 0 ? 0 : properties.mapWidth;
    this.mapHeight = properties.mapHeight === 0 ? 0 : properties.mapHeight;

    this.triggers = [];

    const triggers = Game.current.rom.getMapTriggerSlice(index);

    const triggerCount = triggers.length / 5;

    for (let i = 0; i < triggerCount; i++) {
      this.triggers.push(new Trigger(triggers.slice(i * 5, (i + 1) * 5)));
    }

    this.singleTileExits = [];
    this.multiTileExits = [];
    const singleTileExitSlice = Game.current.rom.getSingleTileExitsSlice(index);
    for (let i = 0; i < singleTileExitSlice.data.length / 6; i++) {
      this.singleTileExits.push(
        new SingleTileExit(singleTileExitSlice.slice(i * 6, (i + 1) * 6))
      );
    }
    const multiTileExitSlice = Game.current.rom.getMultiTileExitsSlice(index);
    for (let i = 0; i < multiTileExitSlice.data.length / 7; i++) {
      SSj.log(multiTileExitSlice.slice(i * 7, (i + 1) * 7).data);
      this.multiTileExits.push(
        new MultiTileExit(multiTileExitSlice.slice(i * 7, (i + 1) * 7))
      );
    }

    this.openDoors = [];

    this.update();
  }

  loadNPCs(npcs: NPCData[]) {
    let objectIndex = 0;
    while (objectIndex < 16) {
      if (objectIndex > 0) {
        this.objects[objectIndex].setVisible(false);
      }
      this.objects[objectIndex++].stop();
    }

    for (const npc of npcs) {
      const object = this.objects[objectIndex++];

      object.loadNpc(npc);
    }

    while (objectIndex < 49) {
      this.objects[objectIndex].stop();
      this.objects[objectIndex].setExists(false);
      this.objects[objectIndex++].setVisible(false);
    }
  }

  update() {
    if (this.stopped) {
      return;
    }

    this.scriptContext?.stepUntilWaiting();

    for (const object of this.objects) {
      if (object.objectScriptContext) {
        object.objectScriptContext.step();
      }

      object.update();
    }

    const player = this.getPlayerObject();

    if (
      player &&
      player.state !== ObjectState.Moving &&
      this.directionInputsHeld.length
    ) {
      if (player.canMove(this.directionInputsHeld[0])) {
        player.move(this.directionInputsHeld[0], 1);
      } else {
        player.look(this.directionInputsHeld[0]);
      }
    }

    if (this.animatedPalette) {
      this.animatedPalette.update();
    }

    this.layers[LayerType.BG1].updateScroll();
    this.layers[LayerType.BG2].updateScroll();
    this.layers[LayerType.BG3].updateScroll();
  }

  updateCamera(force = false) {
    if (force || !this.cameraLocked) {
      const cameraTracks = Game.current.journal.getPointCharacter()?.index;

      if (cameraTracks === undefined) {
        return;
      }

      this.objects[OBJECT_ID_CAMERA].x = this.objects[cameraTracks].x;
      this.objects[OBJECT_ID_CAMERA].y = this.objects[cameraTracks].y;
      this.objects[OBJECT_ID_CAMERA].subtileX = this.objects[
        cameraTracks
      ].subtileX;
      this.objects[OBJECT_ID_CAMERA].subtileY = this.objects[
        cameraTracks
      ].subtileY;

      // if (this.objects[cameraTracks].riding !== RidingType.None) {
      //   this.objects[OBJECT_ID_CAMERA].y -= 16;
      // }
    }
  }

  composite(target: Surface) {
    if (!this.paletteSet || !this.index || this.index === 3) {
      return;
    }

    const bg1 = this.layers[LayerType.BG1];
    const bg2 = this.layers[LayerType.BG2];
    const bg3 = this.layers[LayerType.BG3];

    const shader = this.compositorModel.shader;
    if (!shader) return;

    const [cameraX, cameraY] = this.getCameraPosition(
      target.width,
      target.height
    );

    if (
      !this.spriteLayerLow ||
      !this.spriteLayerHigh ||
      this.spriteLayerLow.width !== bg1.lowSurface.width ||
      this.spriteLayerLow.height !== bg1.lowSurface.height ||
      this.spriteLayerHigh.width !== bg2.lowSurface.width ||
      this.spriteLayerHigh.height !== bg2.lowSurface.height
    ) {
      this.spriteLayerLow = new Surface(
        bg1.lowSurface.width,
        bg1.lowSurface.height
      );

      this.spriteLayerHigh = new Surface(
        bg2.lowSurface.width,
        bg2.lowSurface.height
      );
    }

    this.spriteLayerLow.clear(Color.Transparent);
    this.spriteLayerHigh.clear(Color.Transparent);

    for (const object of [...this.objects].sort(this.objectSort)) {
      object.draw(this.spriteLayerLow, this.spriteLayerHigh);
    }

    shader.setFloat("pixelate", this.pixelate);
    shader.setSampler("palette", this.paletteSet.getTexture(), 2);
    shader.setFloat("t", Sphere.now() / 10);
    shader.setFloatVector("output_size", [target.width, target.height]);

    if (this.math.index) {
      shader.setFloat("math_sign", this.math.subtract ? -1 : 1);
      shader.setFloat("math_multiplier", this.math.half ? 0.5 : 1.0);
    }

    const layerOrder: Array<[boolean, BG12Layer, Surface, ZLevel]> = [
      [true, bg1, bg1.lowSurface, bg1.zLevels[0]],
      [true, bg1, bg1.highSurface, bg1.zLevels[1]],
      [true, bg2, bg2.lowSurface, bg2.zLevels[0]],
      [true, bg2, bg2.highSurface, bg2.zLevels[1]],
      [true, bg3, bg3.lowSurface, bg3.zLevels[0]],
      [true, bg3, bg3.highSurface, bg3.zLevels[1]],
      [false, bg1, this.spriteLayerLow, ZLevel.snesS2],
      [false, bg1, this.spriteLayerHigh, ZLevel.snesS3],
    ];
    // log: [[{},11],[{},15],[{},10],[{},14],[{},3],[{},17]]
    // SSj.log(layerOrder.map((l) => l.slice(1)));

    for (let i = 0; i < 8; i++) {
      const [tileLayer, layer, surface, zLevel] = layerOrder[i];

      const [xOffset, yOffset] = layer.getOffset(
        cameraX,
        cameraY,
        target.width,
        target.height
      );

      if (tileLayer) {
        layer.frameRender(0, 0, target.width, target.height, xOffset, yOffset);
      }
      shader.setBoolean(`layers[${i}].tiles`, tileLayer);
      shader.setSampler(`layers[${i}].tex`, surface, 2 + i);
      shader.setFloatVector(`layers[${i}].size`, [
        surface.width,
        surface.height,
      ]);
      /**
       * (this.math.mathLayers & MathLayer.Sprites) !== 0,
        (this.math.subScreen & MathLayer.Sprites) !== 0,
        (this.math.mainScreen & MathLayer.Sprites) !== 0,
       */
      shader.setBoolean(
        `layers[${i}].math`,
        tileLayer
          ? layer.math
          : (this.math.mathLayers & MathLayer.Sprites) !== 0
      );
      shader.setBoolean(
        `layers[${i}].wavy_effect`,
        tileLayer ? layer.wavyEffect : false
      );
      shader.setBoolean(`layers[${i}].wavy_effect_battle`, false);
      shader.setInt(`layers[${i}].depth`, zLevel);
      shader.setBoolean(
        `layers[${i}].subscreen`,
        tileLayer
          ? layer.subscreen
          : (this.math.subScreen & MathLayer.Sprites) !== 0
      );
      shader.setBoolean(
        `layers[${i}].mainscreen`,
        tileLayer
          ? layer.mainscreen
          : (this.math.mainScreen & MathLayer.Sprites) !== 0
      );
      shader.setFloatVector(`layer_offsets[${i}]`, [xOffset, yOffset]);
      shader.setFloatVector(`layer_sizes[${i}]`, [
        surface.width,
        surface.height,
      ]);
    }
    this.compositorShape.texture = this.paletteSet.getTexture();
    this.compositorModel.transform
      .identity()
      .scale(target.width, target.height);
    this.compositorModel.draw(target);
  }

  objectSort(a: MapObject, b: MapObject) {
    return a.y < b.y ? -1 : 1;
  }

  refreshObjects() {
    for (const object of this.objects) {
      object.dirty = true;
    }
  }

  async initialize() {
    this.compositorShape = new Shape(
      ShapeType.TriStrip,
      null,
      new VertexList([
        { x: 0, y: 0, u: 0, v: 1 },
        { x: 1, y: 0, u: 1, v: 1 },
        { x: 0, y: 1, u: 0, v: 0 },
        { x: 1, y: 1, u: 1, v: 0 },
      ])
    );

    this.compositorModel = new Model(
      [this.compositorShape],
      await Shader.fromFiles({
        fragmentFile: "@/assets/shaders/compositor/compositor.frag",
        vertexFile: "@/assets/shaders/compositor/compositor.vert",
      })
    );

    SSj.profile(this.compositorModel, "draw", "Layer Compositor");

    for (const layer of Object.values(this.layers)) {
      await layer.initialize();
    }

    for (const object of this.objects) {
      await object.initialize();
    }
  }

  acceptInput(input: InputMapping) {
    let direction;

    switch (input.intent) {
      case Intent.Up:
        direction = Direction.Up;
        break;
      case Intent.Down:
        direction = Direction.Down;
        break;
      case Intent.Left:
        direction = Direction.Left;
        break;
      case Intent.Right:
        direction = Direction.Right;
        break;
      case Intent.Accept:
        this.getPlayerObject()?.initiateInteraction();
        return;
      default:
        return;
    }

    switch (input.action) {
      case KeyboardAction.HoldStart: {
        this.directionInputsHeld.push(direction);
        break;
      }

      case KeyboardAction.HoldEnd: {
        const index = this.directionInputsHeld.indexOf(direction);

        if (index >= 0) {
          this.directionInputsHeld.splice(index, 1);
        }

        break;
      }
    }
  }

  getTriggerAt(x: number, y: number) {
    for (const trigger of this.triggers) {
      if (trigger.x === x && trigger.y === y) {
        SSj.log(this.triggers);
        return trigger;
      }
    }

    return undefined;
  }

  clearMovementKeys() {
    this.directionInputsHeld = [];
  }

  getObjectAt(x: number, y: number) {
    for (const object of this.objects) {
      if (object.exists && object.x === x && object.y === y) {
        return object;
      }
    }

    return undefined;
  }

  getSingleTileExitAt(x: number, y: number) {
    for (const exit of this.singleTileExits) {
      if (exit.x === x && exit.y === y) {
        return exit;
      }
    }

    return undefined;
  }

  getMultiTileExitAt(x: number, y: number) {
    for (const exit of this.multiTileExits) {
      if (
        (exit.vertical &&
          x === exit.x &&
          x >= exit.y &&
          x < exit.y + exit.length) ||
        (!exit.vertical &&
          y === exit.y &&
          x >= exit.x &&
          x < exit.x + exit.length)
      ) {
        return exit;
      }
    }

    return undefined;
  }

  getExitAt(x: number, y: number) {
    return this.getSingleTileExitAt(x, y) || this.getMultiTileExitAt(x, y);
  }

  async exit(exit: Exit) {
    SSj.log(exit);
    this.stop();
    await Game.current.fader.fade(FadingDirection.Out, 8);
    this.loadMap(exit.map);
    const object = this.getObject(OBJECT_ID_PARTY1);
    if (object) {
      object.setPosition(exit.destinationX, exit.destinationY);
      object.look(exit.direction);
      object.zLevel = exit.zLevel;
    }
    this.updateCamera();
    this.start();
    await Game.current.fader.fade(FadingDirection.In, 8);
  }

  stop() {
    this.stopped = true;
  }

  start() {
    this.stopped = false;
  }

  openDoor(x: number, y: number) {
    for (let dy = y - 1; dy <= y; dy++) {
      for (let dx = x - 1; dx <= x + 1; dx++) {
        const tile = this.layers[LayerType.BG1].getTileAt(dx, dy);
        if (doorTiles[tile]) {
          this.layers[LayerType.BG1].setTile(dx, dy, doorTiles[tile]);
          this.openDoors.push({ x: dx, y: dy, tile });
        }
      }
    }

    this.layers[LayerType.BG1].renderArea(x - 1, y - 1, 3, 2);
  }

  getObject(index: number) {
    switch (index) {
      case OBJECT_ID_PARTY1:
      case OBJECT_ID_PARTY2:
      case OBJECT_ID_PARTY3:
      case OBJECT_ID_PARTY4: {
        const indexInParty = index - OBJECT_ID_PARTY1;
        const partyMember = Game.current.journal.getCharacterInParty(
          indexInParty
        );
        return partyMember !== undefined
          ? this.objects[partyMember]
          : undefined;
      }
      default:
        return this.objects[index];
    }
  }

  getPlayerObject() {
    return this.getObject(OBJECT_ID_PARTY1);
  }

  refreshLayers() {
    for (const layer of Object.values(this.layers)) {
      layer.applyPendingModifications();
    }
  }

  getCamera() {
    return this.objects[OBJECT_ID_CAMERA];
  }

  getCameraPosition(targetW: number, targetH: number) {
    const halfScreenWidth = targetW / 2;
    const halfScreenHeight = targetH / 2;
    const mapWidth = this.mapWidth * 16;
    const mapHeight = this.mapHeight * 16;

    const cameraX =
      this.mapWidth > 0
        ? Math.min(
            Math.max(this.objects[OBJECT_ID_CAMERA].absX, halfScreenWidth),
            mapWidth - halfScreenWidth
          )
        : this.objects[OBJECT_ID_CAMERA].absX;
    const cameraY =
      this.mapHeight > 0
        ? Math.min(
            Math.max(this.objects[OBJECT_ID_CAMERA].absY, halfScreenHeight),
            mapHeight - halfScreenHeight
          )
        : this.objects[OBJECT_ID_CAMERA].absY;

    return [cameraX, cameraY];
  }
}
