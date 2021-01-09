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
import { BG12Layer } from "./BG1Layer";
import { BG1Tileset } from "./BG1Tileset";
import { LayerType } from "./Layer";
import { MapObject, ObjectState, OBJECT_ID_CAMERA } from "./MapObject";
import { MapProperties } from "./MapProperties";

export class MapEngine {
  name = "";

  layers = {
    [LayerType.BG1]: new BG12Layer(),
    [LayerType.BG2]: new BG12Layer(),
  };

  objects: MapObject[] = new Array(64)
    .fill(0)
    .map((n, i) => new MapObject(this, i));

  cameraLocked = false;

  scriptContext?: ScriptContext;

  animatedGraphics: Graphics;

  animatedPalette?: AnimatedPalette;

  paletteSet?: PaletteSet;

  directionInputsHeld: Direction[] = [];

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

  loadMap(index: number) {
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

    // const gsL3 = Game.current.rom.getLayer3GraphicsSlice(properties.layer3.graphicset);
    // SSj.log('Layer 3 GFX: ' + properties.layer3.graphicset);
    // graphicsBuffer.set(gsL3.data, 0x6000);
    // ^ this actually contains tileset data at the beginning.

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

    const { [LayerType.BG1]: bg1, [LayerType.BG2]: bg2 } = this.layers;

    bg1.tileset = tileset1;
    bg1.tiles = Array.from(
      Game.current.rom.getMapLayoutSlice(properties.layer1.layoutIndex).data
    );
    bg1.width = properties.layer1.width;
    bg1.height = properties.layer1.height;
    bg1.wavyEffect = properties.layer1.wavyEffect;

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

    bg2.dirty = true;

    if (properties.mapParallaxIndex) {
      const parallax = Game.current.rom.getMapParallaxSlice(
        properties.mapParallaxIndex
      ).data;

      bg2.parallaxSpeedX = signed8(parallax[0]);
      bg2.parallaxSpeedY = signed8(parallax[1]);
      bg2.parallaxMultiplierX = parallax[4];
      bg2.parallaxMultiplierY = parallax[5];

      // bg3.parallaxSpeedX = signed8(parallax[2]);
      // bg3.parallaxSpeedY = signed8(parallax[3]);
      // bg3.parallaxMultiplierX = parallax[6];
      // bg3.parallaxMultiplierY = parallax[7];
    } else {
      bg2.parallaxSpeedX = 0;
      bg2.parallaxSpeedY = 0;
      bg2.parallaxMultiplierX = 1;
      bg2.parallaxMultiplierY = 1;
    }

    const npcs = NPCData.fromROM(Game.current.rom, index);

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

    this.scriptContext = Game.current.createScriptContext(
      Game.current.rom.getMapEventPointer(index)
    );

    this.update();
  }

  update() {
    this.scriptContext?.stepUntilWaiting(Game.current);

    for (const object of this.objects) {
      if (object.objectScriptContext) {
        object.objectScriptContext.step(Game.current);
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

  draw(target: Surface) {
    if (!this.paletteSet) {
      return;
    }

    const cameraX = this.objects[OBJECT_ID_CAMERA].absX;
    const cameraY = this.objects[OBJECT_ID_CAMERA].absY;

    const paletteTexture = this.paletteSet.getTexture();

    this.layers[LayerType.BG1].frameRender(
      0,
      0,
      target.width,
      target.height,
      cameraX,
      cameraY
    );
    this.layers[LayerType.BG2].frameRender(
      0,
      0,
      target.width,
      target.height,
      cameraX,
      cameraY
    );

    // if (!this.layer3Priority) {
    // this.layers[2].draw(this.surface, cameraX, cameraY, 'default');
    // this.layers[2].draw(this.surface, cameraX, cameraY, 'priority');
    // }

    this.layers[LayerType.BG2].paletteShader.setSampler(
      "palette",
      paletteTexture,
      2
    );
    this.layers[LayerType.BG2].drawLowPriority(
      target,
      0,
      0,
      target.width,
      target.height,
      cameraX,
      cameraY
    );

    this.layers[LayerType.BG1].paletteShader.setSampler(
      "palette",
      paletteTexture,
      2
    );
    this.layers[LayerType.BG1].drawLowPriority(
      target,
      0,
      0,
      target.width,
      target.height,
      cameraX,
      cameraY
    );

    for (const object of this.objects) {
      object.draw(target, cameraX, cameraY);
    }

    this.layers[LayerType.BG2].paletteShader.setSampler(
      "palette",
      paletteTexture,
      2
    );
    this.layers[LayerType.BG2].drawHighPriority(
      target,
      0,
      0,
      target.width,
      target.height,
      cameraX,
      cameraY
    );

    this.layers[LayerType.BG1].paletteShader.setSampler(
      "palette",
      paletteTexture,
      2
    );
    this.layers[LayerType.BG1].drawHighPriority(
      target,
      0,
      0,
      target.width,
      target.height,
      cameraX,
      cameraY
    );

    // if (this.layer3Priority) {
    // this.layers[2].draw(this.surface, cameraX, cameraY, 'default');
    // this.layers[2].draw(this.surface, cameraX, cameraY, 'priority');
    // }
  }

  refreshObjects() {
    for (const object of this.objects) {
      object.render();
    }
  }

  async initialize() {
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
