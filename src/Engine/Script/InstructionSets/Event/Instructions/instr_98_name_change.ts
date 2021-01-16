import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_98_name_change({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();
  const char = stream.next8();

  context.disasm("name_change", `#$${hex(char, 2)}`);
}
