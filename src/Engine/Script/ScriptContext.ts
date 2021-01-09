import { hex } from "@/src/Engine/utils";
import { Game } from "../Game";
import { MapObject } from "../Map/MapObject";
import { InstructionHandlerPayload, InstructionSet } from "./InstructionSet";
import { InstructionStream } from "./InstructionStream";

export enum ScriptContextState {
  Executing,
  Waiting,
  Finished,
  Error,
}

export class ScriptContext<
  T extends InstructionSet<P> = InstructionSet<unknown>,
  P = unknown
> {
  state: ScriptContextState = ScriptContextState.Executing;

  stream: InstructionStream;
  lastIP = 0;
  lastRawIP = 0;

  returnAddressStack: number[] = [];
  game: Game;

  repeatPoint = 0;
  repeatCount = 0;
  instructionSet: T;
  payload: P;

  callbacksOnDidFinish: Array<() => void> = [];

  constructor(game: Game, instructionSet: T, ip: number, payload: P) {
    this.game = game;
    this.instructionSet = instructionSet;
    this.payload = payload;

    this.stream = instructionSet.createInstructionStream(game.rom);
    this.stream.seek(ip);
  }

  getInstructionHandlerPayload(): InstructionHandlerPayload {
    return {
      context: this,
      stream: this.stream,
      game: this.game,
      payload: this.payload,
    };
  }

  isWaiting() {
    return this.state === ScriptContextState.Waiting;
  }

  isReady() {
    return this.state === ScriptContextState.Executing;
  }

  isFinished() {
    return (
      this.state === ScriptContextState.Finished ||
      this.state === ScriptContextState.Error
    );
  }

  stepUntilWaiting(game: Game) {
    do {
      this.step(game);
    } while (this.isReady());
  }

  step(game: Game) {
    if (!this.isReady()) {
      return;
    }

    this.lastIP = this.stream.ip;
    this.lastRawIP = this.stream.rawIP;

    const instruction = this.stream.peek8();

    const handler = this.instructionSet.getInstructionHandler(instruction);

    if (handler) {
      handler(this.getInstructionHandlerPayload());
    } else {
      SSj.log(`ScriptContext<${this.instructionSet.constructor.name}> failed`);
      SSj.log(
        `Invalid instruction ${hex(instruction, 2)} at ${hex(this.lastIP, 6)}`
      );

      this.state = ScriptContextState.Error;
    }
  }

  disasm = (mnemonic: string, args: string, trimEnd = 0) => {
    if (!this.game.disasmPrefixes.includes(this.instructionSet.disasmPrefix)) {
      return;
    }

    const bytes = Array.from(
      this.stream.rom.getArraySlice(this.lastRawIP, this.stream.rawIP)
    );
    SSj.log(
      `${Sphere.now().toString().padStart(8, " ")} : ${
        this.instructionSet.disasmPrefix
      } ${hex(this.lastIP, 6)} : ${bytes
        .slice(0, bytes.length - trimEnd)
        .map((byte) => hex(byte, 2))
        .join(" ")
        .padEnd(18, " ")} : ${mnemonic} ${args}`
    );
  };

  callSubroutine(offset: number) {
    this.returnAddressStack.push(this.stream.ip);
    this.stream.seek(offset);
  }

  returnFromSubroutine() {
    if (!this.returnAddressStack.length) {
      this.state = ScriptContextState.Finished;

      return;
    }

    this.stream.seek(this.returnAddressStack.pop()!);
  }

  waitForPromise(promise: Promise<void>) {
    this.state = ScriptContextState.Waiting;

    promise.then(() => {
      if (this.state === ScriptContextState.Waiting) {
        this.state = ScriptContextState.Executing;
      }
    });
  }

  waitForFrames(frames: number) {
    this.state = ScriptContextState.Waiting;

    Dispatch.later(frames, () => {
      if (this.state === ScriptContextState.Waiting) {
        this.state = ScriptContextState.Executing;
      }
    });
  }

  waitForObject(object: MapObject) {
    if (
      object.objectScriptContext &&
      !object.objectScriptContext.isFinished()
    ) {
      this.state = ScriptContextState.Waiting;

      object.objectScriptContext.onDidFinish(() => {
        if (this.state === ScriptContextState.Waiting) {
          this.state = ScriptContextState.Executing;
        }
      });
    }
  }

  waitForMessageBox() {
    if (this.game.messageBox.isOpen()) {
      this.state = ScriptContextState.Waiting;

      this.game.messageBox.onDidFinish(() => {
        if (this.state === ScriptContextState.Waiting) {
          this.state = ScriptContextState.Executing;
        }
      });
    }
  }

  waitForMessageBoxEmit(): Promise<void> {
    if (this.game.messageBox.isEmitting()) {
      return new Promise((res, rej) => {
        this.state = ScriptContextState.Waiting;
        this.game.messageBox.flush();
        this.game.messageBox.onDidEmit(() => {
          if (this.state === ScriptContextState.Waiting) {
            this.state = ScriptContextState.Executing;
            res();
          }
        });
      });
    }

    return Promise.resolve();
  }

  waitForFade() {
    if (this.game.fader.fading) {
      this.state = ScriptContextState.Waiting;

      this.game.fader.onDidFinish(() => {
        if (this.state === ScriptContextState.Waiting) {
          this.state = ScriptContextState.Executing;
        }
      });
    }
  }

  setRepeat(ip: number, count: number) {
    this.repeatPoint = ip;
    this.repeatCount = count;
  }

  getRepeats() {
    return this.repeatCount;
  }

  repeat() {
    this.repeatCount--;
    this.jump(this.repeatPoint);
  }

  jump(target: number) {
    this.stream.seek(target);
  }

  stop() {
    this.state = ScriptContextState.Finished;

    for (const callback of this.callbacksOnDidFinish) {
      callback();
    }

    this.callbacksOnDidFinish = [];
  }

  onDidFinish(callback: () => void) {
    this.callbacksOnDidFinish.push(callback);
  }
}
