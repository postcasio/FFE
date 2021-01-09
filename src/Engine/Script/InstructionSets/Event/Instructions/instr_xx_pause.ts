import { EventInstructionHandlerArguments } from "../EventInstructionSet";

const durations9x: Record<number, number> = {
  1: 15,
  2: 30,
  3: 45,
  4: 60,
  5: 120,
};

export function instr_xx_pause({
  context,
  stream,
}: EventInstructionHandlerArguments) {
  const instr = stream.next8();

  let duration = 0;

  switch (instr) {
    case 0x91:
    case 0x92:
    case 0x93:
    case 0x94:
    case 0x95:
      duration = durations9x[instr & 0x7];
      break;
    case 0xb4:
      duration = stream.next8();
      break;
    case 0xb5:
      duration = stream.next8() * 15;
      break;
  }

  context.disasm("pause", `#${duration} ; frames`);

  context.waitForFrames(duration);
}
