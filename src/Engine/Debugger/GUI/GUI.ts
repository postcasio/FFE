import Prim from "prim";
import BitmapFont from "./BitmapFont";
import { MouseEvents, MouseEventType } from "./MouseEvents";

type CompatFont = Font | BitmapFont;

export interface GUIVerticalLayout {
  x: number;
  y: number;
  w: number;
  h?: number;
}

export type GUIVerticalChildCallback = (
  position: GUIVerticalLayout
) => { height: number };

export interface GUIHorizontalLayout {
  x: number;
  y: number;
  w?: number;
  h: number;
}

export type GUIHorizontalChildCallback = (
  position: GUIHorizontalLayout
) => { width: number };

export type GUIVerticalLayoutChild =
  | null
  | undefined
  | false
  | GUIVerticalChildCallback;
export type GUIHorizontalLayoutChild =
  | null
  | undefined
  | false
  | GUIHorizontalChildCallback;

export interface GUIVerticalDimension {
  height: number;
  width: number;
}

export interface GUIHorizontalDimension {
  width: number;
}

interface FocusableControlState {
  focused?: boolean;
}

interface DropdownControlState {
  type: "dropdown";
  focused?: boolean;
}

interface FieldControlState {
  type: "field";
  focused?: boolean;
  cursorPosition: number;
  text?: string;
}

interface DrawerControlState {
  type: "drawer";
  focused?: boolean;
  expanded?: boolean;
}

interface ListControlState {
  type: "list";
  focused?: boolean;
}

interface TreeControlState {
  type: "tree";
  focused?: boolean;
  expanded: string[];
}

interface CheckboxControlState {
  type: "checkbox";
  focused?: boolean;
}

interface PaletteControlState {
  type: "palette";
  selectedIndex: number;
  customText?: string;
}

interface SharedPaletteControlState {
  type: "sharedPalette";
  colors: Color[];
}

interface PanelControlState {
  focused: boolean;
  type: "panel";
  scrollY: number;
  mouseStartY: number;
  delta: number;
}

function canFocus<T extends ControlState>(
  state: T
): state is FocusableControlState & T {
  return Object.prototype.hasOwnProperty.call(state, "focused");
}

export type ControlState =
  | FieldControlState
  | DrawerControlState
  | ListControlState
  | CheckboxControlState
  | PaletteControlState
  | SharedPaletteControlState
  | PanelControlState
  | DropdownControlState
  | TreeControlState;

export interface DropdownOptions<T> {
  items: T[];
  render: (item: T) => string;
  getChildren: (item: T) => T[];
  getId: (item: T, index: number) => string;
  selected?: T;
  opener: GUIVerticalLayout;
  dropdownWidth: number;
}
export type DropdownCallback<T> = (options: DropdownOptions<T>) => Promise<T>;

interface ClipRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export class GUI {
  target: Surface;

  private controlStates: Record<string, ControlState> = {};
  private focusedControl?: string;

  private clipRects: ClipRect[] = [];
  private mouseEvents: MouseEvents = new MouseEvents();

  private textSurface: Surface = new Surface(
    Surface.Screen.width,
    Surface.Screen.height,
    Color.Black
  );

  private dropdownCallback: DropdownCallback<unknown>;
  private canAcceptInput = false;
  // private dropdownCallback: DropdownCallback<unknown>;

  openDropdown<T>(options: DropdownOptions<T>): Promise<T | undefined> {
    return this.dropdownCallback(
      options as DropdownOptions<unknown>
    ) as Promise<T | undefined>;
  }

  style = {
    font: {
      // regular: Font.Default,
      // numeric: Font.Default,
      regular: new BitmapFont("@/assets/fonts/arial-rounded-32px-outline.fnt"), //Font.Default,
      numeric: new BitmapFont("@/assets/fonts/iosevka-fixed-32px-outline.fnt"),
    },
    color: {
      textColor: Color.White,
      panelColor: new Color(0.1, 0.1, 0.2),
      panelBorderColor: new Color(0.6, 0.6, 1.0, 0.8),
      panelBorderColorFocused: new Color(0.8, 0.8, 1.0, 0.95),
      drawerColorInactive: Color.SteelBlue,
      drawerColorExpanded: Color.SteelBlue,
      buttonColorInactive: Color.SlateBlue,
      buttonColorHover: Color.ForestGreen,
      buttonColorActive: Color.LightSkyBlue,
      buttonColorDisabled: Color.SlateGray,
      fieldColorInactive: new Color(0.12, 0.12, 0.24),
      fieldColorFocused: new Color(0.2, 0.2, 0.4),
      fieldColorHover: new Color(0.15, 0.15, 0.3),
      fieldBorderColor: new Color(0.3, 0.3, 0.6),
      listItemColorActive: Color.SteelBlue,
      listItemColorSelected: Color.SlateBlue,
      compositeFieldColorInactive: new Color(0.2, 0.2, 0.4),
      compositeFieldColorActive: new Color(0.2, 0.2, 0.4),
      compositeFieldColorExpanded: new Color(0.3, 0.3, 0.6),
      listColorInactive: new Color(0.12, 0.12, 0.24),
      listColorHover: new Color(0.15, 0.15, 0.3),
      listColorFocused: new Color(0.3, 0.3, 0.6),
      checkboxColorInactive: new Color(0.3, 0.3, 0.6),
      checkboxColorFocused: new Color(0.3, 0.3, 0.6),
      checkboxColorHover: new Color(0.3, 0.3, 0.6),
      scrollbarTrackColor: new Color(0.12, 0.12, 0.24),
      scrollbarHandleColor: new Color(0.3, 0.3, 0.6),
      scrollbarHandleColorHover: Color.SlateBlue,
    },
    padding: {
      small: 4,
      medium: 8,
      large: 16,
    },
  };

  wasMouseClicked = false;
  isMouseClicked = false;
  offsetX = 0;
  offsetY = 0;

  modal = false;

  constructor(
    target: Surface,
    modal = false,
    dropdown: DropdownCallback<unknown>
  ) {
    this.target = target;
    this.modal = modal;
    this.textSurface.blendOp = BlendOp.Add;
    this.dropdownCallback = dropdown;
  }

  getControlStates(): Record<string, ControlState> {
    return this.controlStates;
  }

  setControlStates(controlStates: Record<string, ControlState>): void {
    this.controlStates = controlStates;
  }

  clipTo({
    x,
    y,
    w,
    h,
    children,
    scrollY = 0,
  }: {
    x: number;
    y: number;
    w: number;
    h: number;
    children?: GUIVerticalLayoutChild[];
    scrollY?: number;
  }) {
    this.target.clipTo(x, y, w, h);
    this.clipRects.push({ x, y, w, h });

    y -= scrollY;

    const { height: childHeight } = children
      ? this.childrenVertical({ children, x, y, w })
      : { height: 0 };

    this.clipRects.pop();

    if (this.clipRects.length) {
      const prevClipRect = this.clipRects[this.clipRects.length - 1];

      this.target.clipTo(
        prevClipRect.x,
        prevClipRect.y,
        prevClipRect.w,
        prevClipRect.h
      );
    } else {
      this.target.clipTo(0, 0, this.target.width, this.target.height);
    }

    return { height: h, childHeight, width: w };
  }

  begin(
    target: Surface,
    offsetX: number,
    offsetY: number,
    canAcceptInput: boolean
  ): void {
    this.target = target;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.mouseEvents.consumeEvents();
    this.wasMouseClicked = this.isMouseClicked;
    this.isMouseClicked = Mouse.Default.isPressed(MouseKey.Left);
    this.canAcceptInput = canAcceptInput;
  }

  end(): void {
    this.mouseEvents.discardEvents();
  }

  mouseClicked(x: number, y: number, w: number, h: number): boolean {
    return (
      this.canAcceptInput &&
      this.isMouseClicked &&
      !this.wasMouseClicked &&
      this.mouseIntersects(x, y, w, h)
    );
  }

  mouseHeld(): boolean {
    return this.canAcceptInput && this.isMouseClicked;
  }

  mouseWasHeld(): boolean {
    return this.wasMouseClicked;
  }

  mouseIntersects(x: number, y: number, w: number, h: number): boolean {
    if (!this.canAcceptInput) {
      return false;
    }

    const mx = Mouse.Default.x - this.offsetX;
    const my = Mouse.Default.y - this.offsetY;

    if (this.clipRects.length) {
      const clipRect = this.clipRects[this.clipRects.length - 1];

      if (
        mx < clipRect.x ||
        mx >= clipRect.x + clipRect.w ||
        my < clipRect.y ||
        my >= clipRect.y + clipRect.h
      ) {
        return false;
      }
    }

    return mx >= x && mx < x + w && my >= y && my < y + h;
  }

  mouseY(): number {
    const my = Mouse.Default.y - this.offsetY;

    return my;
  }

  private isShiftKeyPressed() {
    return (
      Keyboard.Default.isPressed(Key.LShift) ||
      Keyboard.Default.isPressed(Key.RShift)
    );
  }

  blurControl(id: string): void {
    const state = this.controlStates[id];

    if (canFocus(state)) {
      state.focused = false;
    }

    if (this.focusedControl === id) {
      this.focusedControl = undefined;
    }
  }

  blur(): void {
    if (this.focusedControl) {
      this.blurControl(this.focusedControl);
    }
  }

  focusControl(id: string): void {
    if (this.focusedControl) {
      const state = this.controlStates[
        this.focusedControl
      ] as FocusableControlState;

      state.focused = false;
    }

    const state = this.controlStates[id];

    if (!canFocus(state)) {
      throw new Error("Can't focus " + id);
    }

    this.focusedControl = id;

    state.focused = true;
  }

  isControlFocused(id: string): boolean {
    return (this.controlStates[id] as FocusableControlState).focused || false;
  }

  isFocused(): boolean {
    return this.modal || this.focusedControl ? true : false;
  }

  stateful<T extends ControlState>(id: string, initialState: T): T {
    if (!this.controlStates[id]) {
      this.controlStates[id] = initialState;
    }

    return this.controlStates[id] as T;
  }

  childrenVertical({
    children = [],
    x,
    y,
    w,
    h,
    padding = this.style.padding.small,
  }: {
    children?: GUIVerticalLayoutChild[];
    x: number;
    y: number;
    w: number;
    h?: number;
    padding?: number;
  }): GUIVerticalDimension {
    return {
      width: w,
      height:
        children.reduce(
          (height, child) =>
            height +
            (child ? child({ x, y: y + height, w, h }).height + padding : 0),
          0
        ) -
        padding * Math.min(children.length, 1),
    };
  }

  childrenHorizontal({
    children = [],
    x,
    y,
    w,
    h,
    padding = this.style.padding.small,
  }: {
    children?: GUIHorizontalLayoutChild[];
    x: number;
    y: number;
    w?: number;
    h: number;
    padding?: number;
  }): GUIVerticalDimension {
    return {
      height: h,
      width:
        children.reduce(
          (width, child) =>
            width + (child ? child({ x: x + width, y, h }).width + padding : 0),
          0
        ) -
        padding * Math.min(children.length, 1),
    };
  }

  panel({
    id,
    x,
    y,
    w,
    h,
    children = [],
    color = this.style.color.panelColor,
    scrollable = true,
    border = false,
    title,
  }: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    children?: GUIVerticalLayoutChild[];
    color?: Color;
    scrollable?: boolean;
    border?: boolean;
    title?: string;
  }): GUIVerticalDimension {
    const state = this.stateful<PanelControlState>(id, {
      focused: false,
      type: "panel",
      mouseStartY: -1,
      scrollY: 0,
      delta: 0,
    });

    Prim.drawSolidRectangle(this.target, x, y, w, h, color);

    let titleOffset = 0;

    if (title) {
      const titleH =
        this.style.font.regular.height + this.style.padding.medium * 2;
      Prim.drawSolidRectangle(
        this.target,
        x,
        y,
        w,
        titleH,
        this.style.color.panelBorderColor
      );

      this.text({
        text: title,
        x: x + this.style.padding.medium,
        y: y + this.style.padding.medium,
        w: w - this.style.padding.medium * 2,
      });

      titleOffset = titleH + this.style.padding.small;
    }

    if (border) {
      Prim.drawRectangle(
        this.target,
        x,
        y,
        w,
        h,
        2,
        this.isFocused()
          ? this.style.color.panelBorderColorFocused
          : this.style.color.panelBorderColor
      );
    }

    y += titleOffset;
    h -= titleOffset;

    const outerX = x;
    const outerY = y;
    const outerW = w;
    const outerH = h;

    x += this.style.padding.medium;
    y += this.style.padding.medium;
    w -= scrollable
      ? this.style.padding.medium * 3 + 10
      : this.style.padding.medium * 2;
    h -= this.style.padding.medium * 2;

    const { childHeight } = this.clipTo({
      children,
      x,
      y,
      w,
      h,
      scrollY: state.scrollY,
    });

    if (scrollable) {
      const handleBaseProportion = h / childHeight;

      Prim.drawSolidRectangle(
        this.target,
        x + w + this.style.padding.medium,
        y,
        10,
        h,
        this.style.color.scrollbarTrackColor
      );

      if (handleBaseProportion < 1) {
        const handleX = x + w + this.style.padding.medium;
        let handleY = y;
        const handleW = 10;
        const handleH = Math.min(handleBaseProportion, 0.6) * h;
        // const handleMaxY = y + h - handleH;
        const handleRange = h - handleH;

        handleY += (state.scrollY / (childHeight - h)) * handleRange;
        //state.scrollNormal * (childHeight - h)

        let handleColor = this.style.color.scrollbarHandleColor;

        if (this.mouseIntersects(outerX, outerY, outerW, outerH)) {
          handleColor = this.style.color.scrollbarHandleColorHover;

          let event;
          while ((event = this.mouseEvents.getEvent(MouseEventType.Wheel))) {
            switch (event.key) {
              case MouseKey.WheelDown:
                state.scrollY += (childHeight - h) * 0.2;
                break;
              case MouseKey.WheelUp:
                state.scrollY -= (childHeight - h) * 0.2;
                break;
              default:
                break;
            }
          }
        }

        if (
          this.mouseClicked(
            handleX - this.style.padding.medium,
            y,
            handleW + this.style.padding.medium * 2,
            h
          )
        ) {
          this.focusControl(id);
          state.scrollY =
            (Math.min(
              handleRange,
              Math.max(0, this.mouseY() - handleH / 2 - y)
            ) /
              handleRange) *
            (childHeight - h);
        } else if (this.mouseHeld() && state.focused) {
          state.scrollY =
            (Math.min(
              handleRange,
              Math.max(0, this.mouseY() - handleH / 2 - y)
            ) /
              handleRange) *
            (childHeight - h);
          handleColor = this.style.color.scrollbarHandleColorHover;
        } else if (this.mouseWasHeld() && state.focused) {
          this.blurControl(id);
        }

        Prim.drawSolidRectangle(
          this.target,
          handleX,
          handleY,
          handleW,
          handleH,
          handleColor
        );
      } else {
        state.scrollY = 0;
      }
    }

    return { height: h, width: w };
  }

  drawer({
    id,
    title,
    compositeField,
    defaultExpanded,
    x,
    y,
    w,
    children,
    previewChildren,
    previewFullWidth = false,
  }: {
    id: string;
    title: string;
    compositeField?: boolean;
    defaultExpanded?: boolean;
    x: number;
    y: number;
    w: number;
    children?: GUIVerticalLayoutChild[];
    previewChildren?: GUIVerticalLayoutChild[];
    previewFullWidth?: boolean;
  }): GUIVerticalDimension {
    const state = this.stateful<DrawerControlState>(id, {
      type: "drawer",
      expanded: defaultExpanded === undefined ? true : defaultExpanded,
      focused: false,
    });

    let height = 0;

    const button = this.button({
      text: title,
      onClick: () => {
        state.expanded = !state.expanded;
      },
      colorInactive: state.expanded
        ? compositeField
          ? this.style.color.compositeFieldColorExpanded
          : this.style.color.drawerColorExpanded
        : compositeField
        ? this.style.color.compositeFieldColorInactive
        : this.style.color.drawerColorInactive,
      x,
      y,
      w,
    });

    if (previewChildren) {
      const previewWidth = previewFullWidth ? w : w / 2;
      this.childrenVertical({
        children: previewChildren,
        x: x + w - previewWidth,
        y: y + this.style.padding.medium,
        w: previewWidth - this.style.padding.medium,
        h: button.height - this.style.padding.medium * 2,
      });
    }

    height += button.height;

    if (children && state.expanded) {
      height += this.style.padding.small;
      height += this.childrenVertical({
        children,
        x: x + this.style.padding.medium,
        y: y + height,
        w: w - this.style.padding.medium,
      }).height;
    }

    return { height, width: w };
  }

  separator({
    x,
    y,
    w,
    h,
  }: {
    x: number;
    y: number;
  } & (
    | { w: number; h?: number }
    | { w?: number; h: number }
  )): GUIVerticalDimension {
    if (w) {
      Prim.drawLine(
        this.target,
        x,
        y + this.style.padding.medium + 1,
        x + w,
        y + this.style.padding.medium + 1,
        2,
        this.style.color.fieldBorderColor
      );
      return { width: w, height: this.style.padding.medium * 2 + 2 };
    } else if (h) {
      Prim.drawLine(
        this.target,
        x + this.style.padding.medium + 1,
        y,
        x + this.style.padding.medium + 1,
        y + h,
        2,
        this.style.color.fieldBorderColor
      );
      return { width: this.style.padding.medium * 2 + 2, height: h };
    }

    throw new Error("Must specify either w or h");
  }

  button({
    text,
    onClick,
    colorInactive,
    x,
    y,
    w,
    pushed = false,
    enabled = true,
    h = this.style.font.regular.height + this.style.padding.medium * 2,
  }: {
    text: string;
    onClick: () => void;
    colorInactive?: Color;
    x: number;
    y: number;
    pushed?: boolean;
    enabled?: boolean;
  } & (
    | { w: number; h?: number }
    | { w?: number; h: number }
  )): GUIVerticalDimension {
    let state: "inactive" | "clicked" | "hover" | "disabled" | "pushed" =
      "inactive";

    if (!w) {
      w =
        this.style.font.regular.getTextSize(text).width +
        this.style.padding.medium * 2;
    }

    if (enabled && this.mouseClicked(x, y, w, h)) {
      onClick();
      state = "clicked";
    } else if (enabled && this.mouseIntersects(x, y, w, h)) {
      state = "hover";
    } else if (!enabled) {
      state = "disabled";
    } else if (pushed) {
      state = "pushed";
    }

    const bgColors = {
      inactive: colorInactive || this.style.color.buttonColorInactive,
      clicked: this.style.color.buttonColorActive,
      hover: this.style.color.buttonColorHover,
      disabled: this.style.color.buttonColorDisabled,
      pushed: this.style.color.buttonColorHover,
    };

    Prim.drawSolidRectangle(this.target, x, y, w, h, bgColors[state]);

    this.text({
      text,
      x: x + this.style.padding.medium,
      y: y + (h - this.style.font.regular.height) / 2,
      w: w - this.style.padding.medium * 2,
      color: this.style.color.textColor,
    });

    return { height: h, width: w };
  }

  text({
    text,
    x,
    y,
    w = 0,
    font = this.style.font.regular,
    align = "left",
    color = this.style.color.textColor,
  }: {
    text?: string;
    x: number;
    y: number;
    w?: number;
    font?: CompatFont;
    align?: "left" | "center" | "right";
    color?: Color;
  }): GUIVerticalDimension {
    if (!text) {
      return { height: 0, width: 0 };
    }

    if (align === "right") {
      x += w - font.getTextSize(text).width;
    }

    this.textSurface.clear(Color.Transparent);

    font.drawText(this.textSurface, 20, 20, text, color, w);

    Prim.blit(this.target, x - 20, y - 20, this.textSurface);

    return font.getTextSize(text, w);
  }

  toolbar({
    id,
    x,
    y,
    w,
    h,
    children = [],
    color = this.style.color.panelColor,
    border = false,
    title,
  }: {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
    children?: GUIHorizontalLayoutChild[];
    color?: Color;
    border?: boolean;
    title?: string;
  }): GUIVerticalDimension {
    // const state = this.stateful<PanelControlState>(id, {
    //   focused: false,
    //   type: "panel",
    //   mouseStartY: -1,
    //   scrollY: 0,
    //   delta: 0,
    // });

    Prim.drawSolidRectangle(this.target, x, y, w, h, color);

    let titleOffset = 0;

    if (title) {
      const titleH =
        this.style.font.regular.height + this.style.padding.medium * 2;
      Prim.drawSolidRectangle(
        this.target,
        x,
        y,
        w,
        titleH,
        this.style.color.panelBorderColor
      );

      this.text({
        text: title,
        x: x + this.style.padding.medium,
        y: y + this.style.padding.medium,
        w: w - this.style.padding.medium * 2,
      });

      titleOffset = titleH + this.style.padding.small;
    }

    if (border) {
      Prim.drawRectangle(
        this.target,
        x,
        y,
        w,
        h,
        2,
        this.isFocused()
          ? this.style.color.panelBorderColorFocused
          : this.style.color.panelBorderColor
      );
    }

    y += titleOffset;
    h -= titleOffset;

    x += this.style.padding.medium;
    y += this.style.padding.medium;
    w -= this.style.padding.medium * 2;
    h -= this.style.padding.medium * 2;

    this.childrenHorizontal({
      children,
      x,
      y,
      w,
      h,
    });

    return { height: h, width: w };
  }

  color({
    color,
    innerBorderColor = Color.Black,
    outerBorderColor = Color.White,
    borderWidth = 1,
    x,
    y,
    w,
    h,
  }: {
    color: Color;
    innerBorderColor?: Color;
    outerBorderColor?: Color;
    borderWidth?: number;
    x: number;
    y: number;
    w: number;
    h: number;
  }): GUIVerticalDimension {
    Prim.drawSolidRectangle(this.target, x, y, w, h, color);

    Prim.drawRectangle(this.target, x, y, w, h, borderWidth, innerBorderColor);
    Prim.drawRectangle(
      this.target,
      x,
      y,
      w,
      h,
      borderWidth / 2,
      outerBorderColor
    );

    return { height: h, width: w };
  }

  palette({
    id,
    sharedPaletteId,
    value,
    set,
    x,
    y,
    w,
    maxEntries = 8,
  }: {
    id: string;
    sharedPaletteId: string;
    value: Color;
    set: (color: Color) => void;
    x: number;
    y: number;
    w: number;
    maxEntries?: number;
  }): GUIVerticalDimension {
    // const state = this.stateful<PaletteControlState>(id, {
    //   type: "palette",
    //   selectedIndex: 0,
    // });

    const sharedState = this.stateful<SharedPaletteControlState>(
      sharedPaletteId,
      {
        type: "sharedPalette",
        colors: [
          Color.Black,
          Color.Gray,
          Color.White,
          Color.Red,
          Color.Green,
          Color.Blue,
        ],
      }
    );

    const buttonW = 18;
    const buttonH = 18;

    const entriesPerRow = Math.floor(w / buttonW);
    const rows = Math.ceil(sharedState.colors.length / entriesPerRow);
    const height = rows * buttonH + (rows - 1) * this.style.padding.medium;

    for (let i = 0; i < sharedState.colors.length; i++) {
      const buttonX =
        x + (i % entriesPerRow) * (buttonW + this.style.padding.medium);
      const buttonY =
        y +
        Math.floor(i / entriesPerRow) * (buttonH + this.style.padding.medium);

      let borderColor;
      const borderWidth = 2;

      if (this.mouseIntersects(buttonX, buttonY, buttonW, buttonH)) {
        borderColor = Color.White;
      } else if (value.name === sharedState.colors[i].name) {
        borderColor = this.style.color.buttonColorActive;
      } else {
        borderColor = Color.Black;
      }

      if (this.mouseClicked(buttonX, buttonY, buttonW, buttonH)) {
        set(sharedState.colors[i]);
      }

      this.color({
        color: sharedState.colors[i],
        innerBorderColor: borderColor,
        outerBorderColor: Color.White,
        borderWidth,
        x: buttonX,
        y: buttonY,
        w: buttonW,
        h: buttonH,
      });
    }

    return { height, width: w };
  }

  colorField({
    id,
    title = "Color",
    onChange,
    x,
    y,
    w,
    color,
    defaultExpanded = false,
  }: {
    id: string;
    title?: string;
    onChange?: (color: Color) => void;
    x: number;
    y: number;
    w: number;
    color: Color;
    defaultExpanded?: boolean;
  }): GUIVerticalDimension {
    return this.drawer({
      id: `${id}._drawer`,
      title: title,
      compositeField: true,
      x,
      y,
      w,
      previewChildren: [
        (position) =>
          this.color({
            color,
            ...position,
            h: position.h!,
          }),
      ],
      defaultExpanded: defaultExpanded === true,
      children: [
        (position) =>
          this.palette({
            id: `${id}.palette`,
            sharedPaletteId: "global.palette",
            value: color,
            set: (newColor) => {
              color.r = newColor.r;
              color.g = newColor.g;
              color.b = newColor.b;
              color.a = newColor.a;
              onChange?.(color);
            },
            ...position,
            maxEntries: 8,
          }),

        (position) =>
          this.numericProperty({
            id: `${id}.r`,
            name: "R",
            get: () => color.r,
            set: (v) => {
              (color.r = v), onChange?.(color);
            },
            ...position,
          }),

        (position) =>
          this.numericProperty({
            id: `${id}.g`,
            name: "G",
            get: () => color.g,
            set: (v) => {
              color.g = v;
              onChange?.(color);
            },
            ...position,
          }),
        (position) =>
          this.numericProperty({
            id: `${id}.b`,
            name: "B",
            get: () => color.b,
            set: (v) => {
              color.b = v;
              onChange?.(color);
            },
            ...position,
          }),
      ],
    });
  }

  textureField({
    id,
    title = "Texture",
    texture,
    onChange,
    x,
    y,
    w,
    defaultExpanded = false,
  }: {
    id: string;
    title?: string;
    onChange?: (texture?: Texture) => void;
    x: number;
    y: number;
    w: number;
    texture?: Texture;
    defaultExpanded?: boolean;
  }): GUIVerticalDimension {
    return this.drawer({
      id: `${id}._drawer`,
      title: title,
      compositeField: true,
      x,
      y,
      w,
      previewChildren: [
        (position) =>
          this.texturePreview({
            texture,
            ...position,
            h: position.h!,
          }),
      ],
      defaultExpanded: defaultExpanded === true,
      children: [
        (position) =>
          this.texturePreview({
            texture,
            ...position,
            h: w,
          }),
        (position) =>
          this.dropdown({
            id: `${id}.dropdown`,
            ...position,
            ...this.getFileDropdownProps({
              directory: "@/",
              filesOnly: true,
              onSelect: async (entry) => {
                try {
                  const tex = await Texture.fromFile(entry);
                  onChange?.(tex);
                } catch {
                  SSj.log("couldnt load texture " + entry);
                }
              },
            }),
            selected: texture?.fileName || undefined,
          }),
        (position) =>
          this.button({
            text: "Clear",
            onClick: () => {
              onChange?.(undefined);
            },
            ...position,
          }),
      ],
    });
  }

  drawTexture(
    texture: Texture,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    mask: Color = Color.White
  ): void {
    const u1 = 0;
    const u2 = 1;
    const v1 = 1;
    const v2 = 0;

    Shape.drawImmediate(this.target, ShapeType.TriStrip, texture, [
      { x: x1, y: y1, u: u1, v: v1, color: mask },
      { x: x2, y: y1, u: u2, v: v1, color: mask },
      { x: x1, y: y2, u: u1, v: v2, color: mask },
      { x: x2, y: y2, u: u2, v: v2, color: mask },
    ]);
  }

  texturePreview({
    texture,
    innerBorderColor = Color.Black,
    outerBorderColor = Color.White,
    borderWidth = 2,
    x,
    y,
    w,
    h,
  }: {
    texture?: Texture;
    innerBorderColor?: Color;
    outerBorderColor?: Color;
    borderWidth?: number;
    x: number;
    y: number;
    w: number;
    h: number;
  }): GUIVerticalDimension {
    if (texture) {
      this.drawTexture(texture, x, y, x + w, y + h);
    }

    Prim.drawRectangle(this.target, x, y, w, h, borderWidth, innerBorderColor);
    Prim.drawRectangle(
      this.target,
      x,
      y,
      w,
      h,
      borderWidth / 2,
      outerBorderColor
    );

    return { height: h, width: w };
  }

  field({
    id,
    get,
    set,
    x,
    y,
    w,
    font = this.style.font.regular,
  }: {
    id: string;
    get: () => any;
    set: (v: any) => void;
    x: number;
    y: number;
    w: number;
    font?: CompatFont;
  }): GUIVerticalDimension {
    const state = this.stateful<FieldControlState>(id, {
      type: "field",
      cursorPosition: 0,
      focused: false,
    });

    const h = font.height + this.style.padding.medium * 2;

    if (this.mouseClicked(x, y, w, h)) {
      this.focusControl(id);
    }

    if (state.focused) {
      Prim.drawSolidRectangle(
        this.target,
        x,
        y,
        w,
        h,
        this.style.color.fieldColorFocused
      );
    } else if (this.mouseIntersects(x, y, w, h)) {
      Prim.drawSolidRectangle(
        this.target,
        x,
        y,
        w,
        h,
        this.style.color.fieldColorHover
      );
    } else {
      Prim.drawSolidRectangle(
        this.target,
        x,
        y,
        w,
        h,
        this.style.color.fieldColorInactive
      );
    }

    Prim.drawRectangle(
      this.target,
      x,
      y,
      w,
      h,
      2,
      this.style.color.fieldBorderColor
    );

    let text;
    const currentValue = String(get());

    if (state.focused) {
      if (state.text === undefined) {
        state.text = currentValue;
        state.cursorPosition = currentValue.length;
      }

      let key: Key | null;
      while ((key = Keyboard.Default.getKey())) {
        if (state.text === undefined) {
          continue;
        }

        switch (key) {
          case Key.Left:
            state.cursorPosition = Math.max(state.cursorPosition - 1, 0);
            break;
          case Key.Right:
            state.cursorPosition = Math.min(
              state.cursorPosition + 1,
              state.text.length
            );
            break;
          case Key.Backspace:
            state.text =
              state.text.substr(0, state.cursorPosition - 1) +
              state.text?.substr(state.cursorPosition);
            state.cursorPosition--;
            break;
          case Key.Enter:
            text = state.text;
            set(state.text);
            state.text = undefined;
            this.blurControl(id);

            break;
          default: {
            const char = Keyboard.Default.charOf(key, this.isShiftKeyPressed());

            if (char.length) {
              state.text =
                state.text.substr(0, state.cursorPosition) +
                char +
                state.text?.substr(state.cursorPosition);
              state.cursorPosition += char.length;
            }
          }
        }
      }

      if (state.text !== undefined) {
        text =
          state.text.substr(0, state.cursorPosition) +
          "|" +
          state.text?.substr(state.cursorPosition);
      }
    } else {
      state.text = undefined;
      text = currentValue;
    }

    this.text({
      text: text || currentValue,
      x: x + this.style.padding.medium,
      y: y + this.style.padding.medium,
      font,
    });

    return { height: h, width: w };
  }

  numericProperty({
    id,
    name,
    get,
    set,
    x,
    y,
    w,
    multiplier = 1,
    multiplierSymbol,
  }: {
    id: string;
    name: string;
    get: () => number;
    set: (v: number) => void;
    x: number;
    y: number;
    w: number;
    multiplier?: number;
    multiplierSymbol?: string;
  }): GUIVerticalDimension {
    const textHeight =
      this.text({
        text: name,
        x,
        y: y + this.style.padding.medium,
      }).height + this.style.padding.medium;

    if (multiplierSymbol) {
      this.text({
        text: multiplierSymbol,
        x,
        y: y + this.style.padding.medium,
        w: w / 2 - this.style.padding.medium,
        align: "right",
      });
    }

    const valueHeight = this.field({
      id: `${id}.field`,
      get: () => get() / multiplier,
      set: (v: any) => set(parseFloat(v) * multiplier),
      x: x + w / 2,
      y,
      w: w / 2,
      font: this.style.font.numeric,
    }).height;

    return { height: Math.max(textHeight, valueHeight), width: w };
  }

  dropdown<T>({
    id,
    x,
    y,
    w,
    items,
    onSelect,
    render,
    getChildren,
    getId = (value, index) => index.toString(),
    selected,
    font = this.style.font.regular,
    dropdownWidth = w,
  }: {
    id: string;
    x: number;
    y: number;
    w: number;
    items: T[];
    onSelect: (result: T) => void;
    render: (item: T) => string;
    getChildren: (item: T) => T[];
    getId?: (item: T, index: number) => string;
    selected?: T;
    font?: CompatFont;
    dropdownWidth?: number;
  }): GUIVerticalDimension {
    const state = this.stateful<DropdownControlState>(id, {
      type: "dropdown",
      focused: false,
    });

    const h = font.height + this.style.padding.medium * 2;

    if (this.mouseClicked(x, y, w, h)) {
      this.focusControl(id);

      this.openDropdown<T>({
        items,
        render,
        getChildren,
        getId,
        selected,
        opener: { x, y, w, h },
        dropdownWidth,
      })
        .then((value) => {
          if (value) {
            onSelect(value);
          }
        })
        .catch((e) => {
          SSj.log(e);
        });
    }

    if (state.focused) {
      Prim.drawSolidRectangle(
        this.target,
        x,
        y,
        w,
        h,
        this.style.color.fieldColorFocused
      );
    } else if (this.mouseIntersects(x, y, w, h)) {
      Prim.drawSolidRectangle(
        this.target,
        x,
        y,
        w,
        h,
        this.style.color.fieldColorHover
      );
    } else {
      Prim.drawSolidRectangle(
        this.target,
        x,
        y,
        w,
        h,
        this.style.color.fieldColorInactive
      );
    }

    Prim.drawRectangle(
      this.target,
      x,
      y,
      w,
      h,
      2,
      this.style.color.fieldBorderColor
    );

    const text = selected ? render(selected) : "Select...";

    this.text({
      text,
      x: x + this.style.padding.medium,
      y: y + this.style.padding.medium,
      font,
    });

    return { height: h, width: w };
  }

  dropdownProperty<T>({
    id,
    name,
    x,
    y,
    w,
    items,
    onSelect,
    render,
    getChildren = () => [],
    getId,
    selected,
    dropdownWidth,
  }: {
    id: string;
    name: string;
    x: number;
    y: number;
    w: number;
    items: T[];
    onSelect: (result: T) => void;
    render: (item: T) => string;
    getChildren?: (item: T) => T[];
    getId?: (item: T, index: number) => string;
    selected?: T;
    dropdownWidth?: number;
  }): GUIVerticalDimension {
    const textHeight =
      this.text({
        text: name,
        x,
        y: y + this.style.padding.medium,
      }).height + this.style.padding.medium;

    const valueHeight = this.dropdown({
      id: `${id}.dropdown`,
      x: x + w / 2,
      y,
      w: w / 2,
      font: this.style.font.regular,
      items,
      onSelect,
      render,
      getChildren,
      getId,
      selected,
      dropdownWidth,
    }).height;

    return { height: Math.max(textHeight, valueHeight), width: w };
  }

  stringProperty({
    id,
    name,
    get,
    set,
    x,
    y,
    w,
  }: {
    id: string;
    name: string;
    get: () => string;
    set: (v: string) => void;
    x: number;
    y: number;
    w: number;
  }): GUIVerticalDimension {
    const textHeight =
      this.text({
        text: name,
        x,
        y: y + this.style.padding.medium,
      }).height + this.style.padding.medium;

    const valueHeight = this.field({
      id: `${id}.field`,
      get,
      set: (v: any) => set(v),
      x: x + w / 2,
      y,
      w: w / 2,
    }).height;

    return { height: Math.max(textHeight, valueHeight), width: w };
  }

  treeItem<T>({
    id,
    parentId,
    item,
    x,
    y,
    w,
    font,
    render,
    getChildren,
    onSelect,
    getId = (value, index) => index.toString(),
    selected,
    expanded,
  }: {
    id: string;
    parentId: string;
    item: T;
    font?: CompatFont;
    x: number;
    y: number;
    w: number;
    selected?: T;
    expanded: string[];
    render: (value: T) => string;
    getChildren: (value: T) => T[];
    onSelect: (value: T) => void;
    getId?: (value: T, index: number) => string;
  }): GUIVerticalDimension {
    let height = 0;

    const itemHeight =
      this.style.font.regular.height + this.style.padding.small * 2;

    const buttonWidth = 16;

    const children = getChildren(item);

    const hasExpandButton = children.length > 0 ? true : false;

    const labelX = x + buttonWidth + this.style.padding.small;
    const labelW = w - buttonWidth - this.style.padding.small;

    const isExpanded = expanded.includes(id);

    if (item === selected) {
      Prim.drawSolidRectangle(
        this.target,
        labelX,
        y,
        labelW,
        itemHeight,
        this.style.color.listItemColorSelected
      );
    }

    if (
      hasExpandButton &&
      this.mouseIntersects(x, y, buttonWidth, itemHeight)
    ) {
      Prim.drawSolidRectangle(
        this.target,
        x,
        y + (itemHeight - buttonWidth) / 2,
        buttonWidth,
        buttonWidth,
        this.style.color.listItemColorActive
      );
    } else if (this.mouseIntersects(labelX, y, labelW, itemHeight)) {
      Prim.drawSolidRectangle(
        this.target,
        labelX,
        y,
        labelW,
        itemHeight,
        this.style.color.listItemColorActive
      );
    }

    this.text({
      text: render(item),
      x: labelX + this.style.padding.small,
      y: y + this.style.padding.small,
      w: labelW - this.style.padding.small,
      font,
    }).height;

    if (hasExpandButton) {
      Prim.drawRectangle(
        this.target,
        x,
        y + (itemHeight - buttonWidth) / 2,
        buttonWidth,
        buttonWidth,
        2,
        this.style.color.fieldBorderColor
      );

      const innerPadding = buttonWidth / 4;
      Prim.drawLine(
        this.target,
        x + innerPadding,
        y + itemHeight / 2,
        x + buttonWidth - innerPadding,
        y + itemHeight / 2,
        2,
        this.style.color.fieldBorderColor
      );
      if (!isExpanded) {
        Prim.drawLine(
          this.target,
          x + buttonWidth / 2,
          y + (itemHeight - buttonWidth) / 2 + innerPadding,
          x + buttonWidth / 2,
          y + (itemHeight + buttonWidth) / 2 - innerPadding,
          2,
          this.style.color.fieldBorderColor
        );
      }
    }

    if (this.mouseClicked(labelX, y, labelW, itemHeight)) {
      this.focusControl(parentId);
      onSelect(item);
    } else if (
      hasExpandButton &&
      this.mouseClicked(x, y, buttonWidth, itemHeight)
    ) {
      if (isExpanded) {
        expanded.splice(expanded.indexOf(id), 1);
      } else {
        expanded.push(id);
      }
    }

    height += itemHeight;

    if (isExpanded) {
      const childrenTop = y + height;
      let lastChildTop = y + height;

      for (let i = 0; i < children.length; i++) {
        lastChildTop = y + height;

        Prim.drawLine(
          this.target,
          x + buttonWidth / 2,
          y + height + itemHeight / 2,
          x + buttonWidth + this.style.padding.small,
          y + height + itemHeight / 2,
          2,
          this.style.color.fieldBorderColor
        );

        height += this.treeItem<T>({
          id: `${id}.${getId(children[i], i)}`,
          x: labelX,
          y: y + height,
          w: labelW,
          render,
          getChildren,
          getId,
          item: children[i],
          onSelect,
          selected,
          expanded,
          parentId,
        }).height;
      }

      Prim.drawLine(
        this.target,
        x + buttonWidth / 2,
        childrenTop - (itemHeight - buttonWidth) / 2,
        x + buttonWidth / 2,
        lastChildTop + itemHeight / 2,
        2,
        this.style.color.fieldBorderColor
      );
    }

    return { height: height, width: w };
  }

  tree<T>({
    id,
    items,
    font,
    onSelect,
    render,
    getChildren,
    getId = (value, index) => index.toString(),
    x,
    y,
    w,
    h,
    selected,
  }: {
    id: string;
    items: T[];
    font?: CompatFont;
    onSelect: (value: T) => void;
    render: (value: T) => string;
    getChildren: (value: T) => T[];
    getId?: (value: T, index: number) => string;
    x: number;
    y: number;
    w: number;
    h: number;
    selected?: T;
  }): GUIVerticalDimension {
    const state = this.stateful<TreeControlState>(id, {
      type: "tree",
      focused: false,
      expanded: [],
    });

    this.panel({
      id: `${id}._panel`,
      x,
      y,
      w,
      h,
      color: this.style.color.listColorInactive,
      children: items.map((item, index) => (position) =>
        this.treeItem({
          id: `${id}.${getId(item, index)}`,
          parentId: id,
          ...position,
          render,
          getChildren,
          getId,
          onSelect,
          font,
          selected,
          item,
          expanded: state.expanded,
        })
      ),
    });
    return { height: h, width: w };
  }

  list<T>({
    id,
    font,
    items,
    onSelect,
    render,
    x,
    y,
    w,
    h,
    selected,
  }: {
    id: string;
    items: T[];
    font?: CompatFont;
    onSelect: (value: T) => void;
    render: (value: T) => string;
    x: number;
    y: number;
    w: number;
    h: number;
    selected?: T;
  }): GUIVerticalDimension {
    return this.tree({
      id,
      items,
      font,
      onSelect,
      render,
      getChildren: () => [],
      getId: (item) => Object.prototype.toString.call(item),
      x,
      y,
      w,
      h,
    });
  }

  checkbox({
    id,
    label,
    get,
    set,
    x,
    y,
    w,
    h = Math.min(16, this.style.font.regular.height),
  }: {
    id: string;
    label: string;
    get: () => boolean;
    set: (value: boolean) => void;
    x: number;
    y: number;
    w: number;
    h?: number;
  }): GUIVerticalDimension {
    const value = get();
    const textSize = this.style.font.regular.getTextSize(label, w);
    const checkboxHeight = Math.floor(textSize.height * 0.6);
    const height = Math.max(checkboxHeight, textSize.height);

    const state = this.stateful<CheckboxControlState>(id, {
      type: "checkbox",
      focused: false,
    });

    if (this.mouseClicked(x, y, w, height)) {
      this.focusControl(id);

      set(!value);
    }

    const hover = this.mouseIntersects(x, y, w, height);

    if (state.focused) {
      Prim.drawSolidRectangle(
        this.target,
        x,
        y + (height - checkboxHeight) / 2,
        checkboxHeight,
        checkboxHeight,
        this.style.color.checkboxColorFocused
      );
    } else if (hover) {
      Prim.drawSolidRectangle(
        this.target,
        x,
        y + (height - checkboxHeight) / 2,
        checkboxHeight,
        checkboxHeight,
        this.style.color.checkboxColorHover
      );
    } else {
      Prim.drawSolidRectangle(
        this.target,
        x,
        y + (height - checkboxHeight) / 2,
        checkboxHeight,
        checkboxHeight,
        this.style.color.checkboxColorInactive
      );
    }

    // const dotMargin = Math.floor(h * 0.2);

    if (value) {
      Prim.drawSolidRectangle(
        this.target,
        x + 3,
        y + (height - checkboxHeight) / 2 + 3,
        checkboxHeight - 6,
        checkboxHeight - 6,
        this.style.color.textColor
      );
    }

    this.text({
      text: label,
      x: x + h + this.style.padding.medium,
      y,
      w: w - (h + this.style.padding.medium),
      color: this.style.color.textColor,
    });

    return { height: height, width: w };
  }

  private directoryCache: Record<string, string[]> = {};

  getFileDropdownProps({
    directory,
    onSelect,
    filesOnly = true,
  }: {
    directory: string;
    onSelect: (entry: string) => void;
    filesOnly?: boolean;
  }) {
    const getItems = (path: string) => {
      if (this.directoryCache[path] === undefined) {
        if (FS.directoryExists(path)) {
          const entries = Array.from(new DirectoryStream(path)).map(
            (entry) => entry.fullPath
          );

          this.directoryCache[path] = entries;
        } else {
          this.directoryCache[path] = [];
        }
      }

      return this.directoryCache[path];
    };

    return {
      items: getItems(directory),
      render: (entry: string) =>
        entry.split("/").pop() ||
        entry
          .substr(0, entry.length - 1)
          .split("/")
          .pop()!,
      getId: (entry: string) => entry,
      onSelect: (entry: string) => {
        if (!filesOnly || !FS.directoryExists(entry)) {
          onSelect(entry);
        }
      },
      getChildren: (entry: string) => getItems(entry),
    };
  }
}
