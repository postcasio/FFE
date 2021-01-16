import { hex } from "@/src/Engine/utils";
import { ObjectInstructionHandlerArguments } from "../ObjectInstructionSet";

export function instr_C8_set_priority({
  stream,
  context,
  payload: { object },
}: ObjectInstructionHandlerArguments) {
  stream.next8();

  const priority = stream.next8();

  context.disasm("set_priority", `#$${hex(priority, 2)}`);

  object.setPriority(priority);
}
