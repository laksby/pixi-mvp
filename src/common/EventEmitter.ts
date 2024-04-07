import { ActionMaybeAsync1 } from '../types';

export type EventPool<E extends object> = {
  [K in keyof E]: Set<ActionMaybeAsync1<E[K]>>;
};

export class EventEmitter<E extends object> {
  private readonly _eventPool: Partial<EventPool<E>> = {};

  public on<K extends keyof E>(event: K, handler: ActionMaybeAsync1<E[K]>): void {
    if (!(event in this._eventPool)) {
      this._eventPool[event] = new Set<ActionMaybeAsync1<E[K]>>();
    }

    this._eventPool[event]!.add(handler);
  }

  public async emit<K extends keyof E>(event: K, parameter?: E[K]): Promise<void> {
    if (event in this._eventPool) {
      await Promise.all(
        Array.from(this._eventPool[event]!).map(handler => (handler as Function).apply(this, [parameter])),
      );
    }
  }
}
