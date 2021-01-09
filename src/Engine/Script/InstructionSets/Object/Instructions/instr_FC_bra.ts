import { hex } from "@/src/Engine/utils";
import { ObjectInstructionHandlerArguments } from "../ObjectInstructionSet";

export function instr_FC_bra({
  context,
  stream,
}: ObjectInstructionHandlerArguments) {
  const ip = stream.ip;

  const instr = stream.next8();
  const offset = stream.next8();

  context.disasm("bra", `$${hex(ip - offset, 6)}`);

  context.jump(ip - offset);
}
