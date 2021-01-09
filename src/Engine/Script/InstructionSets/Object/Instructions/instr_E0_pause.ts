import { ObjectInstructionHandlerArguments } from "../ObjectInstructionSet";

export function instr_E0_pause({
  stream,
  context,
}: ObjectInstructionHandlerArguments) {
  const instr = stream.next8();
  const frames = stream.next8();

  context.disasm("pause", `#${frames} ; frames`);

  context.waitForFrames(frames);
}
