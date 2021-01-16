import { Panel, PanelParams, PanelState } from "./GUI/Panel";

export interface DropdownPanelParams<T> extends PanelParams {
  onCancel: () => void;
  onSelect: (result: T) => void;
  items: T[];
  render: (item: T) => string;
  getChildren: (item: T) => T[];
  getId: (item: T, index: number) => string;
  selected?: T;
}

export type DropdownPanelState = PanelState;

export class DropdownPanel<T> extends Panel<
  DropdownPanelParams<T>,
  DropdownPanelState
> {
  type = "Dropdown";

  isModal() {
    return true;
  }

  getInitialState(): DropdownPanelState {
    return {};
  }

  renderChildren() {
    this.gui.panel({
      id: "dropdown",
      scrollable: false,
      border: true,
      x: 0,
      y: 0,
      w: this.surface.width,
      h: this.surface.height,
      children: [
        (position) =>
          this.gui.tree({
            id: "dropdown.tree",
            ...position,
            h: this.surface.height,
            items: this.params.items,
            onSelect: (item) => this.params.onSelect(item),
            selected: this.params.selected,
            render: this.params.render,
            getId: this.params.getId,
            getChildren: this.params.getChildren,
          }),
      ],
    });
  }
}
