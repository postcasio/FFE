import { hex } from "@/src/Engine/utils";
import { ObjectInstructionHandlerArguments } from "../ObjectInstructionSet";

export function instr_FF_end({
  stream,
  context,
}: ObjectInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("end", "");

  context.stop();
}
