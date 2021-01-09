import { Table } from "./Text/Table";
import { VariableWidthFont } from "./Fonts/VariableWidthFont";

interface Line {
  width: number;
  chars: number[];
  ascii: string;
}

const tbl = Table.fromFile("@/assets/tables/ff3us.tbl");

enum State {
  Idle,
  Writing,
}

export class TextWrap {
  state: State = State.Idle;
  lines: Line[] = [];
  maxWidth: number;
  frameCount = 0;
  callbacksOnDidFinish: Array<() => void> = [];
  characterIndex = 0;
  font: VariableWidthFont;

  constructor(font: VariableWidthFont, maxWidth: number) {
    this.maxWidth = maxWidth;
    this.font = font;
  }

  onDidFinish(callback: () => void) {
    this.callbacksOnDidFinish.push(callback);
  }

  createLine(): { width: number; chars: number[]; ascii: "" } {
    return {
      width: 0,
      chars: [],
      ascii: "",
    };
  }

  update(speed: number) {
    const totalChars = this.lines
      .map((line) => line.chars.length)
      .reduce((sum, val) => sum + val, 0);

    if (this.state === State.Writing && ++this.frameCount >= speed) {
      this.characterIndex++;

      if (this.characterIndex >= totalChars) {
        this.characterIndex = totalChars;

        if (this.state === State.Writing) {
          this.state = State.Idle;

          for (const onDidFinish of this.callbacksOnDidFinish) {
            onDidFinish();
          }

          this.callbacksOnDidFinish = [];
        }
      }

      this.frameCount = 0;
    }
  }

  render(surface: Surface, x: number, y: number) {
    let charsWritten = 0;
    for (let i = 0; i < this.lines.length; i++) {
      const line = this.lines[i];
      let offset = 0;

      for (let c = 0; c < line.chars.length; c++) {
        this.font.drawCharacter(surface, x + offset, y + i * 15, line.chars[c]);

        offset += this.font.getCharacterWidth(line.chars[c]);

        if (++charsWritten >= this.characterIndex) {
          return;
        }
      }
    }
  }

  clear() {
    this.characterIndex = 0;
    this.frameCount = 0;
    this.lines = [];
  }

  write(text: number[]) {
    this.frameCount = 0;
    this.state = State.Writing;

    let line;

    if (this.lines.length) {
      line = this.lines[this.lines.length - 1];
    } else {
      line = this.createLine();
      this.lines.push(line);
    }

    let i;

    for (i = 0; i < text.length; i++) {
      const character = text[i];

      if (character === 0x01) {
        if (this.lines.length === 4) {
          i++; // Don't include this newline in the rejected text
          break;
        }

        line = this.createLine();
        this.lines.push(line);
      }
      if (character >= 0x20) {
        const width = this.font.getCharacterWidth(character);

        if (line.width + width > this.maxWidth) {
          if (this.lines.length === 4) {
            break;
          }

          const previousLine = line;
          line = this.createLine();
          this.lines.push(line);

          if (character === 0x7f) {
            // If a space would cause a new line, don't output it.
            continue;
          } else {
            // Take the last word from the previous line
            const lastSpace = previousLine.chars.lastIndexOf(0x7f);

            if (
              lastSpace !== -1 &&
              lastSpace !== previousLine.chars.length - 1
            ) {
              // If there are no spaces, or the last space was the last character, do nothing. Otherwise...
              const word = previousLine.chars.splice(lastSpace + 1);
              const wordWidth = word
                .map(this.font.getCharacterWidth.bind(this.font))
                .reduce((s, w) => s + w, 0);
              line.chars.push(...word);

              previousLine.width -= wordWidth;
              line.width += wordWidth;
            }
          }
        }

        line.chars.push(character);
        line.ascii += tbl.decode(character);
        line.width += width;
      }
    }

    if (i < text.length) {
      return text.slice(i);
    }

    return [];
  }
}
