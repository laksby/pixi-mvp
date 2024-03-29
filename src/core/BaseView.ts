import { Application, Container, TextStyleOptions } from 'pixi.js';
import { Animator } from '../animation/Animator';
import { Element, ElementInitializer, LayoutManager, ElementPool, ElementConstructor, IElement } from '../structure';
import { ContainerUtils, ErrorUtils } from '../utils';
import { IPresenter } from './IPresenter';
import { IView } from './IView';
import { ViewInitializer } from './ViewBuilder';
import { ViewElement } from './ViewElement';
import { ViewContext } from './types/ViewContext';

export abstract class BaseView<P extends IPresenter> implements IView {
  private readonly _presenterType: Function;
  private readonly _animator: Animator;
  private readonly _layoutManager: LayoutManager;

  private _app?: Application;
  private _container?: Container;
  private _context?: ViewContext;
  private _presenter?: P;
  private _searchCache = new Map<string, Container | undefined>();
  private _elements = new Set<IElement>();

  constructor(presenterType: Function) {
    this._presenterType = presenterType;
    this._animator = new Animator();
    this._layoutManager = new LayoutManager();
  }

  public async initializeView(app: Application, parent: Container, context: ViewContext): Promise<void> {
    if (this._container) {
      this._container.destroy();
    }

    this._app = app;
    this._container = this.createContainer();
    this._context = context;

    this._searchCache.clear();
    this._animator.initializeAnimator(app);
    this._layoutManager.initializeLayoutManager(app);

    parent.addChild(this.container);

    if (!this._presenter) {
      this._presenter = Reflect.construct(this._presenterType, [this, this.context.model]) as P;
    }

    await Promise.all(Array.from(this._elements).map(element => element.initializeElement(this.container)));

    await this.onLoad();
    await this.presenter.initializePresenter();
  }

  public async refreshView(parent: Container): Promise<void> {
    await this.initializeView(this.app, parent, this.context);
  }

  public destroyView(): void {
    this.container.destroy();
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

  protected element<C extends Container>(ctor: ElementConstructor<C>, initializer: ElementInitializer): Element<C> {
    const element = new Element(this._layoutManager, ctor, initializer);
    this._elements.add(element);
    return element;
  }

  protected view<V extends IView>(view: V, initializer: ViewInitializer<V>): ViewElement<V> {
    const element = new ViewElement(this, view, initializer);
    this._elements.add(element);
    return element;
  }

  protected pool<C extends Container>(ctor: ElementConstructor<C>): ElementPool<C> {
    const element = new ElementPool(this._layoutManager, ctor);
    this._elements.add(element);
    return element;
  }

  protected find<T extends Container>(label: string): T | undefined {
    if (this._searchCache.has(label)) {
      return this._searchCache.get(label) as T;
    }

    const child = ContainerUtils.byLabel(label, this.container);
    this._searchCache.set(label, child);

    return child as T;
  }

  protected textStyle(key: string, override: TextStyleOptions = {}): TextStyleOptions {
    const textStyle = this.context.textStyles.get(key) ?? {};
    return Object.assign(textStyle, override);
  }
}
