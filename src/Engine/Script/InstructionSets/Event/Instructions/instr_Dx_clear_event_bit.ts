import { hex } from "@/src/Engine/utils";
import { getEventBitName } from "../../../EventBitNames";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_Dx_clear_event_bit({
  stream,
  game,
  context,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();
  const bit = stream.next8();

  const eventBit = (instruction & 0x0e) * 128 + bit;

  context.disasm(
    "clear_event_bit",
    "e$" + hex(eventBit, 3) + " ; " + getEventBitName(eventBit)
  );

  game.journal.clearEventBit(eventBit);
}
