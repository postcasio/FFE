import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_38_lock_screen({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();

  context.disasm("lock_screen", "");

  game.mapEngine.cameraLocked = true;
}
