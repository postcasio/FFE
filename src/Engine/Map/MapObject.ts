import { Direction } from "../Script/Direction";
import { EventScriptContext } from "../Script/InstructionSets/Event/EventInstructionSet";
import { ObjectScriptContext } from "../Script/InstructionSets/Object/ObjectInstructionSet";
import { RidingType } from "../Script/RidingType";
import { MapEngine, TileProperties } from "./MapEngine";
import { NPCData, Speed, tilesPerSecondMap } from "./NPCData";
import { Graphics, GraphicsFormat } from "../Graphics/Graphics";
import { SpriteTileLayout } from "./SpriteTileLayout";
import { Game } from "../Game";
import { hex } from "../utils";
import { Sprite, SpriteAnimationType } from "./Sprite";
import { LayerType } from "./Layer";
import {
  EVENT_BIT_PARTY_FACING_DOWN,
  EVENT_BIT_PARTY_FACING_LEFT,
  EVENT_BIT_PARTY_FACING_RIGHT,
  EVENT_BIT_PARTY_FACING_UP,
} from "../Script/MeaningfulEventBits";

const partyFacingEventBits = [
  [Direction.Up, EVENT_BIT_PARTY_FACING_UP],
  [Direction.Right, EVENT_BIT_PARTY_FACING_RIGHT],
  [Direction.Down, EVENT_BIT_PARTY_FACING_DOWN],
  [Direction.Left, EVENT_BIT_PARTY_FACING_LEFT],
];

export enum SpritePriority {
  UseTile = 0,
  Upper = 1,
  Lower = 2,
  Both = 3,
}

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
  objectScriptContext?: ObjectScriptContext;
  paletteIndex = 0;
  graphics?: Graphics;
  lowSurface?: Surface;
  highSurface?: Surface;
  collision = true;
  passable = false;
  dirty = false;

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
  movingToX?: number = undefined;
  movingToY?: number = undefined;

  riding: RidingType = RidingType.None;
  showRider = false;
  zLevel: ZLevel = ZLevel.Lower;

  walkingFrame = 0;
  animationStep = 0;

  walkWhenMoving = true;

  get absX() {
    return this.x * 16 + this.subtileX * 16;
  }

  get absY() {
    return this.y * 16 + this.subtileY * 16;
  }

  rejectMoving?: () => void;
  resolveMoving?: () => void;

  map: MapEngine;

  sprite: Sprite;
  shape: Shape;
  model!: Model;

  priority: SpritePriority = SpritePriority.UseTile;

  constructor(map: MapEngine, index: number) {
    this.index = index;
    this.map = map;
    this.sprite = new Sprite(map.spriteTileLayoutSlice, map.spriteAnimations);
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
    this.activeTileLayout = SpriteTileLayout.fromROM(Game.current.rom, 1);
  }

  async initialize() {
    this.model = new Model(
      [this.shape],
      await new Shader({
        fragmentFile: "@/assets/shaders/sprite/sprite.frag",
        vertexFile: "@/assets/shaders/sprite/sprite.vert",
      })
    );
  }

  loadObjectScript(context: ObjectScriptContext) {
    this.objectScriptContext = context;
  }

  loadPalette(palette: number) {
    this.paletteIndex = palette;
    this.dirty = true;
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
    this.dirty = true;
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
    this.visible = true;

    if (this.eventBit) {
      const bit = Game.current.journal.getEventBit(this.eventBit);

      if (!bit) {
        this.exists = false;
        this.visible = false;
      }
    }

    this.dirty = true;
  }

  loadSprite(index: number) {
    this.loadGraphics(index);

    this.dirty = true;
  }

  getRenderOffset() {
    // return this.size === 16 ? 16 : 32;
    return this.riding === RidingType.None ? 16 : 24;
  }

  render() {
    if (!this.graphics || !this.map.paletteSet) {
      return;
    }

    if (!this.lowSurface || !this.highSurface) {
      this.lowSurface = new Surface(16, 24, Color.Transparent);
      this.lowSurface.blendOp = BlendOp.Replace;
      this.highSurface = new Surface(16, 24, Color.Transparent);
      this.highSurface.blendOp = BlendOp.Replace;
    }

    this.lowSurface.clear(Color.Transparent);
    this.highSurface.clear(Color.Transparent);

    const thisTileProperties = this.map.getTileProperties(
      this.movingToX === undefined ? this.x : this.movingToX,
      this.movingToY === undefined ? this.y : this.movingToY
    );

    if (this.size === 32) {
      // SSj.log("Size 32 sprite is not implemented");
      // return;
    }

    let animation, frame;
    switch (this.state) {
      case ObjectState.Moving:
        animation =
          thisTileProperties & TileProperties.AlwaysFaceUp &&
          thisTileProperties !== TileProperties.Impassable
            ? SpriteAnimationType.WalkingUp
            : this.getWalkingAnimationForDirection(this.movingDirection);
        frame = this.walkingFrame;
        break;
      case ObjectState.Stationary:
        animation = this.getStandingAnimationForDirection(this.direction);
        frame = 0;
        break;
    }

    let bottomPriority, topPriority;

    switch (this.priority) {
      case SpritePriority.UseTile:
        bottomPriority =
          (this.zLevel === ZLevel.Upper &&
            thisTileProperties & TileProperties.BridgeTile) ||
          (!this.riding &&
            thisTileProperties & TileProperties.BottomSpritePriority);
        topPriority =
          (this.zLevel === ZLevel.Upper &&
            thisTileProperties & TileProperties.BridgeTile) ||
          (!this.riding &&
            thisTileProperties & TileProperties.TopSpritePriority);
        break;
      case SpritePriority.Lower:
        bottomPriority = true;
        topPriority = false;
        break;
      case SpritePriority.Upper:
        bottomPriority = false;
        topPriority = true;
        break;
      case SpritePriority.Both:
        bottomPriority = topPriority = true;
        break;
    }

    const topSurface = topPriority ? this.highSurface : this.lowSurface;
    const bottomSurface = bottomPriority ? this.highSurface : this.lowSurface;

    this.sprite.draw(
      topSurface,
      bottomSurface,
      0,
      0,
      this.sprite.animations[animation],
      frame,
      this.graphics,
      this.map.paletteSet,
      this.map.paletteSet.colorsPerPalette * (8 + this.paletteIndex)
    );

    this.dirty = false;
  }

  move(direction: Direction, tiles: number): Promise<void> {
    const now = Sphere.now();

    this.state = ObjectState.Moving;
    this.movingDirection = direction;
    this.direction = direction;
    this.movingTiles = tiles;
    const time = (1 / tilesPerSecondMap[this.speed]) * 60;
    this.movingEnd = now + time;
    this.movingDelta = 1 / time;
    this.direction = direction;
    this.dirty = true;

    const [facingX, facingY] = this.getFacingTile();
    const tile = this.map.getTileProperties(facingX, facingY);

    if (this.isPlayerControlled()) {
      for (const [dir, bit] of partyFacingEventBits) {
        Game.current.journal.setEventBit(bit, dir === direction);
      }

      if (tile & TileProperties.DoorTile) {
        this.map.openDoor(facingX, facingY);
      }
    }

    this.movingToX = facingX;
    this.movingToY = facingY;

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
    this.movingToX = undefined;
    this.movingToY = undefined;
    this.dirty = true;
  }

  update() {
    const now = Sphere.now();

    switch (this.state) {
      case ObjectState.Moving: {
        let movedFullTile = false;
        let walkProgress, walkStep;

        switch (this.movingDirection) {
          case Direction.Up:
            walkProgress = this.subtileY = Math.max(
              -1,
              this.subtileY - this.movingDelta
            );
            walkStep = this.y;

            if (now >= this.movingEnd) {
              this.y--;
              movedFullTile = true;
            }

            break;
          case Direction.Down:
            walkProgress = this.subtileY = Math.min(
              1,
              this.subtileY + this.movingDelta
            );
            walkStep = this.y;

            if (now >= this.movingEnd) {
              this.y++;
              movedFullTile = true;
            }

            break;
          case Direction.Left:
            walkProgress = this.subtileX = Math.max(
              -1,
              this.subtileX - this.movingDelta
            );
            walkStep = this.x;

            if (now >= this.movingEnd) {
              this.x--;
              movedFullTile = true;
            }

            break;
          case Direction.Right:
            walkProgress = this.subtileX = Math.min(
              1,
              this.subtileX + this.movingDelta
            );
            walkStep = this.x;

            if (now >= this.movingEnd) {
              this.x++;
              movedFullTile = true;
            }

            break;
        }

        const oldFrame = this.walkingFrame;
        this.walkingFrame = this.walkWhenMoving
          ? ((walkStep & 1) << 1) | (Math.round(Math.abs(walkProgress * 2)) & 1)
          : 0;

        if (this.walkingFrame !== oldFrame) {
          this.dirty = true;
        }

        if (movedFullTile) {
          this.subtileY = 0;
          this.subtileX = 0;
          this.movingToX = undefined;
          this.movingToY = undefined;
          this.movingTiles--;

          if (!this.movingTiles) {
            this.dirty = true;

            this.resolveMoving?.();

            Dispatch.now(() => (this.state = ObjectState.Stationary));

            if (this.isPlayerControlled() && Game.current.playerCanMove()) {
              const trigger = this.map.getTriggerAt(this.x, this.y);

              if (trigger) {
                Game.current.scriptEngine.run(trigger.eventPointer);
                Game.current.scriptEngine.step();

                if (
                  Game.current.scriptEngine.currentScript?.isFinished() ===
                  false
                ) {
                  this.map.clearMovementKeys();
                }
              }

              const exit = this.map.getExitAt(this.x, this.y);

              if (exit) {
                this.map.clearMovementKeys();
                this.map.exit(exit);
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
    this.movingToX = undefined;
    this.movingToY = undefined;

    this.dirty = true;
  }

  draw(lowTarget: Surface, highTarget: Surface) {
    if (this.dirty) {
      this.render();
    }

    const x = this.absX;
    const y = this.absY - this.getRenderOffset();

    if (this.exists && this.visible && this.lowSurface && this.highSurface) {
      this.shape.texture = this.lowSurface;
      this.model.transform.identity().scale(16, 24).translate(x, y);
      this.model.draw(lowTarget);

      this.shape.texture = this.highSurface;
      this.model.transform.identity().scale(16, 24).translate(x, y);
      this.model.draw(highTarget);
    }
  }

  look(direction: Direction) {
    this.direction = direction;
    this.dirty = true;

    if (this.isPlayerControlled()) {
      for (const [dir, bit] of partyFacingEventBits) {
        Game.current.journal.setEventBit(bit, dir === direction);
      }
    }
  }

  getWalkingAnimationForDirection(direction: Direction) {
    switch (direction) {
      case Direction.Up:
        return SpriteAnimationType.WalkingUp;

      case Direction.Right:
        return SpriteAnimationType.WalkingRight;

      case Direction.Down:
        return SpriteAnimationType.WalkingDown;

      case Direction.Left:
        return SpriteAnimationType.WalkingLeft;
    }
  }

  getStandingAnimationForDirection(direction: Direction) {
    switch (direction) {
      case Direction.Up:
        return SpriteAnimationType.StandingUp;

      case Direction.Right:
        return SpriteAnimationType.StandingRight;

      case Direction.Down:
        return SpriteAnimationType.StandingDown;

      case Direction.Left:
        return SpriteAnimationType.StandingLeft;
    }
  }

  canMove(direction: Direction, isRandomlyDirected = false) {
    if (!this.collision) {
      return true;
    }

    const [x, y] = this.getFacingTile(direction);

    const bg1 = this.map.layers[LayerType.BG1];
    if (y >= bg1.height || y < 0 || x >= bg1.width || x < 0) {
      return false;
    }

    const properties = this.map.getTileProperties(x, y);

    if (properties === 0xfff7) {
      return false;
    }

    const isNPC = this.index !== 0;

    if (direction === Direction.Up) {
      if (!(properties & TileProperties.PassableThroughBottom)) {
        return false;
      }
    } else if (direction === Direction.Right) {
      if (!(properties & TileProperties.PassableThroughLeft)) {
        return false;
      }
    } else if (direction === Direction.Down) {
      if (!(properties & TileProperties.PassableThroughTop)) {
        return false;
      }
    } else if (direction === Direction.Left) {
      if (!(properties & TileProperties.PassableThroughRight)) {
        return false;
      }
    }

    if (!this.passable) {
      for (const object of this.map.objects) {
        if (
          object.visible &&
          object.exists &&
          object.collision &&
          !object.passable
        ) {
          if (
            (object.x === x && object.y === y) ||
            (object.movingToX === x && object.movingToY === y)
          ) {
            return false;
          }
        }
      }
    }

    return true;
  }

  getFacingTile(direction?: Direction, x: number = this.x, y: number = this.y) {
    switch (direction === undefined ? this.direction : direction) {
      case Direction.Up:
        return [x, y - 1];
      case Direction.Right:
        return [x + 1, y];
      case Direction.Down:
        return [x, y + 1];
      case Direction.Left:
        return [x - 1, y];
    }
  }

  initiateInteraction() {
    const [x, y] = this.getFacingTile();
    let object = this.map.getObjectAt(x, y);

    if (!object) {
      const properties = this.map.getTileProperties(x, y);
      if (properties === TileProperties.ThroughTile) {
        const [nx, ny] = this.getFacingTile(this.direction, x, y);
        object = this.map.getObjectAt(nx, ny);
      }
    }

    if (!object || !object.exists || !object.eventAddress) {
      return;
    }

    Game.current.scriptEngine.run(object.eventAddress);
  }

  isPlayerControlled() {
    return this.index === Game.current.journal.party[0];
  }

  setZLevel(z: number) {
    this.zLevel = z;
    this.dirty = true;
  }

  setVisible(visible: boolean) {
    this.visible = visible;
    this.dirty = true;
  }

  setWalkWhenMoving(walk: boolean) {
    this.walkWhenMoving = walk;
    this.dirty = true;
  }

  setRiding(riding: RidingType, showRider: boolean) {
    this.riding = riding;
    this.showRider = showRider;
    this.dirty = true;
  }

  setPriority(priority: SpritePriority) {
    this.priority = priority;
    this.dirty = true;
  }

  setExists(exists: boolean) {
    this.exists = exists;
    this.dirty = true;
  }
}
