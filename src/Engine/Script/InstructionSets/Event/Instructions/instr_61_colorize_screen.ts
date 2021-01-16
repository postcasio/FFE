import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_61_colorize_screen({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  stream.next8();
  //61 _c pb pe             $C0AA3D     Colorize color range [pb, pe] to color c
  const c = stream.next8();
  const pb = stream.next8();
  const pe = stream.next8();

  context.disasm("colorize_screen", `#${c} #${pb} #${pe}`);
}
