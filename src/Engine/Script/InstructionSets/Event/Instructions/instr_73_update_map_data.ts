import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_73_update_map_data({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();
  const x = stream.next8();
  const y = stream.next8();
  const w = stream.next8();
  const h = stream.next8();
  const data = [];

  for (let i = 0; i < w * h; i++) {
    data.push(stream.next8());
  }

  context.disasm(
    "update_map_data",
    `#${x} #${y} #${w} #${h} (${data.map((c) => "#$" + hex(c, 2)).join(" ")})`,
    data.length
  );
}
