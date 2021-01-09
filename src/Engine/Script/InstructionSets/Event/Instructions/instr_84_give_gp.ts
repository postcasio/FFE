import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_84_give_gp({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  const gp = stream.next16();

  context.disasm("give_gp", `#${gp}`);
}
