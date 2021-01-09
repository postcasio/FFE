import { EVENT_BIT_GO_TO_NARSHE_SCENE_AFTER_MAGITEK } from "@/src/Engine/Journal";
import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export enum ScriptCutscene {
  FloatingIsland = 0xa8,
  TitleScreen = 0xa9,
  SnowfieldIntro = 0xaa,
  WorldOfRuin = 0xad,
  MagitekEscape = 0xae,
  AirshipEnding = 0xbf,
}

export function instr_Ax_cutscene({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();

  context.disasm("cutscene", `${ScriptCutscene[instruction].toLowerCase()}`);

  switch (instruction) {
    case ScriptCutscene.SnowfieldIntro:
      game.journal.setEventBit(EVENT_BIT_GO_TO_NARSHE_SCENE_AFTER_MAGITEK);
      break;
  }
}
