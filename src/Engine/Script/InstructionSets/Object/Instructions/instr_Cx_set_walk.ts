//C6                      $C0787B     Set entity to walk when moving
//C7                      $C07886     Set entity to stay still when moving

import { ObjectInstructionHandlerArguments } from "../ObjectInstructionSet";

export function instr_Cx_set_walk({
  stream,
  context,
  payload: { object },
}: ObjectInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("set_walk", instr === 0xc6 ? "@on" : "@off");

  object.setWalkWhenMoving(instr === 0xc6);
}
