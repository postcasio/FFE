import { ROM_OFFSET_EVENT_SCRIPTS } from "../../../Data/offsets";
import { ROM } from "@/src/Engine/Data/ROM";
import {
  InstructionHandler,
  InstructionHandlerPayload,
  InstructionSet,
} from "../../InstructionSet";
import { InstructionStream } from "../../InstructionStream";
import { ScriptContext } from "../../ScriptContext";
import { instr_35_wait_for_object } from "./Instructions/instr_35_wait_for_object";
import { instr_36_disable_passability } from "./Instructions/instr_36_disable_passability";
import { instr_37_set_object_graphics } from "./Instructions/instr_37_set_object_graphics";
import { instr_38_lock_screen } from "./Instructions/instr_38_lock_screen";
import { instr_39_unlock_screen } from "./Instructions/instr_39_unlock_screen";
import { instr_3C_set_active_party_members } from "./Instructions/instr_3C_set_main_party";
import { instr_3D_create_object } from "./Instructions/instr_3D_create_object";
import { instr_3F_set_char_party } from "./Instructions/instr_3F_set_char_party";
import { instr_40_set_char_props } from "./Instructions/instr_40_set_char_props";
import { instr_41_show_object } from "./Instructions/instr_41_show_object";
import { instr_42_hide_object } from "./Instructions/instr_42_hide_object";
import { instr_43_set_object_palette } from "./Instructions/instr_43_set_object_palette";
import { instr_44_set_object_riding } from "./Instructions/instr_44_set_object_riding";
import { instr_45_refresh_objects } from "./Instructions/instr_45_refresh_objects";
import { instr_46_set_active_party } from "./Instructions/instr_46_set_active_party";
import { instr_4x_show_msg } from "./Instructions/instr_48_show_msg";
import { instr_5C_wait_for_fade } from "./Instructions/instr_5C_wait_for_fade";
import { instr_5x_fade } from "./Instructions/instr_5x_fade";
import { instr_6C_set_parent_map } from "./Instructions/instr_6C_set_parent_map";
import { instr_6x_set_map } from "./Instructions/instr_6x_set_map";
import { instr_73_update_map_data } from "./Instructions/instr_73_update_map_data";
import { instr_78_enable_passability } from "./Instructions/instr_78_enable_passability";
import { instr_7F_set_char_name } from "./Instructions/instr_7F_set_char_name";
import { instr_84_give_gp } from "./Instructions/instr_84_give_gp";
import { instr_85_take_gp } from "./Instructions/instr_85_take_gp";
import { instr_8x_set_char_status } from "./Instructions/instr_8x_change_char_status";
import { instr_AB_show_load_menu } from "./Instructions/instr_AB_show_load_menu";
import { instr_AC_load_saved_char_obj_data } from "./Instructions/instr_AC_load_saved_char_obj_data";
import {
  instr_Ax_cutscene,
  ScriptCutscene,
} from "./Instructions/instr_Ax_cutscene";
import { instr_B0_do } from "./Instructions/instr_B0_do";
import { instr_B1_repeat } from "./Instructions/instr_B1_repeat";
import { instr_B2_jsr } from "./Instructions/instr_B2_jsr";
import { instr_Cx_cbr } from "./Instructions/instr_Cx_cbr";
import { instr_Dx_clear_event_bit } from "./Instructions/instr_Dx_clear_event_bit";
import { instr_Dx_set_event_bit } from "./Instructions/instr_Dx_set_event_bit";
import { instr_F2_stop_song } from "./Instructions/instr_F2_stop_song";
import { instr_F4_play_sfx } from "./Instructions/instr_F4_play_sfx";
import { instr_F6_set_sfx_volume } from "./Instructions/instr_F6_set_sfx_volume";
import { instr_FE_ret } from "./Instructions/instr_FE_ret";
import { instr_Fx_play_song } from "./Instructions/instr_Fx_play_song";
import { instr_xx_object_script } from "./Instructions/instr_xx_object_script";
import { instr_xx_pause } from "./Instructions/instr_xx_pause";
import { instr_7x_set_obj_collision } from "./Instructions/instr_7x_set_obj_collision";
import { instr_65_set_map_animation } from "./Instructions/instr_65_set_map_animation";
import { instr_5x_set_bg_scroll } from "./Instructions/instr_5x_set_bg_scroll";
import { instr_4D_battle } from "./Instructions/instr_4D_battle";
import { instr_BE_switch } from "./Instructions/instr_BE_switch";
import { instr_DE_load_party } from "./Instructions/instr_DE_load_party";
import { instr_47_create_party_object } from "./Instructions/instr_47_create_party_object";
import { instr_55_flash_screen } from "./Instructions/instr_55_flash_screen";
import { instr_50_tint_screen } from "./Instructions/instr_50_tint_screen";
import { instr_80_give_item } from "./Instructions/instr_80_give_item";
import { instr_98_name_change } from "./Instructions/instr_98_name_change";
import { instr_96_refresh_screen } from "./Instructions/instr_96_refresh_screen";
import { instr_3E_delete_object } from "./Instructions/instr_3E_delete_object";
import { instr_B7_cbr_battle } from "./Instructions/instr_B7_cbr_battle";
import { instr_3x_control } from "./Instructions/instr_3x_control";
import { instr_75_refresh_map } from "./Instructions/instr_75_refresh_map";
import { instr_58_shake_screen } from "./Instructions/instr_58_shake_screen";
import { instr_unk_1 } from "./Instructions/instr_unk_1";
import { instr_8B_set_char_hp_mp } from "./Instructions/instr_8B_set_char_hp_mp";
import { instr_61_colorize_screen } from "./Instructions/instr_61_colorize_screen";
import { instr_62_mosaic } from "./Instructions/instr_62_mosaic";
import { instr_49_wait_for_msg } from "./Instructions/instr_49_wait_for_msg";
import { instr_B6_cbr_msg } from "./Instructions/instr_B6_cbr_msg";
import { instr_79_set_party_map } from "./Instructions/instr_79_set_party_map";
import { instr_7A_set_obj_event } from "./Instructions/instr_7A_set_obj_event";
import instr_82_reset_default_party from "./Instructions/instr_82_reset_default_party";
import { instr_7B_pop_party } from "./Instructions/instr_7B_pop_party";

export type EventInstructionHandlerArguments = InstructionHandlerPayload<
  EventInstructionSet,
  EventInstructionHandlerPayload
>;

export type EventInstructionHandlerPayload = unknown;

export type EventScriptContext = ScriptContext<
  EventInstructionSet,
  EventInstructionHandlerPayload
>;

export class EventInstructionSet
  implements InstructionSet<EventInstructionHandlerPayload> {
  disasmPrefix = "EVT";

  getInstructionHandler(instruction: number): InstructionHandler | undefined {
    return eventInstructions.get(instruction);
  }

  createInstructionStream(rom: ROM) {
    return new InstructionStream(rom, ROM_OFFSET_EVENT_SCRIPTS);
  }
}

const eventInstructions: Map<
  number,
  InstructionHandler | undefined
> = new Map();

for (let i = 0; i < 0x35; i++) {
  eventInstructions.set(i, instr_xx_object_script);
}

eventInstructions.set(0x35, instr_35_wait_for_object);
eventInstructions.set(0x36, instr_36_disable_passability);
eventInstructions.set(0x37, instr_37_set_object_graphics);
eventInstructions.set(0x38, instr_38_lock_screen);
eventInstructions.set(0x39, instr_39_unlock_screen);
eventInstructions.set(0x3a, instr_3x_control);
eventInstructions.set(0x3b, instr_3x_control);
eventInstructions.set(0x3c, instr_3C_set_active_party_members);
eventInstructions.set(0x3d, instr_3D_create_object);
eventInstructions.set(0x3e, instr_3E_delete_object);
eventInstructions.set(0x3f, instr_3F_set_char_party);
eventInstructions.set(0x40, instr_40_set_char_props);
eventInstructions.set(0x41, instr_41_show_object);
eventInstructions.set(0x42, instr_42_hide_object);
eventInstructions.set(0x43, instr_43_set_object_palette);
eventInstructions.set(0x44, instr_44_set_object_riding);
eventInstructions.set(0x45, instr_45_refresh_objects);
eventInstructions.set(0x46, instr_46_set_active_party);
eventInstructions.set(0x47, instr_47_create_party_object);
eventInstructions.set(0x48, instr_4x_show_msg);
eventInstructions.set(0x49, instr_49_wait_for_msg);
eventInstructions.set(0x4b, instr_4x_show_msg);
eventInstructions.set(0x4c, instr_4D_battle);
eventInstructions.set(0x4d, instr_4D_battle);
eventInstructions.set(0x50, instr_50_tint_screen);
eventInstructions.set(0x54, instr_unk_1);
eventInstructions.set(0x55, instr_55_flash_screen);
eventInstructions.set(0x58, instr_58_shake_screen);
eventInstructions.set(0x59, instr_5x_fade);
eventInstructions.set(0x5a, instr_5x_fade);
eventInstructions.set(0x5c, instr_5C_wait_for_fade);
eventInstructions.set(0x5d, instr_5x_set_bg_scroll);
eventInstructions.set(0x5e, instr_5x_set_bg_scroll);
eventInstructions.set(0x5f, instr_5x_set_bg_scroll);
eventInstructions.set(0x61, instr_61_colorize_screen);
eventInstructions.set(0x62, instr_62_mosaic);
eventInstructions.set(0x65, instr_65_set_map_animation);
eventInstructions.set(0x6a, instr_6x_set_map);
eventInstructions.set(0x6b, instr_6x_set_map);
eventInstructions.set(0x6c, instr_6C_set_parent_map);
eventInstructions.set(0x73, instr_73_update_map_data);
eventInstructions.set(0x74, instr_73_update_map_data);
eventInstructions.set(0x75, instr_75_refresh_map);
eventInstructions.set(0x78, instr_78_enable_passability);
eventInstructions.set(0x79, instr_79_set_party_map);
eventInstructions.set(0x7a, instr_7A_set_obj_event);
eventInstructions.set(0x7b, instr_7B_pop_party);
eventInstructions.set(0x7c, instr_7x_set_obj_collision);
eventInstructions.set(0x7d, instr_7x_set_obj_collision);
eventInstructions.set(0x7f, instr_7F_set_char_name);
eventInstructions.set(0x80, instr_80_give_item);
eventInstructions.set(0x82, instr_82_reset_default_party);
eventInstructions.set(0x84, instr_84_give_gp);
eventInstructions.set(0x85, instr_85_take_gp);
eventInstructions.set(0x88, instr_8x_set_char_status);
eventInstructions.set(0x89, instr_8x_set_char_status);
eventInstructions.set(0x8a, instr_8x_set_char_status);
eventInstructions.set(0x8b, instr_8B_set_char_hp_mp);
eventInstructions.set(0x8c, instr_8B_set_char_hp_mp);

for (let i = 0x91; i <= 0x95; i++) {
  eventInstructions.set(i, instr_xx_pause);
}

eventInstructions.set(0x96, instr_96_refresh_screen);
eventInstructions.set(0x97, instr_5x_fade);
eventInstructions.set(0x98, instr_98_name_change);

eventInstructions.set(0xab, instr_AB_show_load_menu);
eventInstructions.set(0xac, instr_AC_load_saved_char_obj_data);
eventInstructions.set(0xb0, instr_B0_do);
eventInstructions.set(0xb1, instr_B1_repeat);
eventInstructions.set(0xb2, instr_B2_jsr);
eventInstructions.set(0xb4, instr_xx_pause);
eventInstructions.set(0xb5, instr_xx_pause);
eventInstructions.set(0xb6, instr_B6_cbr_msg);
eventInstructions.set(0xb7, instr_B7_cbr_battle);
eventInstructions.set(0xbe, instr_BE_switch);
eventInstructions.set(0xde, instr_DE_load_party);
eventInstructions.set(0xf0, instr_Fx_play_song);
eventInstructions.set(0xf1, instr_Fx_play_song);
eventInstructions.set(0xf2, instr_F2_stop_song);
eventInstructions.set(0xf4, instr_F4_play_sfx);
eventInstructions.set(0xf6, instr_F6_set_sfx_volume);
eventInstructions.set(0xfe, instr_FE_ret);

for (let i = 0; i <= 0x0c; i += 2) {
  eventInstructions.set(0xd0 + i, instr_Dx_set_event_bit);
}
for (let i = 0; i <= 0x0d; i += 2) {
  eventInstructions.set(0xd1 + i, instr_Dx_clear_event_bit);
}

for (let i = 0xc0; i <= 0xcf; i++) {
  eventInstructions.set(i, instr_Cx_cbr);
}

for (const instr of Object.values(ScriptCutscene).filter(
  (v) => typeof v === "number"
)) {
  eventInstructions.set(instr as number, instr_Ax_cutscene);
}
