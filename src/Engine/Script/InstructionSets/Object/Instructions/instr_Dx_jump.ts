import { ObjectInstructionHandlerArguments } from "../ObjectInstructionSet";

export function instr_Dx_jump({
  stream,
  context,
}: ObjectInstructionHandlerArguments) {
  const instr = stream.next8();

  switch (instr) {
    case 0xdc:
      context.disasm("jump", "@low");
      break;
    case 0xdd:
      context.disasm("jump", "@high");
      break;
  }
}
