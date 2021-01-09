export enum LayerType {
  BG1 = 1,
  BG2 = 2,
  BG12 = 3,
  BG3 = 4,
}

export interface Layer {
  type: LayerType;

  shiftX: number;
  shiftY: number;

  parallaxSpeedX: number;
  parallaxSpeedY: number;
  parallaxMultiplierX: number;
  parallaxMultiplierY: number;

  dirty: boolean;

  render(force: boolean): void;

  drawLowPriority(
    target: Surface,
    x: number,
    y: number,
    w: number,
    h: number,
    cameraX: number,
    cameraY: number
  ): void;

  drawHighPriority(
    target: Surface,
    x: number,
    y: number,
    w: number,
    h: number,
    cameraX: number,
    cameraY: number
  ): void;
}
