import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_3E_delete_object({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();
  const objectIndex = stream.next8();

  context.disasm("delete_object", "#$" + hex(objectIndex, 2));

  game.mapEngine.getObject(objectIndex)!.exists = false;
}
