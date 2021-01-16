import Prim from "prim";
import { Game } from "../Game";
import { LayerType } from "../Map/Layer";
import { MapObject, OBJECT_ID_CAMERA } from "../Map/MapObject";
import { MapProperties } from "../Map/MapProperties";
import { hex } from "../utils";
import { DropdownOptions, GUIVerticalLayout } from "./GUI/GUI";
import { Panel } from "./GUI/Panel";
import { MapPropertiesPanel } from "./MapProperties";
import { DropdownPanel } from "./DropdownPanel";

const tileHoverColor = new Color(1, 1, 1, 0.3);
const objectHoverColor = new Color(0.2, 0.4, 0.8, 0.8);
const triggerTileColor = new Color(0.3, 0.7, 0.3, 0.5);

export interface Registration {
  remove: () => void;
}

export class Debugger {
  game: Game;
  panels: Panel[] = [];

  mapPropertiesPanel: MapPropertiesPanel;

  constructor(game: Game) {
    this.game = game;

    const gameScreenWidth = Math.floor(Surface.Screen.height * 1.33);
    const remainingWidth = Surface.Screen.width - gameScreenWidth;

    this.addPanel(
      (this.mapPropertiesPanel = new MapPropertiesPanel(
        gameScreenWidth,
        0,
        remainingWidth,
        Surface.Screen.height,
        this.dropdownOffset(Surface.Screen.width - remainingWidth, 0),
        { game: this.game }
      ))
    );
  }

  render() {
    const sw = this.game.screen.width;
    const sh = this.game.screen.height;
    const mx =
      Mouse.Default.x / (Math.floor(Surface.Screen.height * 1.33) / sw);
    const my = Mouse.Default.y / (Surface.Screen.height / sh);

    const [cameraX, cameraY] = this.game.mapEngine.getCameraPosition(sw, sh);
    const bg1 = this.game.mapEngine.layers[LayerType.BG1];
    const [offsetX, offsetY] = bg1.getOffset(cameraX, cameraY, sw, sh);

    const [tileX, tileY] = bg1.positionToTile(offsetX + mx, offsetY + my);

    const object = this.game.mapEngine.getObjectAt(tileX, tileY);

    for (const trigger of this.game.mapEngine.triggers) {
      const x = trigger.x * 16;
      const y = trigger.y * 16;
      if (
        x + 16 >= offsetX &&
        x < offsetX + sw &&
        y + 16 >= offsetY &&
        y < offsetY + sh
      ) {
        Prim.drawSolidRectangle(
          this.game.screen,
          x - offsetX,
          y - offsetY,
          16,
          16,
          triggerTileColor
        );
      }
    }

    if (object) {
      if (Mouse.Default.isPressed(MouseKey.Left)) {
        this.mapPropertiesPanel.state.selectedObject = object;
      }

      this.renderObjectOverlay(object, offsetX, offsetY);
    }
    if (this.mapPropertiesPanel.state.selectedObject instanceof MapObject) {
      this.renderObjectOverlay(
        this.mapPropertiesPanel.state.selectedObject,
        offsetX,
        offsetY
      );
    }

    Prim.drawRectangle(
      this.game.screen,
      tileX * 16 - offsetX,
      tileY * 16 - offsetY,
      16,
      16,
      1,
      tileHoverColor
    );

    for (const panel of this.panels) {
      panel.render(true);
      Prim.blit(
        Surface.Screen,
        panel.x,
        panel.y,
        panel.getSurface(),
        new Color(1, 1, 1, 0.8)
      );
    }
  }

  renderObjectOverlay(object: MapObject, offsetX: number, offsetY: number) {
    Game.current.fixedWidthFont.drawText(
      this.game.screen,
      object.absX - offsetX,
      object.absY - offsetY - object.getRenderOffset() - 8,
      hex(object.index, 2)
    );

    Prim.drawRectangle(
      this.game.screen,
      object.x * 16 - offsetX,
      object.y * 16 - offsetY - object.getRenderOffset(),
      16,
      16 + object.getRenderOffset(),
      1,
      objectHoverColor
    );
  }

  addPanel(panel: Panel): Registration {
    this.panels.push(panel);

    return {
      remove: () => (this.panels = this.panels.filter((p) => p !== panel)),
    };
  }

  dropdownOffset<T>(x: number, y: number) {
    return (options: DropdownOptions<T>): Promise<T | undefined> => {
      return this.openDropdownPanel<T>({
        ...options,
        opener: {
          x: options.opener.x + x,
          y: options.opener.y + y,
          w: options.opener.w,
          h: options.opener.h,
        },
      });
    };
  }

  openDropdownPanel = <T>(options: DropdownOptions<T>): Promise<T> => {
    const opener = options.opener;

    let x: number;
    const w = options.dropdownWidth;
    const h = 120;
    let y: number;

    if (opener.y + opener.h! + h < Surface.Screen.height) {
      y = opener.y + opener.h!;
    } else {
      y = opener.y - h;
    }

    if (opener.x + w > Surface.Screen.width) {
      x = Surface.Screen.width - w;
    } else {
      x = opener.x;
    }

    return new Promise((res, rej) => {
      let panelRegistration: Registration;

      const panel = new DropdownPanel<T>(
        x,
        y,
        w,
        h,
        this.dropdownOffset(x, y),
        {
          ...options,
          onCancel: () => {
            panelRegistration.remove();
            rej();
          },
          onSelect: (result) => {
            panelRegistration.remove();
            res(result);
          },
        }
      );

      return (panelRegistration = this.addPanel(panel));
    });
  };
}
