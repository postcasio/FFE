import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_F2_stop_song({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();

  const speed = stream.next8();

  context.disasm("stop_song", `@fade(#${speed})`);
}
