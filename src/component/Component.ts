import { Container, Graphics } from 'pixi.js';
import { ErrorUtils } from '../utils';
import { ComponentBuilder, ComponentInitializer, ContainerConstructor } from './ComponentBuilder';
import { ComponentLayoutManager } from './ComponentLayoutManager';
import { IComponent } from './IComponent';

export class Component<C extends Container> implements IComponent {
  private readonly _layoutManager: ComponentLayoutManager;
  private readonly _ctor: ContainerConstructor<C>;
  private readonly _initializer: ComponentInitializer;
  private _container?: C;

  constructor(layoutManager: ComponentLayoutManager, ctor: ContainerConstructor<C>, initializer: ComponentInitializer) {
    this._layoutManager = layoutManager;
    this._ctor = ctor;
    this._initializer = initializer;
  }

  protected get container(): C {
    return this._container || ErrorUtils.notInitialized(this, 'Container');
  }

  public async initializeComponent(parent: Container): Promise<void> {
    const builder = new ComponentBuilder(this._layoutManager);
    this._initializer(builder);

    const ComponentType = this._ctor as new (options: unknown) => C;
    const container = new ComponentType(builder.options);

    container.position = builder.position;
    builder.events.forEach(event => container.on(event.event, event.handler, event.context));

    if (container instanceof Graphics) {
      builder.draws.forEach(draw => draw(container));
    }

    parent.addChild(container);
    this._container = container;

    await Promise.all(
      builder.children.map(child =>
        new Component(this._layoutManager, child.ctor, child.initializer).initializeComponent(container),
      ),
    );
  }

  public set<F extends keyof C>(field: F, value: C[F]): void {
    this.container[field] = value;
  }
}
