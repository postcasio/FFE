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
import { MapObject, ObjectState, OBJECT_ID_CAMERA } from "./MapObject";
import { MapProperties } from "./MapProperties";
import { BG3Tileset } from "./BG3Tileset";

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

export class MapEngine {
  name = "";
  index?: number;

  layers = {
    [LayerType.BG1]: new BG12Layer(),
    [LayerType.BG2]: new BG12Layer(),
    [LayerType.BG3]: new BG12Layer(),
  };

  objects: MapObject[] = new Array(64)
    .fill(0)
    .map((n, i) => new MapObject(this, i));

  background: Surface = new Surface(256, 224, Color.Black);

  cameraLocked = false;

  scriptContext?: ScriptContext;

  animatedGraphics: Graphics;

  animatedPalette?: AnimatedPalette;

  paletteSet?: PaletteSet;
  layer3PaletteSet?: PaletteSet;

  directionInputsHeld: Direction[] = [];

  layer3Priority = false;

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

  loadMap(index: number) {
    this.index = index;

    if (index === 3) {
      return this.loadEmptyMap();
    }

    const properties = new MapProperties(
      Game.current.rom.getMapPropertiesSlice(index)
    );

    this.name = Game.current.rom.getMapName(properties.mapNameIndex);

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
      Game.current.rom.getMapPaletteSetSlice(properties.paletteIndex),
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
    SSj.log(properties.layer3);
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

    this.scriptContext = Game.current.createScriptContext(
      Game.current.rom.getMapEventPointer(index)
    );

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

    SSj.log(this.math);

    bg1.math = (this.math.mathLayers & MathLayer.Layer1) !== 0;
    bg2.math = (this.math.mathLayers & MathLayer.Layer2) !== 0;
    bg3.math = (this.math.mathLayers & MathLayer.Layer3) !== 0;
    bg1.mainscreen = true;
    bg1.subscreen = (this.math.subScreen & MathLayer.Layer1) !== 0;
    bg2.mainscreen = (this.math.mainScreen & MathLayer.Layer2) !== 0;
    bg2.subscreen = (this.math.subScreen & MathLayer.Layer2) !== 0;
    bg3.mainscreen = (this.math.mainScreen & MathLayer.Layer3) !== 0;
    bg3.subscreen = (this.math.subScreen & MathLayer.Layer3) !== 0;

    this.update();
  }

  loadNPCs(npcs: NPCData[]) {
    let objectIndex = 0;
    while (objectIndex < 16) {
      // if (objectIndex > 0) {
      //   this.objects[objectIndex].exists = false;
      //   this.objects[objectIndex].visible = false;
      // }
      this.objects[objectIndex++].stop();
    }

    for (const npc of npcs) {
      const object = this.objects[objectIndex++];

      object.loadNpc(npc);

      if (Game.current.journal.getEventBit(npc.eventBit)) {
        object.visible = true;
      } else {
        object.visible = false;
      }
    }

    while (objectIndex < 48) {
      this.objects[objectIndex].stop();
      this.objects[objectIndex].exists = false;
      this.objects[objectIndex++].visible = false;
    }
  }

  update() {
    this.scriptContext?.stepUntilWaiting();

    for (const object of this.objects) {
      if (object.objectScriptContext) {
        object.objectScriptContext.step();
      }

      object.update();
    }

    const player = this.objects[0];

    if (
      player.state !== ObjectState.Moving &&
      this.directionInputsHeld.length
    ) {
      player.move(this.directionInputsHeld[0], 1);
    }

    if (this.animatedPalette) {
      this.animatedPalette.update();
    }
  }

  updateCamera(force = false) {
    if (force || !this.cameraLocked) {
      const cameraTracks = Game.current.journal.party[0];

      if (cameraTracks === 0xff) {
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

    const shader = this.compositorModel.shader;
    if (!shader) return;

    const cameraX = this.objects[OBJECT_ID_CAMERA].absX;
    const cameraY = this.objects[OBJECT_ID_CAMERA].absY;

    for (const layer of Object.values(this.layers)) {
      layer.frameRender(0, 0, target.width, target.height, cameraX, cameraY);
    }

    shader.setSampler("palette", this.paletteSet.getTexture(), 2);
    shader.setFloat("t", Sphere.now() / 10);
    shader.setFloatVector("output_size", [target.width, target.height]);

    if (this.math.index) {
      shader.setFloat("math_sign", this.math.subtract ? -1 : 1);
      shader.setFloat("math_multiplier", this.math.half ? 0.5 : 1.0);
    }

    const bg1 = this.layers[LayerType.BG1];
    const bg2 = this.layers[LayerType.BG2];
    const bg3 = this.layers[LayerType.BG3];

    const layerOrder: Array<[BG12Layer, Surface, ZLevel]> = [
      [bg1, bg1.lowSurface, bg1.zLevels[0]],
      [bg1, bg1.highSurface, bg1.zLevels[1]],
      [bg2, bg2.lowSurface, bg2.zLevels[0]],
      [bg2, bg2.highSurface, bg2.zLevels[1]],
      [bg3, bg3.lowSurface, bg3.zLevels[0]],
      [bg3, bg3.highSurface, bg3.zLevels[1]],
    ];
    // log: [[{},11],[{},15],[{},10],[{},14],[{},3],[{},17]]
    // SSj.log(layerOrder.map((l) => l.slice(1)));

    for (let i = 0; i < 6; i++) {
      const [layer, surface, zLevel] = layerOrder[i];
      shader.setSampler(`layers[${i}].tex`, surface, 2 + i);

      const xOffset =
        cameraX / layer.parallaxMultiplierX +
        layer.shiftX * 16 -
        target.width / 2 +
        8;
      const yOffset =
        cameraY / layer.parallaxMultiplierY +
        layer.shiftY * 16 -
        target.height / 2;
      shader.setFloatVector(`layers[${i}].size`, [
        surface.width,
        surface.height,
      ]);
      shader.setBoolean(`layers[${i}].math`, layer.math);
      shader.setBoolean(`layers[${i}].wavy_effect`, layer.wavyEffect);
      shader.setBoolean(`layers[${i}].wavy_effect_battle`, false);
      shader.setInt(`layers[${i}].depth`, zLevel);
      shader.setBoolean(`layers[${i}].subscreen`, layer.subscreen);
      shader.setBoolean(`layers[${i}].mainscreen`, layer.mainscreen);
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

  refreshObjects() {
    for (const object of this.objects) {
      object.render();
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
  }

  acceptInput(input: InputMapping) {
    let direction;

    const object = this.objects[0];

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
}
