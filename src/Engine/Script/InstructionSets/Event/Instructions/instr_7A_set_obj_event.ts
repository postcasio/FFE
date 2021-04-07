// 7A xx aaaaaa            $C0A42A     Modify entity event--call $aaaaaa+$CA0000 when triggered

import { Game } from "@/src/Engine/Game";
import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_7A_set_obj_event({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  stream.next8();

  const object = stream.next8();

  const event = stream.next24();

  context.disasm("set_obj_event", `#$${hex(object, 2)} $${hex(event, 6)}`);

  Game.current.mapEngine.getObject(object)?.setEventAddress(event);
}
