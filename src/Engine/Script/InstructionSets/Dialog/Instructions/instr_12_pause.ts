import { DialogInstructionHandlerArguments } from "../DialogInstructionSet";

export function instr_12_pause({
  stream,
  context,
}: DialogInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("pause", `#1 ; frames`);

  context.waitForMessageBoxEmit().then(() => context.waitForFrames(1));
}
