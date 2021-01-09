import { ObjectInstructionHandlerArguments } from "../ObjectInstructionSet";

export function instr_D0_show({
  stream,
  context,
  payload: { object },
}: ObjectInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("show", "");

  object.visible = true;
}
