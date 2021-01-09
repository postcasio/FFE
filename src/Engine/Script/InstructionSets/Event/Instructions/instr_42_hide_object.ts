import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_42_hide_object({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();
  const object = stream.next8();

  context.disasm("hide_object", `#$${hex(object, 2)}`);

  game.mapEngine.objects[object].visible = false;
}
