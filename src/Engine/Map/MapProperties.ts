import { LayerEffectsFlags } from "./LayerEffectsFlags";
import { Slice } from "@/src/Engine/Data/ROM";
import { signed8 } from "@/src/Engine/utils";

const dimensionLookup = [16, 32, 64, 128];

export class MapProperties {
  data: Uint8Array;
  offset: number;
  view: DataView;

  constructor(slice: Slice) {
    this.data = slice.data;
    this.offset = slice.offset;
    this.view = new DataView(slice.data.buffer);
  }

  get mapNameIndex() {
    return this.data[0x00];
  }

  get graphicset1Index() {
    return this.view.getUint32(0x07, true) & 0x7f;
  }

  get graphicset2Index() {
    return (this.view.getUint32(0x07, true) & 0x3f80) >> 7;
  }

  get graphicset3Index() {
    return (this.view.getUint32(0x07, true) & 0x1fc000) >> 14;
  }

  get graphicset4Index() {
    return (this.view.getUint32(0x07, true) & 0xfe00000) >> 21;
  }

  get animatedTilesetIndex() {
    return this.data[0x1b] & 0x1f;
  }

  get layer1() {
    return {
      width: dimensionLookup[(this.data[0x17] & 0xc0) >> 6],
      height: dimensionLookup[(this.data[0x17] & 0x30) >> 4],
      layoutIndex: this.view.getUint32(0x0d, true) & 0x3ff,
      // tilesetIndex: ((this.data[0x0B] & 0x1)) | ((this.data[0x0C] & 0xFC) >> 1),
      tilesetIndex: (this.view.getUint32(0x0b, true) & 0x01fc) >> 2,
      tilePropertiesIndex: this.data[0x04],
      spriteOverlayIndex: this.data[0x11],
      wavyEffect: (this.data[0x01] & LayerEffectsFlags.WavyBG1) !== 0,
    };
  }

  get layer2() {
    return {
      width: dimensionLookup[(this.data[0x17] & 0x0c) >> 2],
      height: dimensionLookup[this.data[0x17] & 0x03],
      layoutIndex: (this.view.getUint32(0x0d, true) & 0xffc00) >> 10,
      tilesetIndex: (this.data[0x0c] & 0xfe) >> 1,
      wavyEffect: (this.data[0x01] & LayerEffectsFlags.WavyBG2) !== 0,
      shiftX: signed8(this.data[0x12]),
      shiftY: signed8(this.data[0x13]),
    };
  }

  get layer3() {
    return {
      width: dimensionLookup[(this.data[0x18] & 0xc0) >> 6],
      height: dimensionLookup[(this.data[0x18] & 0x30) >> 4],
      layoutIndex: (this.view.getUint32(0x0d, true) & 0x3ff00000) >> 20,
      wavyEffect: (this.data[0x01] & LayerEffectsFlags.WavyBG3) !== 0,
      shiftX: signed8(this.data[0x14]),
      shiftY: signed8(this.data[0x15]),
      animatedTilesetIndex: (this.data[0x1b] & 0xe0) >> 5,
      graphicset: (this.view.getUint16(0x0a, true) & 0x03f0) >> 4,
      priority: (this.data[0x02] & 0x80) !== 0,
    };
  }

  get paletteIndex() {
    return this.data[0x19];
  }

  get mapParallaxIndex() {
    return this.data[0x16];
  }

  get paletteAnimationIndex() {
    return this.data[0x1a];
  }

  get colorMathIndex() {
    return this.data[0x20];
  }
}
