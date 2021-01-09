import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_F6_set_sfx_volume({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();
  const arg3 = stream.next24();

  context.disasm("set_sfx_volume", `#$${hex(arg3, 6)}`);
}
