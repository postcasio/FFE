import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_B1_repeat({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();
  const repeats = context.getRepeats();

  context.disasm("repeat", `; ${repeats} remaining`);

  if (repeats) {
    context.repeat();
  }
}
