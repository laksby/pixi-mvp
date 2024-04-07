import { Assets, Container, Graphics, PointData } from 'pixi.js';
import { ICanMove, ICanScale } from '../animation';
import { ContainerUtils, ErrorUtils, ObjectUtils } from '../utils';
import { ElementBuilder, ElementConstructor, ElementInitializer } from './ElementBuilder';
import { IElement } from './IElement';
import { LayoutManager } from './LayoutManager';

export class Element<C extends Container> implements IElement, ICanMove, ICanScale {
  private readonly _layoutManager: LayoutManager;
  private readonly _ctor: ElementConstructor<C>;
  private readonly _initializer?: ElementInitializer;
  private readonly _children = new Set<Element<Container>>();
  private readonly _searchCache = new Map<string, Container>();
  private _container?: C;

  constructor(layoutManager: LayoutManager, ctor: ElementConstructor<C>, initializer?: ElementInitializer) {
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
    const options = await this.runBuilder(builder);

    const ContainerType = this._ctor as new (options: unknown) => C;
    this._container = new ContainerType(options);
    parent.addChild(this.container);

    await this.applyBuilder(builder);
  }

  public async updateElement(): Promise<void> {
    const builder = new ElementBuilder(this._layoutManager);
    const options = await this.runBuilder(builder);

    ObjectUtils.mixIn(this.container, options);

    await this.applyBuilder(builder);
  }

  public destroyElement(): void {
    this.container.destroy();
  }

  public object<I extends Container = C>(label?: string): I {
    if (!label) {
      return this.container as unknown as I;
    }

    if (this._searchCache.has(label)) {
      return this._searchCache.get(label) as I;
    }

    const child = ContainerUtils.byLabel(label, this.container) || ErrorUtils.notInitialized(this, `Child '${label}'`);
    this._searchCache.set(label, child);

    return child as I;
  }

  private async runBuilder(builder: ElementBuilder): Promise<Record<string, unknown>> {
    this._initializer?.(builder);

    const options: Record<string, unknown> = {};
    const assets = await Promise.all(builder.assets.map(([, name]) => Assets.load(name)));
    Object.assign(options, builder.options);
    Object.assign(options, Object.fromEntries(builder.assets.map(([field], index) => [field, assets[index]])));

    return options;
  }

  private async applyBuilder(builder: ElementBuilder): Promise<void> {
    this.container.removeAllListeners();
    builder.events.forEach(event => this.container.on(event.event, event.handler, event.context));

    this.container.filters = builder.filters;

    if (this.container instanceof Graphics) {
      const graphics = this.container as Graphics;
      graphics.clear();
      builder.draws.forEach(draw => draw(graphics));
    }

    this._children.forEach(child => child.destroyElement());
    this._children.clear();
    builder.children.forEach(child => {
      this._children.add(new Element(this._layoutManager, child.ctor, child.initializer));
    });

    for (const childElement of this._children.values()) {
      await childElement.initializeElement(this.container);
    }

    builder.applySizeFlow(this.container);
    builder.applyPositionFlow(this.container);

    builder.customActions.forEach(action => action(this.container));
  }
}
