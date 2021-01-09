import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_B0_do({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();
  const count = stream.next8();

  context.disasm("do", `#${count}`);

  context.setRepeat(stream.ip, count - 1);
}
