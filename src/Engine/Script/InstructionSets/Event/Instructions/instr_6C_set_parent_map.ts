import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

enum VehicleType {
  None = 0,
  Airship = 1,
  Chocobo = 2,
}

export function instr_6C_set_parent_map({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();

  const mapIndex = stream.next16();
  const x = stream.next8();
  const y = stream.next8();
  const vehicle = stream.next8();

  context.disasm(
    "set_parent_map",
    `${hex(mapIndex, 4)} ${hex(x, 2)} ${hex(
      y,
      2
    )} ; ${mapIndex} @ (${x}, ${y}) in ${VehicleType[vehicle]}`
  );
}
