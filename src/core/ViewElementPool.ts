import { Container } from 'pixi.js';
import { ContainerBuilder, ContainerInitializer, IElement, LayoutManager } from '../structure';
import { ErrorUtils, ObjectUtils } from '../utils';
import { IView } from './IView';
import { ViewInitializer } from './ViewBuilder';
import { ViewElement } from './ViewElement';

export class ViewElementPool<V extends IView> implements IElement {
  private readonly _layoutManager: LayoutManager;
  private readonly _parentView: IView;
  private readonly _initializer?: ContainerInitializer;
  private readonly _children = new Map<unknown, ViewElement<V>>();
  private _container?: Container;

  constructor(layoutManager: LayoutManager, parentView: IView, initializer?: ContainerInitializer) {
    this._layoutManager = layoutManager;
    this._parentView = parentView;
    this._initializer = initializer;
  }

  public get views(): V[] {
    return Array.from(this._children.values()).map(element => element.view);
  }

  protected get container(): Container {
    return this._container || ErrorUtils.notInitialized(this, 'Container');
  }

  public async initializeElement(parent: Container): Promise<void> {
    const builder = new ContainerBuilder(this._layoutManager);
    const options = this.runBuilder(builder);

    this._container = new Container(options);
    parent.addChild(this.container);
  }

  public async updateElement(): Promise<void> {
    const builder = new ContainerBuilder(this._layoutManager);
    const options = this.runBuilder(builder);

    ObjectUtils.mixIn(this.container, options);
  }

  public destroyElement(): void {
    this.container.destroy();
  }

  public get(key: unknown): ViewElement<V> | undefined {
    const element = this._children.get(key);
    return element;
  }

  public async add(key: unknown, view: V, initializer?: ViewInitializer<V>): Promise<ViewElement<V>> {
    const element = new ViewElement(this._layoutManager, this._parentView, view, initializer);
    this._children.set(key, element);
    await element.initializeElement(this.container);
    return element;
  }

  public delete(key: unknown): void {
    const element = this._children.get(key);

    if (element) {
      element.destroyElement();
      this._children.delete(key);
    }
  }

  public clear(): void {
    this._children.clear();
  }

  private runBuilder(builder: ContainerBuilder): Record<string, unknown> {
    this._initializer?.(builder);

    const options: Record<string, unknown> = {};
    Object.assign(options, builder.options);

    return options;
  }
}
