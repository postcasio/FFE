import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_5C_wait_for_fade({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("wait_for_fade", "");

  context.waitForFade();
}
