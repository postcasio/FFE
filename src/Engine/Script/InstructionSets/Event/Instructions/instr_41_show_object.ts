import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_41_show_object({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  stream.next8();
  const object = stream.next8();

  context.disasm("show_object", `#$${hex(object, 2)}`);

  SSj.log(`Showing object ${game.mapEngine.getObject(object)?.index}`);

  game.mapEngine.getObject(object)?.setVisible(true);
}
