import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_FE_ret({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("ret", "");

  context.returnFromSubroutine();
}
