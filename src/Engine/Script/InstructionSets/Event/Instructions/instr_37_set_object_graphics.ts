import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_37_set_object_graphics({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();

  const object = stream.next8();
  const graphics = stream.next8();

  context.disasm("set_obj_gfx", `#$${hex(object, 2)} #$${hex(graphics, 2)}`);

  game.mapEngine.getObject(object)?.loadSprite(graphics);
}
