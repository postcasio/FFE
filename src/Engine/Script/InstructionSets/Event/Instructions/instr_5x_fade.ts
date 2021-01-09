import { FadingDirection } from "@/src/Engine/Fader";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_5x_fade({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();
  const speed = stream.next8();
  const opt = instr === 0x59 ? "@in" : "@out";

  context.disasm("fade", `${opt} #${speed}`);

  game.fader.fade(
    instr === 0x59 ? FadingDirection.In : FadingDirection.Out,
    speed
  );
}
