import { Application, Container, TextStyleOptions } from 'pixi.js';
import { Animator } from '../animation/Animator';
import {
  ContainerInitializer,
  Element,
  ElementConstructor,
  ElementInitializer,
  ElementPool,
  IElement,
  LayoutManager,
} from '../structure';
import { ContainerUtils, ErrorUtils } from '../utils';
import { BaseGame } from './BaseGame';
import { IPresenter } from './IPresenter';
import { IView } from './IView';
import { ViewInitializer } from './ViewBuilder';
import { ViewElement } from './ViewElement';
import { ViewElementPool } from './ViewElementPool';
import { ViewContext } from './types/ViewContext';

export abstract class BaseView<P extends IPresenter> implements IView {
  private readonly _presenterType: Function;
  private readonly _animator: Animator;
  private readonly _layoutManager: LayoutManager;

  private _game?: BaseGame<unknown>;
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

  public async initializeView(game: BaseGame<unknown>, parent: Container, context: ViewContext): Promise<void> {
    if (this._container) {
      this._container.destroy();
    }

    this._game = game;
    this._container = this.createContainer();
    this._context = context;

    this._searchCache.clear();
    this._animator.initializeAnimator(this.app);
    this._layoutManager.initializeLayoutManager(this.app);

    parent.addChild(this.container);

    if (!this._presenter) {
      this._presenter = Reflect.construct(this._presenterType, [this, this.context.model]) as P;
    }

    for (const element of this._elements.values()) {
      await element.initializeElement(this.container);
    }

    await this.onLoad();
    await this.presenter.initializePresenter();
  }

  public async refreshView(parent: Container): Promise<void> {
    await this.initializeView(this.game, parent, this.context);
  }

  public destroyView(): void {
    this.container.destroy();
  }

  public async updateElements(): Promise<void> {
    for (const element of this._elements.values()) {
      await element.updateElement();
    }
  }

  public hide(): void {
    this.container.visible = false;
  }

  public show(): void {
    this.container.visible = true;
  }

  public get game(): BaseGame<unknown> {
    return this._game || ErrorUtils.notInitialized(this, 'Game');
  }

  public get app(): Application {
    return this.game.app;
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

  protected element<C extends Container>(ctor: ElementConstructor<C>, initializer?: ElementInitializer): Element<C> {
    const element = new Element(this._layoutManager, ctor, initializer);
    this._elements.add(element);
    return element;
  }

  protected view<V extends IView>(view: V, initializer?: ViewInitializer<V>): ViewElement<V> {
    const element = new ViewElement(this._layoutManager, this, view, initializer);
    this._elements.add(element);
    return element;
  }

  protected pool<C extends Container>(ctor: ElementConstructor<C>, initializer?: ContainerInitializer): ElementPool<C> {
    const element = new ElementPool(this._layoutManager, ctor, initializer);
    this._elements.add(element);
    return element;
  }

  protected viewPool<V extends IView>(initializer?: ContainerInitializer): ViewElementPool<V> {
    const element = new ViewElementPool<V>(this._layoutManager, this, initializer);
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
