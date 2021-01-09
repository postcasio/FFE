import { Game } from "../Game";
import { InputManager } from "./InputManager";
import { KeyboardAction, keyboardMapping } from "./InputMapping";
import { Intent } from "./Intent";

export function initializeDefaultMappings(im: InputManager) {
  im.addMapping(keyboardMapping(Key.W, Intent.Up, KeyboardAction.HoldStart));
  im.addMapping(keyboardMapping(Key.A, Intent.Left, KeyboardAction.HoldStart));
  im.addMapping(keyboardMapping(Key.S, Intent.Down, KeyboardAction.HoldStart));
  im.addMapping(keyboardMapping(Key.D, Intent.Right, KeyboardAction.HoldStart));

  im.addMapping(keyboardMapping(Key.W, Intent.Up, KeyboardAction.HoldEnd));
  im.addMapping(keyboardMapping(Key.A, Intent.Left, KeyboardAction.HoldEnd));
  im.addMapping(keyboardMapping(Key.S, Intent.Down, KeyboardAction.HoldEnd));
  im.addMapping(keyboardMapping(Key.D, Intent.Right, KeyboardAction.HoldEnd));

  im.addMapping(keyboardMapping(Key.J, Intent.Accept, KeyboardAction.Press));
  im.addMapping(keyboardMapping(Key.K, Intent.Cancel, KeyboardAction.Press));

  im.addMapping(keyboardMapping(Key.W, Intent.CursorUp, KeyboardAction.Press));
  im.addMapping(
    keyboardMapping(Key.A, Intent.CursorLeft, KeyboardAction.Press)
  );
  im.addMapping(
    keyboardMapping(Key.S, Intent.CursorDown, KeyboardAction.Press)
  );
  im.addMapping(
    keyboardMapping(Key.D, Intent.CursorRight, KeyboardAction.Press)
  );

  im.updateMappingCaches();
}
