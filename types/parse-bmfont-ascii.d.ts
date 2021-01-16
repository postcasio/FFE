declare module "parse-bmfont-ascii" {
  function parse(
    data: string
  ): {
    pages: string[];
    chars: {
      chnl: number;
      height: number;
      id: number;
      page: number;
      width: number;
      x: number;
      y: number;
      xoffset: number;
      yoffset: number;
      xadvance: number;
    }[];
    info: {
      face: string;
      size: number;
      bold: number;
      italic: number;
      charset: string;
      unicode: number;
      stretchH: number;
      smooth: number;
      aa: number;
      padding: [number, number, number, number];
      spacing: [number, number];
    };
    common: {
      lineHeight: number;
      base: number;
      scaleW: number;
      scaleH: number;
      pages: number;
      packed: number;
    };
    kernings: any;
  };

  export = parse;
}
