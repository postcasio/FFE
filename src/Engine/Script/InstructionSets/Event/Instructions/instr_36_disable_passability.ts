import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_36_disable_passability({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  const obj = stream.next8();

  context.disasm("disable_passability", `#$${hex(obj, 2)}`);
}
