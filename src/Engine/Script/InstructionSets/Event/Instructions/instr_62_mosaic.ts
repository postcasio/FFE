import { Game } from "@/src/Engine/Game";
import { hex } from "@/src/Engine/utils";
import Tween, { Easing } from "tween";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_62_mosaic({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();
  // 62 xx                   $C0AACB     Mosaic screen with speed xx (lower == slower)

  const speed = stream.next8();

  context.disasm("mosaic_screen", `#$${hex(speed, 2)}`);

  new Tween(Game.current.mapEngine, Easing.Sine)
    .easeIn({ pixelate: 1 }, 120 / speed)
    .then(() =>
      new Tween(Game.current.mapEngine, Easing.Sine).easeOut(
        { pixelate: 0 },
        120 / speed
      )
    );
}
