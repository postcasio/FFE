import { DialogInstructionHandlerArguments } from "../DialogInstructionSet";

export function instr_0x_emit_character({
  stream,
  context,
  payload: { emit },
}: DialogInstructionHandlerArguments) {
  const instr = stream.next8();
  const character = instr - 2;

  context.disasm("emit", `@character(#$${character})`);

  emit(0x39);
  emit(0x39);
  emit(0x39);
}
