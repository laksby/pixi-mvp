import { Action } from '../types';

export class AnimationHandle {
  private _onStop = new Set<Action>();

  public stop(): void {
    this._onStop.forEach(event => event());
  }

  public clear(): void {
    this._onStop.clear();
  }

  public connect(action: Action) {
    this._onStop.add(action);
  }
}
