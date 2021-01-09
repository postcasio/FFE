import { hex } from "@/src/Engine/utils";
import { RidingType } from "../../../RidingType";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_44_set_object_riding({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();
  const object = stream.next8();

  const arg = stream.next8();
  const riding = (arg & 0x60) >> 5;
  const showRider = (arg & 0x80) !== 0;

  context.disasm(
    "set_object_riding",
    `#$${hex(object, 2)} @${RidingType[riding].toLowerCase()}${
      showRider ? "" : " @hide"
    }`
  );
}
