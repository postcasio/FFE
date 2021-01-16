import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_3D_create_object({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  stream.next8();
  const objectIndex = stream.next8();

  context.disasm("create_object", "#$" + hex(objectIndex, 2));

  game.mapEngine.getObject(objectIndex)?.setExists(true);
}
