import { Assets, Container, Graphics, PointData, Text } from 'pixi.js';
import { ICanMove, ICanScale } from '../animation';
import { ContainerUtils, ErrorUtils } from '../utils';
import { ElementBuilder, ElementInitializer, ElementConstructor } from './ElementBuilder';
import { LayoutManager } from './LayoutManager';
import { IElement } from './IElement';

export class Element<C extends Container> implements IElement, ICanMove, ICanScale {
  private readonly _layoutManager: LayoutManager;
  private readonly _ctor: ElementConstructor<C>;
  private readonly _initializer: ElementInitializer;
  private _children: Element<Container>[] = [];
  private _container?: C;
  private _searchCache = new Map<string, Container | undefined>();

  constructor(layoutManager: LayoutManager, ctor: ElementConstructor<C>, initializer: ElementInitializer) {
    this._layoutManager = layoutManager;
    this._ctor = ctor;
    this._initializer = initializer;
  }

  public get position(): PointData {
    return this.container.position;
  }

  public set position(value: PointData) {
    this.container.position = value;
  }

  public get scale(): PointData {
    return this.container.scale;
  }

  public set scale(value: PointData) {
    this.container.scale = value;
  }

  protected get container(): C {
    return this._container || ErrorUtils.notInitialized(this, 'Container');
  }

  public async initializeElement(parent: Container): Promise<void> {
    this._searchCache.clear();

    const builder = new ElementBuilder(this._layoutManager);
    this._initializer(builder);

    const options: Record<string, unknown> = {};

    const assets = await Promise.all(builder.assets.map(([, name]) => Assets.load(name)));
    Object.assign(options, builder.options);
    Object.assign(options, Object.fromEntries(builder.assets.map(([field], index) => [field, assets[index]])));

    const ContainerType = this._ctor as new (options: unknown) => C;
    const container = new ContainerType(options);

    builder.events.forEach(event => container.on(event.event, event.handler, event.context));

    container.filters = builder.filters;

    if (container instanceof Graphics) {
      builder.draws.forEach(draw => draw(container));
    }

    parent.addChild(container);
    this._container = container;
    this._children = builder.children.map(child => new Element(this._layoutManager, child.ctor, child.initializer));

    await Promise.all(this._children.map(childElement => childElement.initializeElement(container)));

    builder.positionFlow.forEach(change => {
      container.position = change(container);
    });

    builder.customActions.forEach(action => {
      action(container);
    });
  }

  public destroyElement(): void {
    this.container.destroy();
  }

  public setForInnerText<F extends keyof Text>(label: string, field: F, value: Text[F]): void {
    return this.setForInner<Text, F>(label, field, value);
  }

  public setForInner<I extends Container, F extends keyof I>(label: string, field: F, value: I[F]): void {
    const container = this.find<I>(label) || ErrorUtils.notInitialized(this, `InnerElement '${label}'`);
    container[field] = value;
  }

  public set<F extends keyof C>(field: F, value: C[F]): void {
    this.container[field] = value;
  }

  protected find<T extends Container>(label: string): T | undefined {
    if (this._searchCache.has(label)) {
      return this._searchCache.get(label) as T;
    }

    const child = ContainerUtils.byLabel(label, this.container);
    this._searchCache.set(label, child);

    return child as T;
  }
}