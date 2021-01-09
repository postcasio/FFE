import { Intent } from "./Intent";

export enum InputMappingType {
  Keyboard,
  Mouse,
  Joystick,
}

export interface KeyboardInputMapping {
  type: InputMappingType.Keyboard;
  key: Key;
  intent: Intent;
  action: KeyboardAction;
  valid?: () => boolean;
}

export function keyboardMapping(
  key: Key,
  intent: Intent,
  action: KeyboardAction,
  valid?: () => boolean
): KeyboardInputMapping {
  return {
    type: InputMappingType.Keyboard,
    key,
    intent,
    action,
    valid,
  };
}

export enum KeyboardAction {
  Press,
  HoldStart,
  HoldEnd,
}

export type InputMapping = KeyboardInputMapping;
