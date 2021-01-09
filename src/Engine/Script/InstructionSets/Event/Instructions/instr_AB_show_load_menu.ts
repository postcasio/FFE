import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_AB_show_load_menu({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("show_load_menu", "");
}
