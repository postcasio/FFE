import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_78_enable_passability({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  const obj = stream.next8();

  context.disasm("enable_passability", `#$${hex(obj, 2)}`);
}
