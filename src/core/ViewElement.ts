import { Container } from 'pixi.js';
import { IElement, LayoutManager } from '../structure';
import { ErrorUtils, ObjectUtils } from '../utils';
import { IView } from './IView';
import { ViewBuilder, ViewInitializer } from './ViewBuilder';

export class ViewElement<V extends IView> implements IElement {
  private readonly _layoutManager: LayoutManager;
  private readonly _parentView: IView;
  private readonly _view: V;
  private readonly _initializer?: ViewInitializer<V>;

  constructor(layoutManager: LayoutManager, parentView: IView, view: V, initializer?: ViewInitializer<V>) {
    this._layoutManager = layoutManager;
    this._parentView = parentView;
    this._view = view;
    this._initializer = initializer;
  }

  public get view(): V {
    return this._view || ErrorUtils.notInitialized(this, 'View');
  }

  public async initializeElement(parent: Container): Promise<void> {
    const builder = new ViewBuilder<V>(this._layoutManager);
    const options = this.runBuilder(builder);

    await this._view.initializeView(this._parentView.game, parent, this._parentView.context);

    ObjectUtils.mixIn(this._view.container, options);
    this.applyBuilder(builder);
  }

  public async updateElement(): Promise<void> {
    const builder = new ViewBuilder<V>(this._layoutManager);
    const options = this.runBuilder(builder);

    ObjectUtils.mixIn(this._view.container, options);
    this.applyBuilder(builder);
  }

  public destroyElement(): void {
    this._view.destroyView();
  }

  private runBuilder(builder: ViewBuilder<V>): Record<string, unknown> {
    this._initializer?.(builder);

    const options: Record<string, unknown> = {};
    Object.assign(options, builder.options);

    return options;
  }

  private applyBuilder(builder: ViewBuilder<V>): void {
    builder.applySizeFlow(this._view.container);
    builder.applyPositionFlow(this._view.container);

    builder.customActions.forEach(action => action(this._view));
  }
}
