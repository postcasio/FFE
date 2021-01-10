import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_65_set_map_animation({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();
  const arg1 = stream.next8();
  const arg2 = stream.next8();

  context.disasm("set_map_animation", `#$${hex(arg1, 2)} #$${hex(arg2, 2)}`);
}
