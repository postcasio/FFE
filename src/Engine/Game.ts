import { ROM, Slice } from "./Data/ROM";
import { Fader } from "./Fader";
import { Journal } from "./Journal";
import { MapEngine } from "./Map/MapEngine";
import { MapObject } from "./Map/MapObject";
import { ObjectInstructionSet } from "./Script/InstructionSets/Object/ObjectInstructionSet";
import { EventInstructionSet } from "./Script/InstructionSets/Event/EventInstructionSet";
import { ScriptContext } from "./Script/ScriptContext";
import { ScriptEngine } from "./Script/ScriptEngine";
import { MessageBox } from "./MessageBox";
import {
  DialogInstructionHandlerPayload,
  DialogInstructionSet,
} from "./Script/InstructionSets/Dialog/DialogInstructionSet";
import { hex } from "./utils";
import { VariableWidthFont } from "./Fonts/VariableWidthFont";
import Prim from "prim";
import { Window } from "./Window/Window";
import { Graphics, GraphicsFormat } from "./Graphics/Graphics";
import { PaletteSet } from "./Graphics/PaletteSet";
import { InputManager } from "./Input/InputManager";
import { initializeDefaultMappings } from "./Input/defaultMappings";
import { InputMapping, InputMappingType } from "./Input/InputMapping";
import { Intent } from "./Input/Intent";
import { SpriteAnimationType } from "./Map/Sprite";
import { Debugger } from "./Debugger/Debugger";
import { FixedWidthFont } from "./Fonts/FixedWidthFont";
import { hirom } from "./Data/offsets";
import { ByteSwap } from "./Data/ByteSwap";

export class Game {
  static rom: ROM;
  static current: Game;

  mapEngine: MapEngine;
  scriptEngine: ScriptEngine;
  rom: ROM;
  journal: Journal;
  fader: Fader;
  messageBox!: MessageBox;
  variableWidthFont!: VariableWidthFont;
  fixedWidthFont!: FixedWidthFont;
  screen: Surface = new Surface(256, 224);
  screenShape: Shape;
  screenTransform: Transform;
  window!: Window;
  inputManager: InputManager;
  debugger: Debugger;
  disasmPrefixes = ["OBJ", "EVT", "MSG"]; // EVT, MSG, OBJ
  paused = false;
  cursorGraphics: Graphics;
  cursorPaletteSet: PaletteSet;

  constructor(rom: ROM) {
    Game.current = this;
    Game.rom = rom;
    this.debugger = new Debugger(this);
    this.rom = rom;
    this.mapEngine = new MapEngine();
    this.scriptEngine = new ScriptEngine(this);
    this.journal = new Journal(this);
    this.fader = new Fader(this.screen);
    this.screenShape = new Shape(
      ShapeType.TriStrip,
      this.screen,
      new VertexList([
        { x: 0, y: 0, u: 0, v: 1 },
        { x: 1, y: 0, u: 1, v: 1 },
        { x: 0, y: 1, u: 0, v: 0 },
        { x: 1, y: 1, u: 1, v: 0 },
      ])
    );
    this.screenTransform = new Transform();

    const height = Surface.Screen.height;
    const width = height * 1.33;

    this.screenTransform.scale(width, height);
    this.screenTransform.translate(0, 0);
    this.inputManager = new InputManager();

    initializeDefaultMappings(this.inputManager);

    this.cursorPaletteSet = new PaletteSet(rom.getMenuPaletteSetSlice(), 4);
    this.cursorGraphics = new Graphics(
      rom.getCursorGraphicsSlice(),
      GraphicsFormat.Snes4bpp,
      8,
      8
    );
  }

  async init() {
    const windowGraphics = new Graphics(
      Game.rom.getMessageGraphicsSlice(),
      GraphicsFormat.Snes4bpp,
      8,
      8,
      8
    );

    windowGraphics.name = "Window Graphics";

    this.window = await Window.create(
      windowGraphics,
      new PaletteSet(Game.rom.getMessagePaletteSetSlice(), 16)
    );

    const vwfSlice = Game.rom.getVariableWidthFontGraphicsSlice();
    const cpSlice = Game.rom.getChoicePointerGraphicsSlice();

    const combinedBuffer = new Uint8Array(vwfSlice.data.length + 22);
    combinedBuffer.set(vwfSlice.data, 0);
    combinedBuffer.set(
      Array.from(cpSlice.data).reduce((p, v) => {
        p.push(0, v);
        return p;
      }, [] as number[]),
      vwfSlice.data.length
    );
    SSj.log(vwfSlice.data.length);

    const vwfGraphics = new Graphics(
      new Slice(vwfSlice.offset, combinedBuffer),
      GraphicsFormat.ByteSwappedLinear1bpp,
      16,
      11
    );

    vwfGraphics.name = "Variable Width Font Graphics";

    this.variableWidthFont = await VariableWidthFont.create(
      vwfGraphics,
      Game.rom.getVariableWidthFontCharacterWidthsSlice()
    );

    const fwfGraphics = new Graphics(
      Game.rom.getFixedWidthFontGraphicsSlice(),
      GraphicsFormat.Snes2bpp,
      8,
      8
    );

    vwfGraphics.name = "Fixed Width Font Graphics";

    this.fixedWidthFont = await FixedWidthFont.create(fwfGraphics);

    this.messageBox = new MessageBox(this);

    await this.mapEngine.initialize();

    await this.fader.initialize();
  }

  render() {
    this.screen.clear(Color.Black);
    this.mapEngine.composite(this.screen);
    this.messageBox.draw(this.screen);
    this.fader.render();
    // Prim.drawSolidRectangle(this.screen, 0, 0, 256, 8, Color.Black);
    // Prim.drawSolidRectangle(this.screen, 0, 216, 256, 8, Color.Black);
    // Prim.drawSolidRectangle(this.screen, 0, 0, 8, 224, Color.Black);
    // Prim.drawSolidRectangle(this.screen, 248, 0, 8, 224, Color.Black);

    //this.renderPaletteDebug();
    //this.renderSpriteDebug();
    this.debugger.render();

    this.screenShape.draw(Surface.Screen, this.screenTransform);
  }

  renderPaletteDebug() {
    if (this.mapEngine.paletteSet) {
      Prim.blit(this.screen, 0, 0, this.mapEngine.paletteSet.getTexture());
    }
  }

  renderSpriteDebug() {
    let x = 0;
    for (const anim of [
      SpriteAnimationType.WalkingUp,
      SpriteAnimationType.WalkingRight,
      SpriteAnimationType.WalkingDown,
      SpriteAnimationType.WalkingLeft,
    ]) {
      for (let i = 0; i < 4; i++) {
        Font.Default.drawText(
          this.screen,
          i * 64,
          x * 48 + 24,
          this.mapEngine.objects[0].sprite.animations[anim].frames[i].toString()
        );
        this.mapEngine.objects[0].sprite?.draw(
          this.screen,
          this.screen,
          i * 64,
          x * 48,
          this.mapEngine.objects[0].sprite.animations[anim],
          i,
          this.mapEngine.objects[0].graphics!,
          this.mapEngine.paletteSet!,
          (this.mapEngine.objects[0].paletteIndex + 8) * 16
        );
        // Font.Default.drawText(
        //   this.screen,
        //   x * 32,
        //   i * 32 - 10,
        //   this.mapEngine.objects[0].sprite.animations[anim].frames[i].toString()
        // );
      }
      x++;
    }
  }

  update() {
    if (!this.paused) {
      this.inputManager.dispatchInputs();
      this.mapEngine.update();
      this.scriptEngine.step();
      this.fader.update();
      this.messageBox.update();
    }
  }

  createScriptContext(pointer: number) {
    return new ScriptContext(this, new EventInstructionSet(), pointer, {});
  }

  createObjectScriptContext(pointer: number, object: MapObject) {
    return new ScriptContext(this, new ObjectInstructionSet(), pointer, {
      object,
    });
  }

  createDialogScriptContext(pointer: number, parentContext: ScriptContext) {
    return new ScriptContext<
      DialogInstructionSet,
      DialogInstructionHandlerPayload
    >(this, new DialogInstructionSet(), pointer, {
      emit: this.messageBox.emit.bind(this.messageBox),
      parentContext,
    });
  }

  playerCanMove() {
    return this.scriptEngine.currentScript
      ? this.scriptEngine.currentScript.isFinished()
      : true;
  }

  dispatchInput(input: InputMapping) {
    switch (input.intent) {
      case Intent.Accept:
      case Intent.HurryMessage:
      case Intent.CursorDown:
      case Intent.CursorUp:
        if (this.messageBox.isOpen()) {
          this.messageBox.acceptInput(input);
        } else if (this.playerCanMove()) {
          this.mapEngine.acceptInput(input);
        }
        break;
      case Intent.Up:
      case Intent.Down:
      case Intent.Left:
      case Intent.Right:
        if (this.playerCanMove()) {
          this.mapEngine.acceptInput(input);
        }

        break;
    }
  }

  setPaused(paused: boolean) {
    this.paused = paused;
  }
}
