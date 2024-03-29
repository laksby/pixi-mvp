import { Container } from 'pixi.js';
import { ErrorUtils } from '../utils';
import { Element } from './Element';
import { ElementInitializer, ElementConstructor } from './ElementBuilder';
import { LayoutManager } from './LayoutManager';
import { IElement } from './IElement';

export class ElementPool<C extends Container> implements IElement {
  private readonly _layoutManager: LayoutManager;
  private readonly _ctor: ElementConstructor<C>;
  private readonly _children = new Map<unknown, Element<C>>();
  private _container?: Container;

  constructor(layoutManager: LayoutManager, ctor: ElementConstructor<C>) {
    this._layoutManager = layoutManager;
    this._ctor = ctor;
  }

  protected get container(): Container {
    return this._container || ErrorUtils.notInitialized(this, 'Container');
  }

  public async initializeElement(parent: Container): Promise<void> {
    const container = new Container();

    parent.addChild(container);
    this._container = container;
  }

  public destroyElement(): void {
    this.container.destroy();
  }

  public get(key: unknown): Element<C> | undefined {
    const element = this._children.get(key);
    return element;
  }

  public async add(key: unknown, initializer: ElementInitializer): Promise<Element<C>> {
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
}
