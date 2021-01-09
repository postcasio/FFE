import { ROM_OFFSET_DIALOG } from "../../../Data/offsets";
import { ROM } from "@/src/Engine/Data/ROM";
import {
  InstructionHandler,
  InstructionHandlerPayload,
  InstructionSet,
} from "../../InstructionSet";
import { InstructionStream } from "../../InstructionStream";
import { ScriptContext } from "../../ScriptContext";
import { instr_00_end } from "./Instructions/instr_00_end";
import { instr_01_emit_newline } from "./Instructions/instr_01_emit_newline";
import { instr_0x_emit_character } from "./Instructions/instr_0x_emit_character";
import { instr_11_pause } from "./Instructions/instr_11_pause";
import { instr_12_pause } from "./Instructions/instr_12_pause";
import { instr_13_page } from "./Instructions/instr_13_page";
import { instr_14_emit_spaces } from "./Instructions/instr_14_emit_spaces";
import { instr_16_pause } from "./Instructions/instr_16_pause";
import { instr_xx_emit_raw } from "./Instructions/instr_xx_emit_raw";

export type DialogInstructionHandlerArguments = InstructionHandlerPayload<
  DialogInstructionSet,
  DialogInstructionHandlerPayload
>;

export interface DialogInstructionHandlerPayload {
  parentContext: ScriptContext;
  emit: (value: number) => void;
}

export type DialogScriptContext = ScriptContext<
  DialogInstructionSet,
  DialogInstructionHandlerPayload
>;

export class DialogInstructionSet
  implements InstructionSet<DialogInstructionHandlerPayload> {
  disasmPrefix = "MSG";

  getInstructionHandler(instruction: number): InstructionHandler | undefined {
    return dialogInstructions.get(instruction);
  }

  createInstructionStream(rom: ROM) {
    return new InstructionStream(rom, ROM_OFFSET_DIALOG);
  }
}

const dialogInstructions: Map<
  number,
  InstructionHandler | undefined
> = new Map();

dialogInstructions.set(0x00, instr_00_end);
dialogInstructions.set(0x01, instr_01_emit_newline);

for (let i = 0x02; i <= 0x0f; i++) {
  dialogInstructions.set(i, instr_0x_emit_character);
}

dialogInstructions.set(0x11, instr_11_pause);
dialogInstructions.set(0x12, instr_12_pause);
dialogInstructions.set(0x13, instr_13_page);

dialogInstructions.set(0x14, instr_14_emit_spaces);
dialogInstructions.set(0x16, instr_16_pause);

for (let i = 0x20; i <= 0xff; i++) {
  dialogInstructions.set(i, instr_xx_emit_raw);
}
