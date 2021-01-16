import { ROM } from "@/src/Engine/Data/ROM";
import { Game } from "../Game";
import { EventScriptContext } from "./InstructionSets/Event/EventInstructionSet";
import { ScriptContext } from "./ScriptContext";

export class ScriptEngine {
  currentScript?: EventScriptContext;
  game: Game;

  constructor(game: Game) {
    this.game = game;
  }

  step() {
    try {
      this.currentScript?.stepUntilWaiting();
    } catch (e) {
      SSj.log("Script engine failed");
      SSj.log(e.toString());
      throw e;
      this.currentScript = undefined;
    }
  }

  run(offset: number) {
    if (this.currentScript && !this.currentScript.isFinished()) {
      throw "already had a script";
    }
    this.currentScript = Game.current.createScriptContext(offset);
  }
}
