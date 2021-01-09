import { hex } from "@/src/Engine/utils";
import { ObjectInstructionHandlerArguments } from "../ObjectInstructionSet";

export function instr_xx_action({
  stream,
  context,
}: ObjectInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("action", `#$${hex(instr, 2)}`);
}
