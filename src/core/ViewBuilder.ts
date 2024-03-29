import { ContainerOptions } from 'pixi.js';
import { Action1 } from '../types';
import { IView } from './IView';

export type ViewInitializer<V extends IView> = (builder: ViewBuilder<V>) => void;

export class ViewBuilder<V extends IView> {
  private _options = new Map<string, unknown>();
  private _customActions: Action1<V>[] = [];

  public get options(): object {
    return Object.fromEntries(this._options.entries());
  }

  public get customActions(): Action1<V>[] {
    return this._customActions;
  }

  public scale(scale: ContainerOptions['scale']): this {
    return this.setOptions<ContainerOptions>({ scale });
  }

  public zIndex(zIndex: ContainerOptions['zIndex']): this {
    return this.setOptions<ContainerOptions>({ zIndex });
  }

  public hidden(hidden: boolean): this {
    return this.setOptions<ContainerOptions>({ visible: !hidden });
  }

  public onLoad(action: Action1<V>): this {
    this._customActions.push(action);
    return this;
  }

  private setOptions<O extends object>(options: O): this {
    Object.entries(options).forEach(([key, value]) => this.setOption(key, value));
    return this;
  }

  private setOption(field: string, value: unknown): void {
    this._options.set(field, value);
  }
}
