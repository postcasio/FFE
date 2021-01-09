import { MessageBoxPosition } from "@/src/Engine/MessageBox";
import { hex } from "@/src/Engine/utils";
import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_4x_show_msg({
  stream,
  context,
  game,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  const arg = stream.next16();
  const msg = arg & 0x3fff;
  const transparent = (arg & 0x4000) !== 0;
  const bottom = (arg & 0x8000) !== 0;
  const wait = instr === 0x4b;

  const opts = [];
  if (transparent) opts.push("@transparent");
  if (bottom) opts.push("@bottom");
  else opts.push("@top");

  if (wait) opts.push("@wait");

  context.disasm("show_msg", `#$${hex(msg, 3)} ${opts.join(" ")}`);

  game.messageBox.position = bottom
    ? MessageBoxPosition.Bottom
    : MessageBoxPosition.Top;
  game.messageBox.transparent = transparent;
  game.messageBox.waitForKeypress = wait;

  game.messageBox.loadDialog(msg, context);

  if (wait) {
    context.waitForMessageBox();
  }
}
