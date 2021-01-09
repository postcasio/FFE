import { OBJECT_ID_CAMERA } from "@/src/Engine/Map/MapObject";
import { ObjectInstructionHandlerArguments } from "../ObjectInstructionSet";

export function instr_D7_scroll_to({
  stream,
  context,
  game,
  payload: { object },
}: ObjectInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("scroll_to", "");

  game.mapEngine.objects[OBJECT_ID_CAMERA].x = object.x;
  game.mapEngine.objects[OBJECT_ID_CAMERA].y = object.y;
}
