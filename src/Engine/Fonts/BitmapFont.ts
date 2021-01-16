import parse from "parse-bmfont-ascii";

interface Character {
  id: number;
  texture: Texture;
  xadvance: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: Shape;
  xoffset: number;
  yoffset: number;
}

function createTriStripList(
  w: number,
  h: number,
  x: number,
  y: number,
  mask: Color = Color.White
) {
  return new VertexList([
    { x: 0, y: 0, u: x, v: 1 - y, color: mask },
    { x: 1, y: 0, u: x + w, v: 1 - y, color: mask },
    { x: 0, y: 1, u: x, v: 1 - (y + h), color: mask },
    { x: 1, y: 1, u: x + w, v: 1 - (y + h), color: mask },
  ]);
}

function createShape(
  texture: Texture,
  w: number,
  h: number,
  x: number,
  y: number,
  mask: Color = Color.White
) {
  return new Shape(
    ShapeType.TriStrip,
    texture,
    createTriStripList(
      w / texture.width,
      h / texture.height,
      x / texture.width,
      y / texture.height,
      mask
    )
  );
}

type CharacterCollection = Record<number, Character>;

export interface BitmapFontOptions {
  distanceField?: boolean;
}

let distanceFieldShader: Shader;

class BitmapFont implements Font {
  fileName: string;
  height: number;
  characters: CharacterCollection = {};
  textures: Texture[];
  base: number;
  spacing: [number, number];
  padding: [number, number, number, number];
  distanceField: boolean;

  constructor(path: string, { distanceField }: BitmapFontOptions = {}) {
    this.distanceField = distanceField || false;
    if (distanceField) {
      distanceFieldShader = new Shader({
        vertexFile: "@/gfx/shader/distanceFieldShader/distanceFieldShader.vert",
        fragmentFile:
          "@/gfx/shader/distanceFieldShader/distanceFieldShader.frag",
      });
    }
    const data = parse(FS.readFile(path));
    this.fileName = path;
    const dir = FS.directoryOf(path);
    this.textures = data.pages.map((page) => new Texture(dir + "/" + page));

    this.spacing = data.info.spacing;
    this.height = data.common.lineHeight;
    this.base = data.common.base;
    this.padding = data.info.padding;
    this.characters = data.chars.reduce((chars: CharacterCollection, char) => {
      chars[char.id] = Object.assign(Object.assign({}, char), {
        texture: this.textures[char.page],
        shape: createShape(
          this.textures[char.page],
          char.width,
          char.height,
          char.x,
          char.y
        ),
      });
      return chars;
    }, {});
  }

  drawText(
    surface: Surface,
    x: number,
    y: number,
    text: string,
    color?: Color,
    wrap_width?: number,
    scale = 1
  ): void {
    let currentX = x;

    let currentY = y;
    const transform = new Transform();
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      if (charCode === 10) {
        currentX = x;
        currentY += this.height;
        continue;
      }
      const char = this.characters[charCode];
      if (!char) {
        continue;
      }
      if (i === 0) {
        // this should be new line?
        // currentX -= char.xoffset;
      }
      if (char.id >= 33) {
        transform.identity();
        transform.scale(char.width * scale, char.height * scale);
        transform.translate(
          currentX + char.xoffset * scale,
          currentY + char.yoffset * scale
        );
        if (this.distanceField) {
          const model = new Model([char.shape], distanceFieldShader);
          model.transform = transform;
          model.draw(surface);
        } else {
          char.shape.draw(surface, transform);
        }
      }
      currentX += char.xadvance * scale;
      if (wrap_width && currentX >= wrap_width + x) {
        currentX = x;
        currentY += (this.height + this.spacing[1]) * scale;
      }
    }
  }

  getTextSize(text: string, wrap?: number) {
    let currentX = 0;
    let currentY = 0;
    let maxX = 0;
    let maxH = 0;
    let char;
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      if (charCode === 10) {
        maxX = Math.max(currentX, maxX);
        currentX = 0;
        currentY += this.height;
        maxH = 0;
        continue;
      }

      char = this.characters[charCode];

      if (!char) {
        continue;
      }

      maxH = Math.max(char.height + char.yoffset, maxH);

      if (wrap && currentX + char.xoffset + char.width >= wrap) {
        maxX = Math.max(currentX + char.xadvance, maxX);
        currentX = 0;
        currentY += this.height;
        maxH = 0;
      } else {
        currentX += char.xadvance;
      }
    }
    return {
      width: Math.max(currentX, maxX) + this.padding[0] + this.padding[2],
      height: currentY + Math.max(maxH, this.height),
    };
  }
  heightOf(text: string, wrap?: number): number {
    return wrap ? this.getTextSize(text, wrap).height : this.height;
  }
  widthOf(text: string): number {
    return this.getTextSize(text).width;
  }
  wordWrap(text: string, wrapWidth: number): string[] {
    const currentX = 0;
    let currentLine = "";
    const lines = [];
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      if (charCode === 10) {
        lines.push(currentLine);
        currentLine = "";
        continue;
      }
      const char = this.characters[charCode];
      if (!char) {
        continue;
      }
      currentLine += text.substr(i, 1);
      if (currentX >= wrapWidth) {
        lines.push(currentLine);
        currentLine = "";
      }
    }
    lines.push(currentLine);
    return lines;
  }
}

export default BitmapFont;
