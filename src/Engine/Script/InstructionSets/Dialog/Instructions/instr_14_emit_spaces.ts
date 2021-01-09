import { DialogInstructionHandlerArguments } from "../DialogInstructionSet";

export function instr_14_emit_spaces({
  stream,
  context,
  payload: { emit },
}: DialogInstructionHandlerArguments) {
  const value = stream.next8();
  const count = stream.next8();

  context.disasm("emit", `' ' * #${count};`);

  for (let i = 0; i < count; i++) {
    emit(0x7f);
  }
}
