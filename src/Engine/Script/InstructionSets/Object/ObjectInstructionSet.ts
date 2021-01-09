import { MapObject } from "@/src/Engine/Map/MapObject";
import { ROM_OFFSET_EVENT_SCRIPTS } from "../../../Data/offsets";
import { ROM } from "@/src/Engine/Data/ROM";
import {
  InstructionHandler,
  InstructionHandlerPayload,
  InstructionSet,
} from "../../InstructionSet";
import { InstructionStream } from "../../InstructionStream";
import { ScriptContext } from "../../ScriptContext";
import { instr_8x_9x_move } from "./Instructions/instr_8x_9x_move";
import { instr_Cx_set_direction } from "./Instructions/instr_Cx_set_direction";
import { instr_Cx_set_speed } from "./Instructions/instr_Cx_set_speed";
import { instr_D0_show } from "./Instructions/instr_D0_show";
import { instr_D1_hide } from "./Instructions/instr_D1_hide";
import { instr_D5_set_position } from "./Instructions/instr_D5_set_position";
import { instr_D7_scroll_to } from "./Instructions/instr_D7_scroll_to";
import { instr_E0_pause } from "./Instructions/instr_E0_pause";
import { instr_FC_bra } from "./Instructions/instr_FC_bra";
import { instr_FF_end } from "./Instructions/instr_FF_end";
import { instr_xx_action } from "./Instructions/instr_xx_action";

export type ObjectInstructionHandlerArguments = InstructionHandlerPayload<
  ObjectInstructionSet,
  ObjectInstructionHandlerPayload
>;

export interface ObjectInstructionHandlerPayload {
  object: MapObject;
}

export type ObjectScriptContext = ScriptContext<
  ObjectInstructionSet,
  ObjectInstructionHandlerPayload
>;

export class ObjectInstructionSet
  implements InstructionSet<ObjectInstructionHandlerPayload> {
  disasmPrefix = "OBJ";

  getInstructionHandler(instruction: number): InstructionHandler | undefined {
    return objectInstructions.get(instruction);
  }

  createInstructionStream(rom: ROM) {
    return new InstructionStream(rom, ROM_OFFSET_EVENT_SCRIPTS);
  }
}

const objectInstructions: Map<
  number,
  InstructionHandler | undefined
> = new Map();

for (let i = 0x00; i <= 0x37; i++) {
  objectInstructions.set(i, instr_xx_action);
}

for (let i = 0x80; i <= 0x9f; i++) {
  objectInstructions.set(i, instr_8x_9x_move);
}

for (let i = 0xa0; i <= 0xab; i++) {
  objectInstructions.set(i, instr_8x_9x_move);
}

for (let i = 0xc0; i <= 0xc5; i++) {
  objectInstructions.set(i, instr_Cx_set_speed);
}

for (let i = 0xcc; i <= 0xcf; i++) {
  objectInstructions.set(i, instr_Cx_set_direction);
}

objectInstructions.set(0xd0, instr_D0_show);
objectInstructions.set(0xd1, instr_D1_hide);
objectInstructions.set(0xd5, instr_D5_set_position);
objectInstructions.set(0xd7, instr_D7_scroll_to);
objectInstructions.set(0xe0, instr_E0_pause);

objectInstructions.set(0xfc, instr_FC_bra);
objectInstructions.set(0xff, instr_FF_end);
