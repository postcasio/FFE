import { Game } from "@/src/Engine/Game";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_49_wait_for_msg({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  stream.next8();

  if (Game.current.messageBox.isOpen()) {
    context.waitForMessageBox();
  }
}
