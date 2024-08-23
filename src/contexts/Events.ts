type EventCallback = () => void;

class EventEmitter {
  private events: { [key: string]: EventCallback[] } = {};

  subscribe(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  unsubscribe(event: string, callback: EventCallback) {
    if (!this.events[event]) return;

    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }

  emit(event: string) {
    if (!this.events[event]) return;

    this.events[event].forEach(callback => callback());
  }
}

export const Events = new EventEmitter();
