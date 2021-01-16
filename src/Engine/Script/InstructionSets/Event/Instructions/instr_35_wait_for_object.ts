import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_35_wait_for_object({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  stream.next8();
  const object = stream.next8();

  context.disasm("wait_for_object", "#$" + hex(object, 2));

  context.waitForObject(game.mapEngine.getObject(object)!);
}
