import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_40_set_char_props({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();
  const character = stream.next8();
  const props = stream.next8();

  context.disasm("set_char_props", `#$${hex(character, 2)} #$${hex(props, 2)}`);
}
