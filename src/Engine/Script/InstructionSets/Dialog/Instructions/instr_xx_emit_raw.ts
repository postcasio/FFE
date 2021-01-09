import { ROM } from "@/src/Engine/Data/ROM";
import { DialogInstructionHandlerArguments } from "../DialogInstructionSet";

export function instr_xx_emit_raw({
  stream,
  context,
  game,
  payload: { emit },
}: DialogInstructionHandlerArguments) {
  const value = stream.next8();

  const str = game.rom.tables.primary.decode(value);

  context.disasm("emit", `'${str}'`);

  if (value & 0x80) {
    // All values >7F are combinations of multiple characters
    // Not nice, but roundtrip them through the table to get the code points that should be emitted.
    for (let i = 0; i < str.length; i++) {
      emit(game.rom.tables.primary.encode(str[i]));
    }
  } else {
    emit(value);
  }
}
