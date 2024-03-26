import { Application, Container } from 'pixi.js';
import { Animator } from '../animation/Animator';
import { IPresenter } from './IPresenter';
import { IView } from './IView';

export abstract class BaseView<P extends IPresenter> implements IView {
  private readonly _presenterType: Function;

  private _app?: Application;
  private _container?: Container;
  private _model?: unknown;
  private _presenter?: P;
  private _animator?: Animator;
  private _searchCache = new Map<string, Container | undefined>();

  constructor(presenterType: Function) {
    this._presenterType = presenterType;
  }

  public async initializeView(app: Application, parent: Container, model: unknown): Promise<void> {
    if (this._container) {
      this._container.destroy();
    }

    this._app = app;
    this._container = this.createContainer();
    this._model = model;
    this._animator = new Animator(app);
    this._searchCache.clear();

    parent.addChild(this.container);

    this._presenter = Reflect.construct(this._presenterType, [this, this._model]) as P;

    await this.onLoad();
    await this.presenter.initializePresenter();
  }

  public async refreshView(parent: Container): Promise<void> {
    await this.initializeView(this.app, parent, this._model);
  }

  public get container(): Container {
    return this._container || this.throwNotInitialized('Container');
  }

  protected get app(): Application {
    return this._app || this.throwNotInitialized('Application');
  }

  protected get presenter(): P {
    return this._presenter || this.throwNotInitialized('Presenter');
  }

  protected get animator(): Animator {
    return this._animator || this.throwNotInitialized('Animator');
  }

  protected onLoad(): void | Promise<void> {
    // Virtual
  }

  protected createContainer(): Container {
    // Virtual
    return new Container();
  }

  protected ensureChild<T extends Container>(label: string): T {
    return this.child(label) || this.throwNotInitialized(`Child with label: ${label}`);
  }

  protected child<T extends Container>(label: string): T | undefined {
    if (this._searchCache.has(label)) {
      return this._searchCache.get(label) as T;
    }

    const child = this.searchChild(label, this.container.children);
    this._searchCache.set(label, child);

    return child as T;
  }

  protected searchChild(label: string, children: Container[]): Container | undefined {
    for (const component of children) {
      if (component.label === label) {
        return component;
      }

      const child = this.searchChild(label, component.children);

      if (child) {
        return child;
      }
    }

    return undefined;
  }

  protected use<C extends Container>(container: C, children: Container[] = []): C {
    this.container.addChild(container);
    children.forEach(child => container.addChild(child));
    return container;
  }

  protected async useChild<V extends BaseView<IPresenter>>(view: V): Promise<V> {
    await view.initializeView(this.app, this.container, this._model);
    return view;
  }

  protected throwNotInitialized(target: string): never {
    throw new Error(`${target} not initialized inside view`);
  }
}
