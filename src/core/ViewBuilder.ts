import { ContainerBuilder } from '../structure';
import { Action1 } from '../types';
import { IView } from './IView';

export type ViewInitializer<V extends IView> = (builder: ViewBuilder<V>) => void;

export class ViewBuilder<V extends IView> extends ContainerBuilder {
  private _customActions: Action1<V>[] = [];

  public get customActions(): Action1<V>[] {
    return this._customActions;
  }

  public onLoad(action: Action1<V>): this {
    this._customActions.push(action);
    return this;
  }
}
