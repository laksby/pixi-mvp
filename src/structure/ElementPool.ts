import { Container } from 'pixi.js';
import { ErrorUtils, ObjectUtils } from '../utils';
import { ContainerBuilder, ContainerInitializer } from './ContainerBuilder';
import { Element } from './Element';
import { ElementConstructor, ElementInitializer } from './ElementBuilder';
import { IElement } from './IElement';
import { LayoutManager } from './LayoutManager';

export class ElementPool<C extends Container> implements IElement {
  private readonly _layoutManager: LayoutManager;
  private readonly _ctor: ElementConstructor<C>;
  private readonly _initializer?: ContainerInitializer;
  private readonly _children = new Map<unknown, Element<C>>();
  private _container?: Container;

  constructor(layoutManager: LayoutManager, ctor: ElementConstructor<C>, initializer?: ContainerInitializer) {
    this._layoutManager = layoutManager;
    this._ctor = ctor;
    this._initializer = initializer;
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

  public get(key: unknown): Element<C> | undefined {
    const element = this._children.get(key);
    return element;
  }

  public async add(key: unknown, initializer?: ElementInitializer): Promise<Element<C>> {
    const element = new Element(this._layoutManager, this._ctor, initializer);
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
