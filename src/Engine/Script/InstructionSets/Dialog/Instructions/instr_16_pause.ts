import { DialogInstructionHandlerArguments } from "../DialogInstructionSet";

export function instr_16_pause({
  stream,
  game,
  context,
}: DialogInstructionHandlerArguments) {
  const instr = stream.next8();
  const mult = stream.next8();

  const frames = mult * 15;

  context.disasm("pause", `#${frames} @interruptible ; frames`);

  context.waitForMessageBoxEmit().then(() => {
    game.messageBox.autoPageOnce = true;
    context.waitForPromise(
      Promise.race([Sphere.sleep(frames), game.messageBox.keypress()])
    );
  });
}
