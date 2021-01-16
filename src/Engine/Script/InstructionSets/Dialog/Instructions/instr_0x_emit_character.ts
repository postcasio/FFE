import { Game } from "@/src/Engine/Game";
import { DialogInstructionHandlerArguments } from "../DialogInstructionSet";

export function instr_0x_emit_character({
  stream,
  context,
  payload: { emit },
}: DialogInstructionHandlerArguments) {
  const instr = stream.next8();
  const character = instr - 2;

  context.disasm("emit", `@character(#$${character})`);

  for (const c of Game.current.journal
    .getCharacter(character)
    .getName()
    .split("")) {
    emit(Game.current.rom.tables.primary.encode(c));
  }
}
