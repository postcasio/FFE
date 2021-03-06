import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_B2_jsr({
  context,
  stream,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();
  const offset = stream.next24();

  context.disasm("jsr", "$" + hex(offset, 6));

  context.callSubroutine(offset);
}
