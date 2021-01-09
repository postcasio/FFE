import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_3C_set_active_party_members({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();

  const chars = [
    stream.next8(),
    stream.next8(),
    stream.next8(),
    stream.next8(),
  ];

  context.disasm(
    "set_active_party_members",
    chars.map((char) => "#$" + hex(char, 2)).join(", ")
  );

  game.journal.setPartyMembers(chars as [number, number, number, number]);
}
