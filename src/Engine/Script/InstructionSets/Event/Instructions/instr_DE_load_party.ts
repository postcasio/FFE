import { Game } from "@/src/Engine/Game";
import { hex } from "@/src/Engine/utils";
import { EVENT_BYTE_CASE_WORD } from "../../../MeaningfulEventBits";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_DE_load_party({
  context,
  stream,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("load_party", "");

  let partyWord = 0;

  for (let i = 0; i < Game.current.journal.characters.length; i++) {
    if (
      Game.current.journal.characters[i].party ===
      Game.current.journal.currentParty
    ) {
      partyWord |= 1 << i;
    }
  }

  Game.current.journal.setEventWord(EVENT_BYTE_CASE_WORD, partyWord);
}
