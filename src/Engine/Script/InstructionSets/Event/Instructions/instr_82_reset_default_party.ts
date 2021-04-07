import { Game } from "@/src/Engine/Game";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export default function instr_82_reset_default_party({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  stream.next8();

  context.disasm("reset_default_party", "; party = #$01");

  Game.current.journal.setDefaultParty(1);
}
