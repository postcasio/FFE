// B6 aaaaaa ...           $C0B6D3     Jump to the nth address following B6, where n is the last item selected from a

import { Game } from "@/src/Engine/Game";
import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export async function instr_B6_cbr_msg({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  stream.next8();

  const max = Game.current.messageBox.lastChoiceCount;
  const choice = Game.current.messageBox.lastSelectedChoice;
  const addrs = [];

  for (let i = 0; i < max; i++) {
    addrs.push(stream.next24());
  }

  context.disasm(
    "cbr.msg",
    `${addrs.map((a) => `$${hex(a, 6)}`).join(" ")} ; ${choice} = $${hex(
      addrs[choice],
      6
    )}`
  );

  context.jump(addrs[choice]);
}
