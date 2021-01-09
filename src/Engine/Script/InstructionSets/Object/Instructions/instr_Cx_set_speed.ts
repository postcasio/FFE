import { Speed } from "@/src/Engine/Map/NPCData";
import { ObjectInstructionHandlerArguments } from "../ObjectInstructionSet";

export function instr_Cx_set_speed({
  stream,
  context,
  payload: { object },
}: ObjectInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("set_speed", `@${Speed[instr & 0x7].toLowerCase()}`);

  object.speed = instr & 0x7;
}
