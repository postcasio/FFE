import { Game } from "@/src/Engine/Game";
import { DialogInstructionHandlerArguments } from "../DialogInstructionSet";

export function instr_19_gp({
  stream,
  context,
  payload: { emit },
}: DialogInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("show_gp", "");

  for (const c of "[show gp]".split("")) {
    emit(Game.current.rom.tables.primary.encode(c));
  }
}
