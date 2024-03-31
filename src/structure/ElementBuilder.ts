import { Container, EventEmitter, FederatedOptions, Filter, Graphics, SpriteOptions, TextOptions } from 'pixi.js';
import { Action1 } from '../types';
import { FilterUtils } from '../utils';
import { ContainerBuilder } from './ContainerBuilder';

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

export class ElementBuilder extends ContainerBuilder {
  private _assets = new Map<string, string>();
  private _events: ElementBuilderEvent<string>[] = [];
  private _draws: DrawInitializer[] = [];
  private _customActions: Action1<Container>[] = [];
  private _filters: Filter[] = [];
  private _children: ChildBuilder<Container>[] = [];

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
}
