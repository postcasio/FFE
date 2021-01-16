import Tween, { Easing } from "tween";
import {
  ROM_OFFSET_DIALOG,
  ROM_OFFSET_DIALOG_PAGE_INDEX,
  ROM_OFFSET_DIALOG_POINTER_LIST,
} from "./Data/offsets";
import { Game } from "./Game";
import { InputMapping } from "./Input/InputMapping";
import { Intent } from "./Input/Intent";
import { DialogScriptContext } from "./Script/InstructionSets/Dialog/DialogInstructionSet";
import { ScriptContext } from "./Script/ScriptContext";
import { TextWrap } from "./TextWrap";
import { hex } from "./utils";

const bg = new Color(0.3, 0.3, 0.6, 0.8);

const height = 72;
const width = 240;
const left = 8;
const top = 8;
const paddingY = 8;
const paddingX = 8;
const textWidth = width - paddingX * 2;
const textHeight = height - paddingY * 2;

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

interface Choice {
  line: number;
  index: number;
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

  pageIndex: number;

  choices: Choice[] = [];

  constructor(game: Game) {
    this.game = game;

    this.text = new TextWrap(this.game.variableWidthFont, 256 - 40);
    this.pageIndex = this.game.rom.getUint16(ROM_OFFSET_DIALOG_PAGE_INDEX);
  }

  loadDialog(index: number, parentContext: ScriptContext) {
    SSj.log(
      `Loading dialog ${index} pointer at ${hex(
        ROM_OFFSET_DIALOG_POINTER_LIST + index * 2,
        6
      )}`
    );
    let pointer = this.game.rom.getUint16(
      ROM_OFFSET_DIALOG_POINTER_LIST + index * 2
    );

    if (index > this.pageIndex) {
      pointer += 0x10000;
    }

    SSj.log(`final offset = ${hex(ROM_OFFSET_DIALOG + pointer, 6)}`);

    if (this.isOpen()) {
      this.stop(true);
    }

    this.dialogScriptContext = this.game.createDialogScriptContext(
      pointer,
      parentContext
    );

    this.state = State.Writing;
  }

  update() {
    if (this.state === State.Writing) {
      this.dialogScriptContext?.stepUntilWaiting();
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

  draw(target: Surface) {
    if (this.isOpen()) {
      const y =
        this.position === MessageBoxPosition.Top
          ? top
          : target.height - height - top;

      if (!this.transparent) {
        Game.current.window.draw(target, left, y, 30, 9, true, false);
      }

      target.clipTo(left + paddingX, y + paddingY, textWidth, textHeight + 1);

      this.text.render(
        target,
        left + paddingX,
        y + paddingY + this.textYOffset
      );

      target.clipTo(0, 0, target.width, target.height);
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
