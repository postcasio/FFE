export class Table {
  data: Record<number, string>;

  constructor(data: Record<number, string>) {
    this.data = data;
  }

  decode(value: number) {
    return this.data[value] || "?";
  }

  encode(value: string) {
    for (const [k, v] of Object.entries(this.data)) {
      if (v === value) {
        return Number(k);
      }
    }

    return 0;
  }

  static fromFile(path: string) {
    const table = FS.readFile(path, DataType.Lines).reduce((table, line) => {
      const hex = line.substr(0, line.indexOf("="));
      table[parseInt(hex, 16)] = line.substr(line.indexOf("=") + 1);

      return table;
    }, {} as Record<number, string>);

    return new Table(table);
  }
}
