export enum MouseEventType {
  Button,
  Wheel,
}

export class MouseEvents {
  events: MouseEvent[] = [];

  consumeEvents() {
    let event;
    while ((event = Mouse.Default.getEvent()).key) {
      this.events.push(event);
    }
  }

  discardEvents() {
    this.events = [];
  }

  getEvent(...types: MouseEventType[]): MouseEvent | undefined {
    if (types.length === 0) {
      return this.events.shift();
    }

    const picked = this.events.find((event) =>
      types.includes(this.typeOf(event))
    );
    this.events = this.events.filter((event) => event !== picked);

    return picked;
  }

  typeOf(event: MouseEvent): MouseEventType {
    return event.key === MouseKey.WheelDown || event.key === MouseKey.WheelUp
      ? MouseEventType.Wheel
      : MouseEventType.Button;
  }
}
