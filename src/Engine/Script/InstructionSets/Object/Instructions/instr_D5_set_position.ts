import { ObjectInstructionHandlerArguments } from "../ObjectInstructionSet";

export function instr_D5_set_position({
  stream,
  context,
  payload: { object },
}: ObjectInstructionHandlerArguments) {
  stream.next8();
  const x = stream.next8();
  const y = stream.next8();

  context.disasm("set_position", `#${x} #${y}`);

  object.setPosition(x, y);
}
