import { Game } from "../Game";
import { MapEngine } from "../Map/MapEngine";
import { MapObject } from "../Map/MapObject";
import { Trigger } from "../Map/Trigger";
import { RidingType } from "../Script/RidingType";
import { hex } from "../utils";
import {
  GUIHorizontalLayout,
  GUIVerticalDimension,
  GUIVerticalLayout,
} from "./GUI/GUI";
import { Panel, PanelParams, PanelState } from "./GUI/Panel";

type ObjectTreeItem = MapObject | Trigger | string;

export interface MapPropertiesParams extends PanelParams {
  game: Game;
}

export interface MapPropertiesState extends PanelState {
  selectedObject?: ObjectTreeItem;
}

export class MapPropertiesPanel extends Panel<
  MapPropertiesParams,
  MapPropertiesState
> {
  type = "side";

  getInitialState() {
    return {
      selectedObject: undefined,
    };
  }

  renderChildren() {
    const target = this.surface;
    const g = this.gui;

    const y = 0;
    const x = 0;
    const right = target.width;
    const bottom = target.height;
    const w = right - x;
    const h = bottom - y;

    const map = this.params.game.mapEngine;
    const selected = this.state.selectedObject;

    const children: ((
      position: GUIVerticalLayout
    ) => GUIVerticalDimension)[] = [
      (position: GUIVerticalLayout) =>
        g.toolbar({
          id: "tools",
          ...position,
          h: 64,
          children: this.toolbar(),
        }),
      (position: GUIVerticalLayout) =>
        g.separator({
          ...position,
        }),
      (position: GUIVerticalLayout) =>
        g.texturePreview({
          texture: Game.current.cursorPaletteSet.getTexture(),
          ...position,
          h: 256,
        }),
      (position: GUIVerticalLayout) =>
        g.drawer({
          id: "map_properties",
          title: `Map #${map.index}: ${map.name}`,
          ...position,
          children: [
            (position: GUIVerticalLayout) =>
              g.tree({
                id: "map_properties.objects.list",
                items: this.getTree(),
                selected: this.state.selectedObject,
                getId: this.getTreeChildId,
                onSelect: (item) => {
                  this.state.selectedObject = item;
                },
                render: this.renderTreeChild,
                ...position,
                h: 450,
                getChildren: this.getTreeChildren,
              }),
          ],
        }),
    ];

    if (selected instanceof MapObject) {
      children.push((position: GUIVerticalLayout) =>
        g.drawer({
          id: "map_properties.selected_object.properties",
          title: "Object Properties",
          ...position,
          children: [
            (position: GUIVerticalLayout) => (
              g.texturePreview({
                texture: selected.lowSurface,
                ...position,
                w: 24 * 4,
                h: 32 * 4,
              }),
              g.texturePreview({
                texture: selected.highSurface,
                ...position,
                w: 24 * 4,
                h: 32 * 4,
              })
            ),
            (position: GUIVerticalLayout) =>
              g.checkbox({
                id: "map_properties.selected_object.exists",
                label: "Exists",
                get: () => selected.exists,
                set: (v) => selected.setExists(v),
                ...position,
              }),
            (position: GUIVerticalLayout) =>
              g.checkbox({
                id: "map_properties.selected_object.visible",
                label: "Visible",
                get: () => selected.visible,
                set: (v) => selected.setVisible(v),
                ...position,
              }),
            (position: GUIVerticalLayout) =>
              g.checkbox({
                id: "map_properties.selected_object.dirty",
                label: "Dirty",
                get: () => selected.dirty,
                set: (v) => (selected.dirty = v),
                ...position,
              }),
            (position: GUIVerticalLayout) =>
              g.numericProperty({
                id: "map_properties.selected_object.graphic_id",
                name: "Graphics",
                get: () => selected.graphicsIndex,
                set: (v) => selected.loadSprite(v),
                ...position,
              }),
            (position: GUIVerticalLayout) =>
              g.numericProperty({
                id: "map_properties.selected_object.palette_id",
                name: "Palette",
                get: () => selected.paletteIndex,
                set: (v) => selected.loadPalette(v),
                ...position,
              }),
            (position: GUIVerticalLayout) =>
              g.dropdownProperty({
                id: "map_properties.selected_object.riding_type",
                name: "Riding",
                items: ["None", "Chocobo", "MagitekArmor", "Raft"],
                selected: RidingType[selected.riding],
                onSelect: (item) => {
                  selected.setRiding(RidingType[item], true);
                },
                render: (item) => item,
                dropdownWidth: 300,
                ...position,
              }),
            this.objectScript,
          ],
        })
      );
    }

    g.panel({
      id: "mainpanel",
      x,
      y,
      w,
      h,
      children,
    });
  }

  getTree = () => {
    const map = this.params.game.mapEngine;

    return ["Layer 1", "Layer 2", "Layer 3", "Objects", "Triggers"];
  };

  getTreeChildren = (item: ObjectTreeItem) => {
    const map = this.params.game.mapEngine;

    switch (item) {
      case "Objects":
        return map.objects.filter((obj) => obj.exists);
      case "Triggers":
        return map.triggers;
    }

    if (typeof item === "string") {
      return [];
    }

    return [];
  };

  renderTreeChild = (item: ObjectTreeItem) => {
    if (item instanceof Trigger) {
      return `[${hex(item.eventPointer, 6)}] @ ${item.x},${item.y}`;
    }
    if (item instanceof MapObject) {
      return `[${hex(item.index, 2)}] @ ${item.x},${item.y}`;
    }

    return item.toString();
  };

  getTreeChildId = (child: ObjectTreeItem) => {
    if (child instanceof Trigger) {
      return `trigger_${child.offset}`;
    }
    if (child instanceof MapObject) {
      return `object_${child.index}`;
    }

    return child.toString();
  };

  objectScript = (position: GUIVerticalLayout) => {
    const selected = this.state.selectedObject as MapObject;

    return this.gui.panel({
      id: "map_properties.selected_object.object_script",
      ...position,
      scrollable: true,
      h: 200,
      title: "Object Script",
      children: (selected.objectScriptContext?.log || ["No script"]).map(
        (log, i) => (position: GUIVerticalLayout) =>
          this.gui.text({
            text: log,
            ...position,
          })
      ),
    });
  };

  toolbar() {
    const g = this.gui;

    return [
      (position: GUIHorizontalLayout) =>
        g.button({
          text: Game.current.paused ? "Play" : "Pause",
          onClick: () => Game.current.setPaused(!Game.current.paused),
          ...position,
        }),
    ];
  }
}
