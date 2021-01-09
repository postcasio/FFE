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
      this.currentScript?.stepUntilWaiting(this.game);
    } catch (e) {
      SSj.log("Script engine failed");
      SSj.log(e.toString());

      this.currentScript = undefined;
    }
  }
}
