import { Action } from '../types';

export abstract class FunctionUtils {
  public static debounce<T extends Action>(action: T, timeout: number, thisArg?: unknown): T {
    let timer: NodeJS.Timeout;

    return ((...args: unknown[]) => {
      clearTimeout(timer);

      timer = setTimeout(() => action.apply(thisArg, args), timeout);
    }) as T;
  }
}
