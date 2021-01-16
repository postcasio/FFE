// CC                      $C078AB     Turn current entity up
// CD                      $C078B7     Turn current entity right
// CE                      $C078C4     Turn current entity down
// CF                      $C078D1     Turn current entity left

import { Direction } from "@/src/Engine/Script/Direction";
import { ObjectInstructionHandlerArguments } from "../ObjectInstructionSet";

export function instr_Cx_set_direction({
  stream,
  context,
  payload: { object },
}: ObjectInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("set_direction", `@${Direction[instr & 0x3].toLowerCase()}`);

  object.look(instr & 0x3);
}
