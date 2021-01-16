import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_unk_1({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm(`unk.${hex(instr, 2)}`, "");
}
