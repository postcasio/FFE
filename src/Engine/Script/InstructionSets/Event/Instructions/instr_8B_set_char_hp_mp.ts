import { Game } from "@/src/Engine/Game";
import { hex, signed8 } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

const lookup = {
  0: 1,
  1: 2,
};

export function instr_8B_set_char_hp_mp({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  const character = stream.next8();
  const value = stream.next8();

  let delta;
  if (value < 8) {
    delta = 1 << value;
  } else if (value > 127 && value < 136) {
    delta = -(1 << (value - 127));
  } else if (value === 127 || value === 255) {
    delta = Infinity;
  }

  context.disasm(
    instr === 0x8b ? "set_char_hp" : "set_char_mp",
    `#$${hex(character, 2)} #$${hex(value, 2)} ; ${delta}`
  );
}
