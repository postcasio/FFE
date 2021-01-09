import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_Fx_play_song({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();

  const song = stream.next8();

  let dis = "#$" + hex(song, 2);

  if (instruction === 0xf1) {
    const speed = stream.next8();

    dis += ` @fade(#${speed})`;
  }

  context.disasm("play_song", dis);
}
