import { Container, ContainerOptions, EventEmitter, FederatedOptions, Graphics, PointData, TextOptions } from 'pixi.js';
import { ComponentLayoutManager, LayoutDirection, LayoutPreset } from './ComponentLayoutManager';

export type ComponentInitializer = (builder: ComponentBuilder) => void;
export type ContainerConstructor<C extends Container> = new () => C;
export type DrawInitializer = (graphics: Graphics) => void;

export interface ComponentBuilderEvent<E extends EventEmitter.EventNames<string>> {
  event: E;
  handler: EventEmitter.EventListener<string, E>;
  context?: unknown;
}

export interface ChildBuilder<T extends Container> {
  ctor: ContainerConstructor<T>;
  initializer: ComponentInitializer;
}

export class ComponentBuilder {
  private _layoutManager: ComponentLayoutManager;
  private _position: PointData = { x: 0, y: 0 };
  private _options = new Map<string, unknown>();
  private _events: ComponentBuilderEvent<string>[] = [];
  private _draws: DrawInitializer[] = [];
  private _children: ChildBuilder<Container>[] = [];

  constructor(layoutManager: ComponentLayoutManager) {
    this._layoutManager = layoutManager;
  }

  public get position(): PointData {
    return this._position;
  }

  public get options(): unknown {
    return Object.fromEntries(this._options.entries());
  }

  public get events(): ComponentBuilderEvent<string>[] {
    return this._events;
  }

  public get draws(): DrawInitializer[] {
    return this._draws;
  }

  public get children(): ChildBuilder<Container>[] {
    return this._children;
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

  public layout(options: LayoutPreset): this {
    this._position = this._layoutManager.getPositionFromPreset(options);
    return this;
  }

  public shift(direction: LayoutDirection, amount: number): this {
    this._position = this._layoutManager.getShiftedPosition(this._position, direction, amount);
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

  public child<T extends Container>(ctor: ContainerConstructor<T>, initializer: ComponentInitializer): this {
    this._children.push({ ctor, initializer });
    return this;
  }

  public interactive(): this {
    return this.setOptions<FederatedOptions>({
      eventMode: 'static',
      cursor: 'pointer',
    });
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
