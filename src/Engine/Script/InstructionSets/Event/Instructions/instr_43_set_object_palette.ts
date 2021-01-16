import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_43_set_object_palette({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();

  const object = stream.next8();
  const palette = stream.next8();

  context.disasm("set_obj_pal", `#$${hex(object, 2)} #$${hex(palette, 2)}`);

  game.mapEngine.getObject(object)!.loadPalette(palette);
}
