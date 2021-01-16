import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_80_give_item({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  const item = stream.next8();

  context.disasm("give_item", `#$${hex(item, 2)}`);
}
