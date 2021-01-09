import { ObjectInstructionHandlerArguments } from "../ObjectInstructionSet";

export function instr_D5_set_position({
  stream,
  context,
  game,
  payload: { object },
}: ObjectInstructionHandlerArguments) {
  const instr = stream.next8();
  const x = stream.next8();
  const y = stream.next8();

  context.disasm("set_position", `#${x} #${y}`);

  game.mapEngine.objects[object.index].x = x;
  game.mapEngine.objects[object.index].subtileX = 0;
  game.mapEngine.objects[object.index].y = y;
  game.mapEngine.objects[object.index].subtileY = 0;
}
