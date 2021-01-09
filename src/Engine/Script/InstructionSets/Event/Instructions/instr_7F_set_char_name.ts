import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_7F_set_char_name({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();
  const character = stream.next8();
  const name = stream.next8();

  context.disasm("set_char_name", `#$${hex(character, 2)} #$${hex(name, 2)}`);
}
