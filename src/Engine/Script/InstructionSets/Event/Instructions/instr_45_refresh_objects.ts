import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_45_refresh_objects({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  context.disasm("refresh_objects", "");

  game.mapEngine.refreshObjects();
}
