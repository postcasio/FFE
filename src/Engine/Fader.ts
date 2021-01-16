import Prim from "prim";

export enum FadingDirection {
  In,
  Out,
}

export class Fader {
  fading = false;
  pendingFade = false;

  fadingDirection: FadingDirection = FadingDirection.In;
  fadingStarted = 0;
  fadingEnds = 0;

  fadingPromise?: Promise<void>;
  fadingResolve?: () => void;
  fadingReject?: () => void;

  color: Color = new Color(0, 0, 0, 1);

  callbacksOnDidFinish: Array<() => void> = [];

  surface: Surface;
  shape: Shape;
  model!: Model;

  constructor(surface: Surface) {
    this.surface = surface;
    const w = 256;
    const h = 224;
    this.shape = new Shape(
      ShapeType.TriStrip,
      null,
      new VertexList([
        { x: 0, y: 0, u: 0, v: 1 },
        { x: w, y: 0, u: 1, v: 1 },
        { x: 0, y: h, u: 0, v: 0 },
        { x: w, y: h, u: 1, v: 0 },
      ])
    );
  }

  async initialize() {
    this.model = new Model(
      [this.shape],
      await Shader.fromFiles({
        fragmentFile: "@/assets/shaders/fader/fader.frag",
        vertexFile: "@/assets/shaders/fader/fader.vert",
      })
    );
  }

  fade(direction: FadingDirection, speed: number) {
    this.fadingDirection = direction;
    this.fadingStarted = Sphere.now();
    this.fadingEnds = this.fadingStarted + (1 / speed) * 240;
    this.fading = true;
    this.fadingPromise = new Promise((res, rej) => {
      this.fadingResolve = res;
      this.fadingReject = rej;
    });
    return this.fadingPromise;
  }

  update() {
    if (!this.fading) {
      return;
    }

    const now = Sphere.now();

    if (now >= this.fadingEnds) {
      this.color.a = this.fadingDirection === FadingDirection.In ? 0 : 1;

      for (const callback of this.callbacksOnDidFinish) {
        callback();
      }

      this.callbacksOnDidFinish = [];

      this.fadingResolve?.();

      this.fading = false;
    } else {
      this.color.a =
        (Sphere.now() - this.fadingStarted) /
        (this.fadingEnds - this.fadingStarted);

      if (this.fadingDirection === FadingDirection.In) {
        this.color.a = 1 - this.color.a;
      }
    }
  }

  render() {
    if (!this.model || !this.model.shader) {
      return;
    }
    this.model.shader.setColorVector("mask", this.color);
    this.model.draw(this.surface);
    // Prim.drawSolidRectangle(
    //   this.surface,
    //   0,
    //   0,
    //   this.surface.width,
    //   this.surface.height,
    //   this.color
    // );
  }

  onDidFinish(callback: () => void) {
    this.callbacksOnDidFinish.push(callback);
  }
}
