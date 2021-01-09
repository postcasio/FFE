import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_8x_set_char_status({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();
  const character = stream.next8();
  const status = stream.next16();

  switch (instruction) {
    case 0x88: // AND
      context.disasm(
        "set_char_status.and",
        `#$${hex(character, 2)} #$${hex(status, 4)}`
      );
      break;
    case 0x89: // XOR
      context.disasm(
        "set_char_status.xor",
        `#$${hex(character, 2)} #$${hex(status, 4)}`
      );
      break;
    case 0x90: // OR
      context.disasm(
        "set_char_status.or",
        `#$${hex(character, 2)} #$${hex(status, 4)}`
      );
      break;
  }
}
