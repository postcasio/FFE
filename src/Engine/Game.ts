import { ROM } from "./Data/ROM";
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
  screen: Surface = new Surface(256, 224);
  screenShape: Shape;
  screenTransform: Transform;
  window!: Window;
  inputManager: InputManager;

  disasmPrefixes = ["EVT"]; // EVT, MSG, OBJ

  constructor(rom: ROM) {
    Game.current = this;
    Game.rom = rom;
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
    const scale = 0.975;
    this.screenTransform.scale(
      Surface.Screen.width * scale,
      Surface.Screen.height * scale
    );
    this.screenTransform.translate(
      (Surface.Screen.width * (1 - scale)) / 2,
      (Surface.Screen.height * (1 - scale)) / 2
    );
    this.inputManager = new InputManager();

    initializeDefaultMappings(this.inputManager);
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

    const vwfGraphics = new Graphics(
      Game.rom.getVariableWidthFontGraphicsSlice(),
      GraphicsFormat.ByteSwappedLinear1bpp,
      16,
      11
    );

    vwfGraphics.name = "Variable Width Font Graphics";

    this.variableWidthFont = await VariableWidthFont.create(
      vwfGraphics,
      Game.rom.getVariableWidthFontCharacterWidthsSlice()
    );

    this.messageBox = new MessageBox(this, this.screen);

    await this.mapEngine.initialize();
  }

  render() {
    this.screen.clear(Color.Black);
    this.mapEngine.draw(this.screen);
    this.messageBox.render();
    this.fader.render();
    Prim.drawSolidRectangle(this.screen, 0, 0, 256, 8, Color.Black);
    Prim.drawSolidRectangle(this.screen, 0, 216, 256, 8, Color.Black);
    Prim.drawSolidRectangle(this.screen, 0, 0, 8, 224, Color.Black);
    Prim.drawSolidRectangle(this.screen, 248, 0, 8, 224, Color.Black);

    if (this.mapEngine.paletteSet) {
      // Prim.blit(this.screen, 0, 0, this.mapEngine.paletteSet.getTexture());
    }

    // this.mapEngine.combinedGraphicset?.debugDraw(this.screen, this.mapEngine.palette!, 8, 8);

    this.screenShape.draw(Surface.Screen, this.screenTransform);

    // this.variableWidthFont.drawCharacter(Surface.Screen, 2, 2, 0x22);
    // Prim.blit(Surface.Screen, 20, 20, this.variableWidthFont.surface);
    // for (const [i, char] of this.variableWidthFont.characters) {
    //   Prim.drawRectangle(Surface.Screen, 20 + char.x, 20 + char.y, char.width, 11, 1, Color.Magenta);
    // }
  }

  update() {
    this.inputManager.dispatchInputs();
    this.mapEngine.update();
    this.scriptEngine.step();
    this.fader.update();
    this.messageBox.update();
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

  dispatchInput(input: InputMapping) {
    switch (input.intent) {
      case Intent.Accept:
      case Intent.HurryMessage:
        if (this.messageBox.isOpen()) {
          this.messageBox.acceptInput(input);
        } else {
          this.mapEngine.acceptInput(input);
        }
        break;
      case Intent.Up:
      case Intent.Down:
      case Intent.Left:
      case Intent.Right:
        this.mapEngine.acceptInput(input);
        break;
    }
  }
}
