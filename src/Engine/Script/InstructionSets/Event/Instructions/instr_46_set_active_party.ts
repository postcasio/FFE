import { Game } from "@/src/Engine/Game";
import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_46_set_active_party({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();
  const party = stream.next8();

  context.disasm("set_active_party", "#$" + hex(party, 2));

  Game.current.journal.setCurrentParty(party);
}
