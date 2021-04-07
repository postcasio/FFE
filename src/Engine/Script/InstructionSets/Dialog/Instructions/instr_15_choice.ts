import { Game } from "../../../../Game";
import { DialogInstructionHandlerArguments } from "../DialogInstructionSet";

export function instr_15_choice({
  stream,
  context,
  payload: { emit },
}: DialogInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("choice", "");

  context.waitForMessageBoxEmit().then(() => {
    Game.current.messageBox.markChoice();
    emit(0x7f);
  });
}
