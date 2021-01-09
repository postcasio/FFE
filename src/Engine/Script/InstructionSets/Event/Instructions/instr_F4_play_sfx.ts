import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_F4_play_sfx({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();
  const sfx = stream.next8();

  context.disasm("play_sfx", `#${sfx}`);
}
