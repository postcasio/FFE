import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_39_unlock_screen({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  const instruction = stream.next8();

  context.disasm("unlock_screen", "");

  game.mapEngine.cameraLocked = false;

  // game.mapEngine.updateCamera();
}
