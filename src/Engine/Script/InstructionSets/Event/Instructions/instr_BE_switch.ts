import { Game } from "@/src/Engine/Game";
import { hex } from "@/src/Engine/utils";
import { EVENT_BYTE_CASE_WORD } from "../../../MeaningfulEventBits";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_BE_switch({
  context,
  stream,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();
  const casesCount = stream.next8();
  const cases = [];

  for (let i = 0; i < casesCount; i++) {
    cases.push(stream.next24());
  }

  context.disasm(
    "switch",
    `${cases
      .map(
        (kase) =>
          `@bit(#${(kase & 0xf00000) >> 20}): $${hex(kase & 0x0fffff, 6)}`
      )
      .join(" ")}`,
    cases.length * 3
  );

  for (const kase of cases) {
    if (
      Game.current.journal.getEventWord(EVENT_BYTE_CASE_WORD) &
      (1 << ((kase & 0xf00000) >> 20))
    ) {
      context.jump(kase & 0x0fffff);
      break;
    }
  }
}
