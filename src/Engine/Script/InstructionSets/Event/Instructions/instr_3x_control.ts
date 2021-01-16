import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_3x_control({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  switch (instr) {
    case 0x3a:
      context.disasm("enable_control", "");
      break;
    case 0x3b:
      context.disasm("disable_control", "");
      break;
  }
}
