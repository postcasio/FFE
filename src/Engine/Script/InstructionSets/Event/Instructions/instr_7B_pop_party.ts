import { Game } from "@/src/Engine/Game";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_7B_pop_party({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  stream.next8();

  context.disasm("pop_party", "");

  const party = Game.current.journal.currentParty;
  const defaultParty = Game.current.journal.defaultParty;

  if (party !== defaultParty) {
    Game.current.journal.setCurrentParty(party - 1);
    Game.current.mapEngine.updateCamera(true);
  }
}
