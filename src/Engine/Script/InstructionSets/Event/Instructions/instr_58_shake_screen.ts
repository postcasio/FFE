import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_58_shake_screen({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  const arg = stream.next8();

  const intensity = arg;

  context.disasm("shake_screen", `#${intensity}`);
}
