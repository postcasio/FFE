import { Game } from "@/src/Engine/Game";
import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_B7_cbr_battle({
  stream,
  game,
  context,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();
  const bit = stream.next8();

  const offset = stream.next24();
  context.disasm(`cbr`, `(!b$${hex(bit, 3)}) $${hex(offset, 6)}`);

  if (!Game.current.journal.getBattleBit(bit)) {
    context.jump(offset);
  }
}
