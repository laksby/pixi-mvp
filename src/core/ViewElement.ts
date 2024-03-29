import { Container } from 'pixi.js';
import { IElement } from '../structure';
import { IView } from './IView';
import { ViewBuilder, ViewInitializer } from './ViewBuilder';

export class ViewElement<V extends IView> implements IElement {
  private readonly _parentView: IView;
  private readonly _view: V;
  private readonly _initializer: ViewInitializer<V>;

  constructor(parentView: IView, view: V, initializer: ViewInitializer<V>) {
    this._parentView = parentView;
    this._view = view;
    this._initializer = initializer;
  }

  public async initializeElement(parent: Container): Promise<void> {
    const builder = new ViewBuilder<V>();
    this._initializer(builder);

    const options: Record<string, unknown> = {};
    Object.assign(options, builder.options);

    await this._view.initializeView(this._parentView.app, parent, this._parentView.context);

    Object.entries(options).forEach(([key, value]) => {
      (this._view.container as unknown as Record<string, unknown>)[key as keyof Container] = value;
    });

    builder.customActions.forEach(action => {
      action(this._view);
    });
  }

  public destroyElement(): void {
    this._view.destroyView();
  }
}
