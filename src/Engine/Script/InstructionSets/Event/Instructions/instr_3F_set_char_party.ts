import { Game } from "@/src/Engine/Game";
import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_3F_set_char_party({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  stream.next8();
  const character = stream.next8();
  const party = stream.next8();

  context.disasm("set_char_party", `#$${hex(character, 2)} #$${hex(party, 2)}`);

  Game.current.journal.getCharacter(character).setParty(party);
}
