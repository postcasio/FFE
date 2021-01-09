import { DialogInstructionHandlerArguments } from "../DialogInstructionSet";

export function instr_01_emit_newline({
  stream,
  context,
  payload: { emit },
}: DialogInstructionHandlerArguments) {
  const value = stream.next8();

  context.disasm("emit", `'\\n'`);

  emit(0x01);
}
