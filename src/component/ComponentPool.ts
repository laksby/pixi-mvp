import { Container } from 'pixi.js';
import { ErrorUtils } from '../utils';
import { Component } from './Component';
import { ComponentInitializer, ContainerConstructor } from './ComponentBuilder';
import { ComponentLayoutManager } from './ComponentLayoutManager';
import { IComponent } from './IComponent';

export class ComponentPool<C extends Container> implements IComponent {
  private readonly _layoutManager: ComponentLayoutManager;
  private readonly _ctor: ContainerConstructor<C>;
  private readonly _children = new Map<unknown, Component<C>>();
  private _container?: Container;

  constructor(layoutManager: ComponentLayoutManager, ctor: ContainerConstructor<C>) {
    this._layoutManager = layoutManager;
    this._ctor = ctor;
  }

  protected get container(): Container {
    return this._container || ErrorUtils.notInitialized(this, 'Container');
  }

  public async initializeComponent(parent: Container): Promise<void> {
    const container = new Container();

    parent.addChild(container);
    this._container = container;
  }

  public destroyComponent(): void {
    this.container.destroy();
  }

  public async add(key: unknown, initializer: ComponentInitializer): Promise<Component<C>> {
    const component = new Component(this._layoutManager, this._ctor, initializer);
    this._children.set(key, component);
    await component.initializeComponent(this.container);
    return component;
  }

  public delete(key: unknown): void {
    const component = this._children.get(key);

    if (component) {
      component.destroyComponent();
      this._children.delete(key);
    }
  }

  public clear(): void {
    this._children.clear();
  }
}
