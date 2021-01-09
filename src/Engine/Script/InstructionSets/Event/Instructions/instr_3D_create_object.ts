import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_3D_create_object({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();
  const object = stream.next8();

  context.disasm("create_object", "#$" + hex(object, 2));

  game.mapEngine.objects[object].exists = true;
}
