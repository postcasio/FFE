import { FadingDirection } from "@/src/Engine/Fader";
import { Game } from "@/src/Engine/Game";
import { hex } from "@/src/Engine/utils";
import Tween, { Easing } from "tween";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export async function instr_4D_battle({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();
  const enemySet = stream.next8();
  const background = stream.next8();

  context.disasm(
    "battle",
    `#$${hex(enemySet, 2)} #$${hex(background, 2)}${
      instruction === 0x4c ? " @collision" : ""
    }`
  );

  Sphere.sleep(30).then(() => {
    Game.current.fader.fade(FadingDirection.Out, 9);
  });

  await context.waitForPromise(
    new Tween(Game.current.mapEngine, Easing.Quadratic).easeIn(
      {
        pixelate: 1,
      },
      60
    )
  );

  await context.waitForPromise(Sphere.sleep(120));

  Game.current.mapEngine.pixelate = 0;

  Game.current.fader.pendingFade = true;
}
