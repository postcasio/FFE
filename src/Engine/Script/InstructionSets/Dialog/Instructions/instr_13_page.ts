import { DialogInstructionHandlerArguments } from "../DialogInstructionSet";

export function instr_13_page({
  stream,
  context,
  game,
}: DialogInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("page", "");

  context.waitForMessageBoxEmit().then(() => {
    context.waitForPromise(game.messageBox.requestPage());
  });
}
