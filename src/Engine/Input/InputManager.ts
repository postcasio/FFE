import { Game } from "../Game";
import {
  InputMapping,
  InputMappingType,
  KeyboardAction,
  KeyboardInputMapping,
} from "./InputMapping";

export class InputManager {
  mappings: InputMapping[] = [];

  keyboardHoldMappings: KeyboardInputMapping[] = [];
  keyboardPressMappings: KeyboardInputMapping[] = [];

  keyStates: Map<Key, boolean> = new Map();

  keyboard: Keyboard = Keyboard.Default;

  addMapping(mapping: InputMapping) {
    this.mappings.push(mapping);
  }

  updateMappingCaches() {
    this.keyboardHoldMappings = this.mappings.filter(
      (mapping) =>
        mapping.type === InputMappingType.Keyboard &&
        (mapping.action === KeyboardAction.HoldStart ||
          mapping.action === KeyboardAction.HoldEnd)
    );
    this.keyboardPressMappings = this.mappings.filter(
      (mapping) =>
        mapping.type === InputMappingType.Keyboard &&
        mapping.action === KeyboardAction.Press
    );
  }

  private dispatch(event: InputMapping) {
    Game.current.dispatchInput(event);
  }

  dispatchInputs() {
    for (const mapping of this.keyboardHoldMappings) {
      if (mapping.valid && !mapping.valid()) {
        continue;
      }

      const key = mapping.key;

      const keyState = this.keyStates.get(key);

      switch (mapping.action) {
        case KeyboardAction.HoldStart:
          if (!keyState && this.keyboard.isPressed(key)) {
            this.keyStates.set(key, true);
            this.dispatch(mapping);
          }
          break;
        case KeyboardAction.HoldEnd:
          if (keyState && !this.keyboard.isPressed(key)) {
            this.keyStates.set(key, false);
            this.dispatch(mapping);
          }
          break;
      }
    }

    let key: Key | null;

    while ((key = this.keyboard.getKey())) {
      for (const mapping of this.keyboardPressMappings) {
        if (mapping.key !== key || (mapping.valid && !mapping.valid())) {
          continue;
        }

        this.dispatch(mapping);
        break;
      }
    }
  }
}
