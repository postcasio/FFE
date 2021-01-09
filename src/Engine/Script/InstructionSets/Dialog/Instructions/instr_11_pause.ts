import { DialogInstructionHandlerArguments } from "../DialogInstructionSet";

export function instr_11_pause({
  stream,
  context,
}: DialogInstructionHandlerArguments) {
  const instr = stream.next8();
  const mult = stream.next8();

  const frames = mult * 15;

  context.disasm("pause", `#${frames} ; frames`);

  context.waitForMessageBoxEmit().then(() => context.waitForFrames(frames));
}
