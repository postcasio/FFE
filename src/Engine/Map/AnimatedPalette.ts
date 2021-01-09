import { Slice } from "../Data/ROM";
import { Game } from "../Game";
import { RGB555Color } from "../Graphics/Palette";
import { PaletteSet } from "../Graphics/PaletteSet";

enum PaletteAnimationType {
  None = 0,
  Cycle = 1,
  ROM = 2,
  SubtractPulse = 3,
}

const subtractPulseMultipliers = [
  0x70,
  0x80,
  0x90,
  0xa0,
  0xb0,
  0xc0,
  0xd0,
  0xe0,
  0xf0,
  0xe0,
  0xd0,
  0xc0,
  0xb0,
  0xa0,
  0x90,
  0x80,
  0x70,
  0x60,
];

interface CyclePaletteAnimation {
  type: PaletteAnimationType.Cycle;
  counter1Value: number;
  counter1ResetValue: number;
  counter2Value: number;
  counter2ResetValue: number;
  firstColorPointer: number;
  affectedColors: number;
}

interface ROMPaletteAnimation {
  type: PaletteAnimationType.ROM;
  counter1Value: number;
  counter1ResetValue: number;
  counter2Value: number;
  counter2ResetValue: number;
  firstColorPointer: number;
  affectedColors: number;
  colorIndex: number;
}

interface SubtractPulsePaletteAnimation {
  type: PaletteAnimationType.SubtractPulse;
  counter1Value: number;
  counter1ResetValue: number;
  counter2Value: number;
  counter2ResetValue: number;
  firstColorPointer: number;
  affectedColors: number;
}

type PaletteAnimation =
  | CyclePaletteAnimation
  | ROMPaletteAnimation
  | SubtractPulsePaletteAnimation;

export class AnimatedPalette {
  offset: number;
  animations: PaletteAnimation[];
  paletteSet: PaletteSet;
  originalPaletteSet: PaletteSet;
  everyOtherFrame = false;
  animationPaletteSet: PaletteSet;

  constructor(slice: Slice, paletteSet: PaletteSet) {
    this.offset = slice.offset;
    this.paletteSet = paletteSet;
    this.originalPaletteSet = paletteSet.clone();
    this.animationPaletteSet = new PaletteSet(
      Game.current.rom.getMapPaletteAnimationPaletteSetSlice(),
      16
    );

    this.animations = [];
    for (let i = 0; i < 2; i++) {
      const animOffset = i * 6;
      const type = ((slice.data[animOffset] & 0xf0) >>
        4) as PaletteAnimationType;
      const counter1ResetValue = slice.data[animOffset + 1];
      const counter2ResetValue = slice.data[animOffset] & 0x0f;
      const firstColorPointer = slice.data[animOffset + 2] / 2;

      switch (type) {
        case PaletteAnimationType.Cycle: {
          const affectedColors = slice.data[animOffset + 3] / 2 + 1;

          this.animations.push({
            type,
            counter1Value: 0,
            counter2Value: 0,
            counter1ResetValue,
            counter2ResetValue,
            firstColorPointer,
            affectedColors,
          });

          break;
        }
        case PaletteAnimationType.ROM: {
          const affectedColors = slice.data[animOffset + 3] / 2 + 1;

          this.animations.push({
            type,
            counter1Value: 0,
            counter2Value: 0,
            counter1ResetValue,
            counter2ResetValue,
            firstColorPointer,
            affectedColors,
            colorIndex:
              (slice.data[animOffset + 4] | (slice.data[animOffset + 5] << 8)) /
              2,
          });

          break;
        }
        case PaletteAnimationType.SubtractPulse: {
          const affectedColors = slice.data[animOffset + 3] / 2 + 1;

          this.animations.push({
            type,
            counter1Value: 0,
            counter2Value: 0,
            counter1ResetValue,
            counter2ResetValue,
            firstColorPointer,
            affectedColors,
          });

          break;
        }
      }
    }
  }

  update() {
    // if (this.everyOtherFrame) {
    for (const animation of this.animations) {
      switch (animation.type) {
        case PaletteAnimationType.SubtractPulse:
          this.updateSubtractPulse(animation);
          break;
        case PaletteAnimationType.Cycle:
          this.updateCycle(animation);
          break;
        case PaletteAnimationType.ROM:
          this.updateROM(animation);
          break;
      }
    }
    //   this.everyOtherFrame = false;
    // }
    // else {
    //   this.everyOtherFrame = true;
    // }
  }

  private updateCounters(animation: PaletteAnimation) {
    if (++animation.counter1Value >= animation.counter1ResetValue) {
      animation.counter1Value = 0;
      if (++animation.counter2Value >= animation.counter2ResetValue) {
        animation.counter2Value = 0;

        return false;
      }
    }

    return true;
  }

  private updateSubtractPulse(animation: SubtractPulsePaletteAnimation) {
    this.updateCounters(animation);

    for (let i = 0; i < animation.affectedColors; i++) {
      const colorIndex = animation.firstColorPointer + i;

      const paletteIndex = Math.floor(
        colorIndex / this.paletteSet.colorsPerPalette
      );
      const paletteColorIndex = colorIndex % this.paletteSet.colorsPerPalette;

      const color = this.originalPaletteSet.palettes[paletteIndex].getRGB555(
        paletteColorIndex
      );

      const multiplier = subtractPulseMultipliers[animation.counter2Value];

      this.paletteSet.palettes[paletteIndex].setRGB555(
        paletteColorIndex,
        ((color.r * multiplier) >> 8) & 0x1f,
        ((color.g * multiplier) >> 8) & 0x1f,
        ((color.b * multiplier) >> 8) & 0x1f
      );
    }
  }

  private updateCycle(animation: CyclePaletteAnimation) {
    if (this.updateCounters(animation)) {
      return;
    }

    const colors: RGB555Color[] = [];

    for (let i = 0; i < animation.affectedColors; i++) {
      const colorIndex = animation.firstColorPointer + i;
      const paletteIndex = Math.floor(
        colorIndex / this.paletteSet.colorsPerPalette
      );
      const paletteColorIndex = colorIndex % this.paletteSet.colorsPerPalette;

      colors.push({
        ...this.paletteSet.palettes[paletteIndex].getRGB555(paletteColorIndex),
      });
    }

    colors.push(colors.shift()!);

    for (let i = 0; i < colors.length; i++) {
      const colorIndex = animation.firstColorPointer + i;
      const paletteIndex = Math.floor(
        colorIndex / this.paletteSet.colorsPerPalette
      );
      const paletteColorIndex = colorIndex % this.paletteSet.colorsPerPalette;

      this.paletteSet.palettes[paletteIndex].setRGB555(
        paletteColorIndex,
        colors[i].r,
        colors[i].g,
        colors[i].b
      );
    }
  }

  updateROM(animation: ROMPaletteAnimation) {
    this.updateCounters(animation);

    const firstROMColorIndex =
      animation.counter2Value * this.animationPaletteSet.colorsPerPalette +
      animation.colorIndex;

    for (let i = 0; i < animation.affectedColors; i++) {
      const romColorIndex = firstROMColorIndex + i;
      const romPaletteIndex = Math.floor(
        romColorIndex / this.animationPaletteSet.colorsPerPalette
      );
      const romPaletteColorIndex =
        romColorIndex % this.animationPaletteSet.colorsPerPalette;

      const color = this.animationPaletteSet.palettes[
        romPaletteIndex
      ].getRGB555(romPaletteColorIndex);

      const colorIndex = animation.firstColorPointer + i;
      const paletteIndex = Math.floor(
        colorIndex / this.paletteSet.colorsPerPalette
      );
      const paletteColorIndex = colorIndex % this.paletteSet.colorsPerPalette;

      this.paletteSet.palettes[paletteIndex].setRGB555(
        paletteColorIndex,
        color.r,
        color.g,
        color.b
      );
    }
  }
}
