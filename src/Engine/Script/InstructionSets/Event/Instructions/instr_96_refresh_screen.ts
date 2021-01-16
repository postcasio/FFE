import { FadingDirection } from "@/src/Engine/Fader";
import { Game } from "@/src/Engine/Game";
import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_96_refresh_screen({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("refresh_screen", ``);

  if (Game.current.fader.pendingFade) {
    Game.current.fader.pendingFade = false;
    Game.current.fader.fade(FadingDirection.In, 8);
  }
}
