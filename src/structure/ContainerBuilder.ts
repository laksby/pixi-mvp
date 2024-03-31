import { Container, ContainerOptions, PointData, Size } from 'pixi.js';
import {
  LayoutAmount,
  LayoutDirection,
  LayoutFill,
  LayoutManager,
  LayoutPositionChange,
  LayoutPreset,
  LayoutSizeChange,
} from './LayoutManager';

export type ContainerInitializer = (builder: ContainerBuilder) => void;

export class ContainerBuilder {
  private readonly _layoutManager: LayoutManager;
  private _options = new Map<string, unknown>();
  private _positionFlow: LayoutPositionChange[] = [];
  private _sizeFlow: LayoutSizeChange[] = [];

  constructor(layoutManager: LayoutManager) {
    this._layoutManager = layoutManager;
  }

  public get options(): object {
    return Object.fromEntries(this._options.entries());
  }

  public label(label: ContainerOptions['label']): this {
    return this.setOptions<ContainerOptions>({ label });
  }

  public opaque(alpha: ContainerOptions['alpha']): this {
    return this.setOptions<ContainerOptions>({ alpha });
  }

  public scale(scale: ContainerOptions['scale']): this {
    return this.setOptions<ContainerOptions>({ scale });
  }

  public size(size: Size): this {
    this._sizeFlow.push(() => size);
    return this;
  }

  public position(position: PointData): this {
    this._positionFlow.push(() => position);
    return this;
  }

  public layout(preset: LayoutPreset, boundingSize?: Size): this {
    this._positionFlow.push(this._layoutManager.positionPreset(preset, boundingSize));
    return this;
  }

  public shift(direction: LayoutDirection, amount: LayoutAmount): this {
    this._positionFlow.push(this._layoutManager.positionShift(direction, amount));
    return this;
  }

  public layoutFill(fill: LayoutFill): this {
    this._sizeFlow.push(this._layoutManager.sizeFill(fill));
    return this;
  }

  public layoutPadding(value: PointData): this {
    this._sizeFlow.push(this._layoutManager.sizePadding(value));
    return this;
  }

  public zIndex(zIndex: ContainerOptions['zIndex']): this {
    return this.setOptions<ContainerOptions>({ zIndex });
  }

  public hidden(hidden: boolean): this {
    return this.setOptions<ContainerOptions>({ visible: !hidden });
  }

  public applyPositionFlow(container: Container): void {
    container.position.set(0, 0);
    this._positionFlow.forEach(change => (container.position = change(container)));
  }

  public applySizeFlow(container: Container): void {
    const size = this._sizeFlow.reduce((acc, change) => change(container, acc), {
      width: container.width,
      height: container.height,
    });
    container.setSize(size);
  }

  protected setOptions<O extends object>(options: O): this {
    Object.entries(options).forEach(([key, value]) => this.setOption(key, value));
    return this;
  }

  protected setOption(field: string, value: unknown): void {
    this._options.set(field, value);
  }
}
