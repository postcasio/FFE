import Tween, { Easing } from "tween";
import { ROM_OFFSET_DIALOG_POINTER_LIST } from "./Data/offsets";
import { Game } from "./Game";
import { InputMapping } from "./Input/InputMapping";
import { Intent } from "./Input/Intent";
import { DialogScriptContext } from "./Script/InstructionSets/Dialog/DialogInstructionSet";
import { ScriptContext } from "./Script/ScriptContext";
import { TextWrap } from "./TextWrap";

const bg = new Color(0.3, 0.3, 0.6, 0.8);

export enum MessageBoxPosition {
  Top = 0,
  Bottom = 1,
}

export enum State {
  Closed,
  Open,
  Writing,
  Paging,
  Waiting,
  WaitingPage,
  Finished,
}

export class MessageBox {
  game: Game;
  state: State = State.Closed;
  speed = 1;
  position: MessageBoxPosition = MessageBoxPosition.Top;
  transparent = false;
  dialogScriptContext?: DialogScriptContext;
  textYOffset = 0;
  text: TextWrap;
  buffer: number[] = [];

  waitForKeypress = false;
  autoPageOnce = false;

  keypressPromise?: Promise<void>;
  keypressResolve?: () => void;
  keypressReject?: () => void;

  callbacksOnDidFinish: Array<() => void> = [];
  callbacksOnDidEmit: Array<() => void> = [];

  surface: Surface;

  constructor(game: Game, surface: Surface) {
    this.game = game;
    this.surface = surface;
    this.text = new TextWrap(this.game.variableWidthFont, 256 - 40);
  }

  loadDialog(index: number, parentContext: ScriptContext) {
    const pointer = this.game.rom.getUint16(
      ROM_OFFSET_DIALOG_POINTER_LIST + index * 2
    );

    this.stop(true);

    this.dialogScriptContext = this.game.createDialogScriptContext(
      pointer,
      parentContext
    );
    this.state = State.Writing;
  }

  update() {
    if (this.state === State.Writing) {
      this.dialogScriptContext?.stepUntilWaiting(this.game);
    }

    if (this.isOpen()) {
      this.text.update(this.speed);
    }
  }

  acceptInput(input: InputMapping) {
    switch (input.intent) {
      case Intent.Accept:
        if (this.state === State.Finished) {
          this.close();
        } else if (this.state === State.WaitingPage) {
          // We were waiting to page
          this.page();
        } else if (this.state === State.Writing && this.keypressPromise) {
          this.keypressResolve?.();
          this.keypressPromise = undefined;
        }
        break;
    }
  }

  isOpen() {
    return this.state !== State.Closed;
  }

  isEmitting() {
    return this.state === State.Writing;
  }

  render() {
    const height = 72;
    const width = 240;
    const left = 8;
    const top = 8;
    const paddingY = 8;
    const paddingX = 8;
    const textWidth = width - paddingX * 2;
    const textHeight = height - paddingY * 2;

    if (this.isOpen()) {
      const y =
        this.position === MessageBoxPosition.Top
          ? top
          : this.surface.height - height - top;

      if (!this.transparent) {
        Game.current.window.draw(this.surface, left, top, 30, 7);
      }

      this.surface.clipTo(
        left + paddingX,
        y + paddingY,
        textWidth,
        textHeight + 1
      );

      this.text.render(
        this.surface,
        left + paddingX,
        y + paddingY + this.textYOffset
      );

      this.surface.clipTo(0, 0, this.surface.width, this.surface.height);
    }
  }

  emit(value: number) {
    this.autoPageOnce = false;
    this.buffer.push(value);
  }

  stop(forceClose = false) {
    this.state = State.Finished;

    if (this.autoPageOnce || forceClose || !this.waitForKeypress) {
      this.close();
    }
  }

  close() {
    this.text.clear();
    this.buffer = [];
    this.state = State.Closed;

    this.dialogScriptContext?.stop();

    this.autoPageOnce = false;

    for (const onDidFinish of this.callbacksOnDidFinish) {
      onDidFinish();
    }

    this.callbacksOnDidFinish = [];
  }

  onDidFinish(callback: () => void) {
    this.callbacksOnDidFinish.push(callback);
  }

  onDidEmit(callback: () => void) {
    this.callbacksOnDidEmit.push(callback);
  }

  keypress() {
    return (
      this.keypressPromise ||
      (this.keypressPromise = new Promise((res, rej) => {
        this.keypressResolve = res;
        this.keypressReject = rej;
      }))
    );
  }

  requestPage(): Promise<void> {
    if (this.autoPageOnce) {
      return this.page();
    }

    this.state = State.WaitingPage;

    return Promise.resolve();
  }

  page(): Promise<void> {
    this.autoPageOnce = false;
    this.state = State.Paging;

    return new Tween(this as MessageBox, Easing.Linear)
      .easeIn(
        {
          textYOffset: -15 * 4,
        },
        30
      )
      .then(() => {
        this.text.clear();
        this.flush();
        this.textYOffset = 0;
        this.state = State.Writing;
      });
  }

  flush() {
    this.buffer = this.text.write(this.buffer);

    if (this.buffer.length) {
      this.state = State.WaitingPage;
    } else {
      this.text.onDidFinish(() => {
        for (const onDidEmit of this.callbacksOnDidEmit) {
          onDidEmit();
        }

        this.callbacksOnDidEmit = [];
      });
    }
  }
}
