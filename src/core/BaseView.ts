import { Application, Container, TextStyleOptions } from 'pixi.js';
import { Animator } from '../animation/Animator';
import {
  Component,
  ComponentInitializer,
  ComponentLayoutManager,
  ContainerConstructor,
  IComponent,
} from '../component';
import { ErrorUtils } from '../utils';
import { IPresenter } from './IPresenter';
import { IView } from './IView';
import { ViewComponent } from './ViewComponent';
import { ViewContext } from './types/ViewContext';

export abstract class BaseView<P extends IPresenter> implements IView {
  private readonly _presenterType: Function;
  private readonly _layoutManager: ComponentLayoutManager;

  private _app?: Application;
  private _container?: Container;
  private _context?: ViewContext;
  private _presenter?: P;
  private _animator?: Animator;
  private _searchCache = new Map<string, Container | undefined>();
  private _components = new Set<IComponent>();

  constructor(presenterType: Function) {
    this._presenterType = presenterType;
    this._layoutManager = new ComponentLayoutManager();
  }

  public async initializeView(app: Application, parent: Container, context: ViewContext): Promise<void> {
    if (this._container) {
      this._container.destroy();
    }

    this._app = app;
    this._container = this.createContainer();
    this._context = context;
    this._animator = new Animator(app);
    this._searchCache.clear();
    this._layoutManager.initializeLayoutManager(app);

    parent.addChild(this.container);

    this._presenter = Reflect.construct(this._presenterType, [this, this.context.model]) as P;
    await Promise.all(Array.from(this._components).map(component => component.initializeComponent(this.container)));

    await this.onLoad();
    await this.presenter.initializePresenter();
  }

  public async refreshView(parent: Container): Promise<void> {
    await this.initializeView(this.app, parent, this.context);
  }

  public get app(): Application {
    return this._app || ErrorUtils.notInitialized(this, 'Application');
  }

  public get container(): Container {
    return this._container || ErrorUtils.notInitialized(this, 'Container');
  }

  public get context(): ViewContext {
    return this._context || ErrorUtils.notInitialized(this, 'ViewContext');
  }

  protected get presenter(): P {
    return this._presenter || ErrorUtils.notInitialized(this, 'Presenter');
  }

  protected get animator(): Animator {
    return this._animator || ErrorUtils.notInitialized(this, 'Animator');
  }

  protected onLoad(): void | Promise<void> {
    // Virtual
  }

  protected createContainer(): Container {
    // Virtual
    return new Container();
  }

  protected component<C extends Container>(
    ctor: ContainerConstructor<C>,
    initializer: ComponentInitializer,
  ): Component<C> {
    const component = new Component(this._layoutManager, ctor, initializer);
    this._components.add(component);
    return component;
  }

  protected view(view: IView): ViewComponent {
    const component = new ViewComponent(this, view);
    this._components.add(component);
    return component;
  }

  protected find<T extends Container>(label: string): T | undefined {
    if (this._searchCache.has(label)) {
      return this._searchCache.get(label) as T;
    }

    const child = this.searchRecursive(label, this.container.children);
    this._searchCache.set(label, child);

    return child as T;
  }

  protected textStyle(key: string): TextStyleOptions {
    return this.context.textStyles.get(key) ?? {};
  }

  private searchRecursive(label: string, children: Container[]): Container | undefined {
    for (const component of children) {
      if (component.label === label) {
        return component;
      }

      const child = this.searchRecursive(label, component.children);

      if (child) {
        return child;
      }
    }

    return undefined;
  }
}
