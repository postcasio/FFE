import {
  ObjectInstructionHandlerArguments,
  ObjectInstructionHandlerPayload,
} from "../ObjectInstructionSet";

export function instr_D1_hide({
  stream,
  context,
  payload: { object },
}: ObjectInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("hide", "");

  object.visible = false;
}
