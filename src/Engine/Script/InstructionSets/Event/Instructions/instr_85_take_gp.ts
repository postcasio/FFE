import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_85_take_gp({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  const gp = stream.next16();

  context.disasm("take_gp", `#${gp}`);
}
