import { ROM } from "@/src/Engine/Data/ROM";
import Prim from "prim";
import { Palette } from "../Graphics/Palette";
import { Direction } from "../Script/Direction";
import { EventScriptContext } from "../Script/InstructionSets/Event/EventInstructionSet";
import { ObjectScriptContext } from "../Script/InstructionSets/Object/ObjectInstructionSet";
import { RidingType } from "../Script/RidingType";
import { ScriptContextState } from "../Script/ScriptContext";
import { MapEngine } from "./MapEngine";
import { NPCData, Speed, tilesPerSecondMap } from "./NPCData";
import { Graphics, GraphicsFormat } from "../Graphics/Graphics";
import { SpriteTileLayout } from "./SpriteTileLayout";
import { Game } from "../Game";
import { hex } from "../utils";
import { PaletteSet } from "../Graphics/PaletteSet";

const objectStateColors = {
  [ScriptContextState.Executing]: Color.Green,
  [ScriptContextState.Waiting]: Color.Orange,
  [ScriptContextState.Finished]: Color.Purple,
  [ScriptContextState.Error]: Color.Red,
};

export enum ObjectTypes {
  Camera,
}

export enum ObjectState {
  Stationary,
  Moving,
}

export enum ZLevel {
  Lower = 0,
  Upper = 1,
}

export const OBJECT_ID_CHAR0 = 0x00;
export const OBJECT_ID_CHAR1 = 0x01;
export const OBJECT_ID_CHAR2 = 0x02;
export const OBJECT_ID_CHAR3 = 0x03;
export const OBJECT_ID_CHAR4 = 0x04;
export const OBJECT_ID_CHAR5 = 0x05;
export const OBJECT_ID_CHAR6 = 0x06;
export const OBJECT_ID_CHAR7 = 0x07;
export const OBJECT_ID_CHAR8 = 0x08;
export const OBJECT_ID_CHAR9 = 0x09;
export const OBJECT_ID_CHARA = 0x0a;
export const OBJECT_ID_CHARB = 0x0b;
export const OBJECT_ID_CHARC = 0x0c;
export const OBJECT_ID_CHARD = 0x0d;
export const OBJECT_ID_CHARE = 0x0e;
export const OBJECT_ID_CHARF = 0x0f;
export const OBJECT_ID_CAMERA = 0x30;
export const OBJECT_ID_PARTY1 = 0x31;
export const OBJECT_ID_PARTY2 = 0x32;
export const OBJECT_ID_PARTY3 = 0x33;
export const OBJECT_ID_PARTY4 = 0x34;

export class MapObject {
  state: ObjectState = ObjectState.Stationary;
  index = 0;
  visible = false;
  graphicsIndex = 0;
  direction: Direction = Direction.Down;
  size = 0;
  eventAddress = 0;
  scriptContext?: EventScriptContext;
  objectScriptContext?: ObjectScriptContext;
  paletteIndex = 0;
  graphics?: Graphics;
  surface?: Surface;

  eventBit = 0;
  exists = false;
  speed: Speed = Speed.Normal;

  activeTileLayout?: SpriteTileLayout;

  movingDirection: Direction = Direction.Down;
  movingDelta = 0;
  movingEnd = 0;
  movingTiles = 0;

  x = 0;
  subtileX = 0;
  y = 0;
  subtileY = 0;

  riding: RidingType = RidingType.None;

  zLevel: ZLevel = ZLevel.Lower;

  get absX() {
    return this.x * 16 + this.subtileX * 16;
  }

  get absY() {
    return this.y * 16 + this.subtileY * 16;
  }

  rejectMoving?: () => void;
  resolveMoving?: () => void;

  map: MapEngine;

  constructor(map: MapEngine, index: number) {
    this.index = index;
    this.map = map;
  }

  loadObjectScript(context: ObjectScriptContext) {
    this.objectScriptContext = context;
  }

  loadPalette(palette: number) {
    this.paletteIndex = palette;
    SSj.log(`NPC palette Index ${palette}`);
  }

  loadGraphics(graphics: number) {
    this.graphicsIndex = graphics;
    this.graphics = new Graphics(
      Game.current.rom.getSpriteGraphicsSlice(graphics),
      GraphicsFormat.Snes4bpp,
      8,
      8,
      8
    );
    this.graphics.name = `Sprite Graphics #${hex(graphics, 2)}`;
    this.graphics.enablePaletteRendering();
  }

  loadNpc(npc: NPCData) {
    this.stop();

    this.x = npc.x;
    this.subtileX = 0;
    this.y = npc.y;
    this.subtileY = 0;

    this.eventAddress = npc.eventAddress;
    this.loadPalette(npc.paletteIndex);
    this.loadSprite(npc.spriteIndex);

    this.direction = npc.direction;
    this.size = npc.size;

    // this.surface = new Surface(this.size, this.size === 16 ? 24 : 32, Color.Magenta);

    this.eventBit = npc.eventBit;
    this.exists = true;
    this.activeTileLayout = SpriteTileLayout.fromROM(Game.current.rom, 1);

    this.render();
  }

  loadSprite(index: number) {
    this.loadGraphics(index);

    this.activeTileLayout = SpriteTileLayout.fromROM(Game.current.rom, 1);
  }

  getRenderOffset() {
    // return this.size === 16 ? 16 : 32;
    return this.riding === RidingType.None ? 16 : 32;
  }

  render() {
    if (!this.graphics || !this.activeTileLayout || !this.map.paletteSet) {
      return;
    }

    if (!this.surface) {
      this.surface = new Surface(16, 24, Color.Transparent);
    }

    this.surface.blendOp = BlendOp.Replace;
    this.surface.clear(Color.Transparent);

    if (this.size === 32) {
      SSj.log("Size 32 sprite is not implemented");
      // return;
    }

    // const rows = this.size === 16 ? 3 : 4;
    // const columns = this.size === 16 ? 2 : 4;
    const rows = 3;
    const columns = 2;

    for (let x = 0; x < columns; x++) {
      for (let y = 0; y < rows; y++) {
        const tileIndex = this.activeTileLayout.getTile(x + y * columns);
        this.graphics.drawTile(
          this.surface,
          tileIndex,
          x * 8,
          y * 8,
          this.map.paletteSet,
          this.map.paletteSet.colorsPerPalette * (8 + this.paletteIndex)
        );
      }
    }
  }

  move(direction: Direction, tiles: number): Promise<void> {
    const now = Sphere.now();

    this.state = ObjectState.Moving;
    this.movingDirection = direction;
    this.movingTiles = tiles;
    const time = (1 / tilesPerSecondMap[this.speed]) * 60;
    this.movingEnd = now + time;
    this.movingDelta = 1 / time;

    return new Promise((res, rej) => {
      this.resolveMoving = res;
      this.rejectMoving = rej;
    });
  }

  setPosition(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.subtileX = 0;
    this.subtileY = 0;
  }

  update() {
    const now = Sphere.now();

    switch (this.state) {
      case ObjectState.Moving: {
        let movedFullTile = false;

        switch (this.movingDirection) {
          case Direction.Up:
            this.subtileY = Math.max(-1, this.subtileY - this.movingDelta);

            if (now >= this.movingEnd) {
              this.y--;
              movedFullTile = true;
            }

            break;
          case Direction.Down:
            this.subtileY = Math.min(1, this.subtileY + this.movingDelta);

            if (now >= this.movingEnd) {
              this.y++;
              movedFullTile = true;
            }

            break;
          case Direction.Left:
            this.subtileX = Math.max(-1, this.subtileX - this.movingDelta);

            if (now >= this.movingEnd) {
              this.x--;
              movedFullTile = true;
            }

            break;
          case Direction.Right:
            this.subtileX = Math.min(1, this.subtileX + this.movingDelta);

            if (now >= this.movingEnd) {
              this.x++;
              movedFullTile = true;
            }

            break;
        }

        if (movedFullTile) {
          this.subtileY = 0;
          this.subtileX = 0;
          this.movingTiles--;

          if (!this.movingTiles) {
            this.state = ObjectState.Stationary;
            this.resolveMoving?.();

            if (this.index === 0 && Game.current.playerCanMove()) {
              const trigger = this.map.getTriggerAt(this.x, this.y);

              if (trigger) {
                SSj.log("HIT TRIGGER!");
                SSj.log(
                  `Starting event execution at ${hex(trigger.eventPointer, 6)}`
                );
                this.map.clearMovementKeys();
                Game.current.scriptEngine.currentScript = Game.current.createScriptContext(
                  trigger.eventPointer
                );
                Game.current.scriptEngine.step();
              }
            }
          } else {
            const time = (1 / tilesPerSecondMap[this.speed]) * 60;
            this.movingEnd = now + time;
          }
        }

        if (
          !this.map.cameraLocked &&
          this.index === Game.current.journal.party[0]
        ) {
          this.map.updateCamera();
        }

        break;
      }
    }
  }

  stop() {
    this.objectScriptContext?.stop();
    this.state = ObjectState.Stationary;
    this.subtileX = 0;
    this.subtileY = 0;
  }

  draw(target: Surface) {
    // const xOffset = cameraX - target.width / 2 + 8;
    // const yOffset = cameraY - target.height / 2;

    // const x = -xOffset + this.absX;
    // const y = -yOffset + this.absY - this.getRenderOffset();

    const x = this.absX;
    const y = this.absY - this.getRenderOffset();

    if (this.exists && this.visible && this.surface) {
      Prim.blit(target, x, y, this.surface);
    }
  }
}
