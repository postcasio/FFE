import { DialogInstructionHandlerArguments } from "../DialogInstructionSet";

export function instr_00_end({
  stream,
  context,
  game,
}: DialogInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("end", "");

  context.waitForMessageBoxEmit().then(() => game.messageBox.stop());
}
