import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_7x_set_obj_collision({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  const obj = stream.next8();

  const enable = instr === 0x7c;

  context.disasm(
    "set_obj_collision",
    `#$${hex(obj, 2)} ${enable ? "@enable" : "@disable"}`
  );
}
