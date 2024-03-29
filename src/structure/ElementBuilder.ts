import {
  Container,
  ContainerOptions,
  EventEmitter,
  FederatedOptions,
  Filter,
  Graphics,
  PointData,
  Size,
  SpriteOptions,
  TextOptions,
} from 'pixi.js';
import { Action1 } from '../types';
import { FilterUtils } from '../utils';
import { LayoutManager, LayoutAmount, LayoutDirection, LayoutPositionChange, LayoutPreset } from './LayoutManager';

export type ElementInitializer = (builder: ElementBuilder) => void;
export type ElementConstructor<C extends Container> = new () => C;
export type DrawInitializer = (graphics: Graphics) => void;

export interface ElementBuilderEvent<E extends EventEmitter.EventNames<string>> {
  event: E;
  handler: EventEmitter.EventListener<string, E>;
  context?: unknown;
}

export interface ChildBuilder<T extends Container> {
  ctor: ElementConstructor<T>;
  initializer: ElementInitializer;
}

export class ElementBuilder {
  private _layoutManager: LayoutManager;
  private _positionFlow: LayoutPositionChange[] = [];
  private _options = new Map<string, unknown>();
  private _assets = new Map<string, string>();
  private _events: ElementBuilderEvent<string>[] = [];
  private _draws: DrawInitializer[] = [];
  private _customActions: Action1<Container>[] = [];
  private _filters: Filter[] = [];
  private _children: ChildBuilder<Container>[] = [];

  constructor(layoutManager: LayoutManager) {
    this._layoutManager = layoutManager;
  }

  public get positionFlow(): LayoutPositionChange[] {
    return this._positionFlow;
  }

  public get options(): object {
    return Object.fromEntries(this._options.entries());
  }

  public get assets(): [string, string][] {
    return Array.from(this._assets.entries());
  }

  public get events(): ElementBuilderEvent<string>[] {
    return this._events;
  }

  public get draws(): DrawInitializer[] {
    return this._draws;
  }

  public get customActions(): Action1<Container>[] {
    return this._customActions;
  }

  public get filters(): Filter[] {
    return this._filters;
  }

  public get children(): ChildBuilder<Container>[] {
    return this._children;
  }

  public spriteTexture(texture: string): this {
    this._assets.set('texture', texture);
    return this;
  }

  public spriteAnchor(anchor: SpriteOptions['anchor']): this {
    return this.setOptions<SpriteOptions>({ anchor });
  }

  public text(text: TextOptions['text']): this {
    return this.setOptions<TextOptions>({ text });
  }

  public textAnchor(anchor: TextOptions['anchor']): this {
    return this.setOptions<TextOptions>({ anchor });
  }

  public textStyle(style: TextOptions['style']): this {
    return this.setOptions<TextOptions>({ style });
  }

  public draw(initializer: DrawInitializer): this {
    this._draws.push(initializer);
    return this;
  }

  public scale(scale: ContainerOptions['scale']): this {
    return this.setOptions<ContainerOptions>({ scale });
  }

  public size(size: Size): this {
    return this.setOptions<ContainerOptions>({ width: size.width, height: size.height });
  }

  public position(position: PointData): this {
    return this.setOptions<ContainerOptions>({ position });
  }

  public layout(options: LayoutPreset): this {
    this._positionFlow.push(this._layoutManager.positionPreset(options));
    return this;
  }

  public shift(direction: LayoutDirection, amount: LayoutAmount): this {
    this.positionFlow.push(this._layoutManager.positionShift(direction, amount));
    return this;
  }

  public label(label: ContainerOptions['label']): this {
    return this.setOptions<ContainerOptions>({ label });
  }

  public zIndex(zIndex: ContainerOptions['zIndex']): this {
    return this.setOptions<ContainerOptions>({ zIndex });
  }

  public hidden(hidden: boolean): this {
    return this.setOptions<ContainerOptions>({ visible: !hidden });
  }

  public filter(filter: Filter): this {
    this._filters.push(filter);
    return this;
  }

  public child<T extends Container>(ctor: ElementConstructor<T>, initializer: ElementInitializer): this {
    this._children.push({ ctor, initializer });
    return this;
  }

  public interactive(): this {
    return this.setOptions<FederatedOptions>({
      eventMode: 'static',
      cursor: 'pointer',
    });
  }

  public hover(): this {
    this._customActions.push(container => FilterUtils.hover(container));
    return this;
  }

  public on<E extends EventEmitter.EventNames<string>>(
    event: E,
    handler: EventEmitter.EventListener<string, E>,
    context?: unknown,
  ): this {
    this._events.push({ event, handler, context });
    return this;
  }

  private setOptions<O extends object>(options: O): this {
    Object.entries(options).forEach(([key, value]) => this.setOption(key, value));
    return this;
  }

  private setOption(field: string, value: unknown): void {
    this._options.set(field, value);
  }
}
