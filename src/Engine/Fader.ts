import Prim from "prim";

export enum FadingDirection {
  In,
  Out,
}

export class Fader {
  fading = false;

  fadingDirection: FadingDirection = FadingDirection.In;
  fadingStarted = 0;
  fadingEnds = 0;

  color: Color = new Color(0, 0, 0, 1);

  callbacksOnDidFinish: Array<() => void> = [];

  surface: Surface;

  constructor(surface: Surface) {
    this.surface = surface;
  }

  fade(direction: FadingDirection, speed: number) {
    this.fadingDirection = direction;
    this.fadingStarted = Sphere.now();
    this.fadingEnds = this.fadingStarted + (1 / speed) * 240;
    this.fading = true;
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
    Prim.drawSolidRectangle(
      this.surface,
      0,
      0,
      this.surface.width,
      this.surface.height,
      this.color
    );
  }

  onDidFinish(callback: () => void) {
    this.callbacksOnDidFinish.push(callback);
  }
}
