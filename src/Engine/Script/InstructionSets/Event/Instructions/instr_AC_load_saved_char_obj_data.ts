import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_AC_load_saved_char_obj_data({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("load_saved_char_obj_data", "");
}
