import { FadingDirection } from "@/src/Engine/Fader";
import { Game } from "@/src/Engine/Game";
import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_75_refresh_map({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("refresh_map", ``);

  Game.current.mapEngine.refreshLayers();
}
