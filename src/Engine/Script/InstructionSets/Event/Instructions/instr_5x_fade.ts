import { FadingDirection } from "@/src/Engine/Fader";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_5x_fade({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();
  let speed = 0;
  let opt = "?";

  switch (instr) {
    case 0x59:
    case 0x5a:
      speed = stream.next8();
      opt = instr === 0x59 ? "@in" : "@out";

      break;
    case 0x97:
      speed = 16;
      opt = "@out";

      break;
  }

  context.disasm("fade", `${opt} #${speed}`);

  game.fader.fade(
    instr === 0x59 ? FadingDirection.In : FadingDirection.Out,
    speed
  );
}
