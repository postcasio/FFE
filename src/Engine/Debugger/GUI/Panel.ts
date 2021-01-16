import { DropdownCallback, GUI } from "./GUI";

export type PanelParams = Record<string, unknown>;
export type PanelState = Record<string, unknown>;

export class Panel<
  P extends PanelParams = PanelParams,
  S extends PanelState = PanelState
> {
  x: number;
  y: number;
  w: number;
  h: number;

  surface: Surface;

  gui: GUI;
  params: P;
  state: S;

  type = "none";

  isModal() {
    return false;
  }

  getInitialState(): S {
    return {} as S;
  }

  constructor(
    x: number,
    y: number,
    w: number,
    h: number,
    dropdown: DropdownCallback<unknown>,
    params: P
  ) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.surface = new Surface(w, h, Color.Black);
    this.surface.blendOp = new BlendOp(
      BlendType.Add,
      Blend.Alpha,
      Blend.AlphaInverse, // (s.rgb * s.a) + (d.rgb * (1 - s.a)) = standard alpha blend
      BlendType.Add,

      Blend.Zero, // (1 * s.a) + (0 * d.a) = copy src alpha to dest
      Blend.One
    );
    this.gui = new GUI(this.surface, this.isModal(), dropdown);
    this.params = params;
    this.state = this.getInitialState();
  }

  renderChildren(): void {
    // override in subclass
  }

  render(canAcceptInput: boolean) {
    this.surface.clear(Color.Black, 1.0);
    this.gui.begin(this.surface, this.x, this.y, canAcceptInput);

    this.renderChildren();

    this.gui.end();
  }

  getSurface() {
    return this.surface;
  }

  contains(x: number, y: number): boolean {
    return (
      x >= this.x && x <= this.x + this.w && y >= this.y && y <= this.y + this.h
    );
  }
}
