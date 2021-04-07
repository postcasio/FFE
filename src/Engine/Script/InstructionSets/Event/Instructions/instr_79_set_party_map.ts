// 79 xx yy zz             $C0A36A

import { Game } from "@/src/Engine/Game";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_79_set_party_map({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  stream.next8();

  const a = stream.next8();
  const b = stream.next8();
  const c = stream.next8();

  context.disasm("set_party_map", `#${a} #${b} #${c} ; last byte unknown`);

  Game.current.journal.setPartyMapIndex(a, b);
}
