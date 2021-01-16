import { EventInstructionHandlerArguments } from "../EventInstructionSet";

export function instr_50_tint_screen({
  stream,
  context,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  const arg = stream.next8();

  const colorComponents = (arg & 0xf0) >> 4;
  const intensity = arg & 0x0f;

  let componentsDisasm = [];

  if (colorComponents & 0x2) {
    componentsDisasm.push("@red");
  }
  if (colorComponents & 0x4) {
    componentsDisasm.push("@green");
  }
  if (colorComponents & 0x8) {
    componentsDisasm.push("@blue");
  }

  if (componentsDisasm.length === 3) {
    componentsDisasm = ["@white"];
  }

  context.disasm("tint_screen", `${componentsDisasm.join(" ")} #${intensity}`);
}
