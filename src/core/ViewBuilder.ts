import { ContainerOptions } from 'pixi.js';

export type ViewInitializer = (builder: ViewBuilder) => void;

export class ViewBuilder {
  private _options = new Map<string, unknown>();

  public get options(): object {
    return Object.fromEntries(this._options.entries());
  }

  public scale(scale: ContainerOptions['scale']): this {
    return this.setOptions<ContainerOptions>({ scale });
  }

  public zIndex(zIndex: ContainerOptions['zIndex']): this {
    return this.setOptions<ContainerOptions>({ zIndex });
  }

  public hidden(hidden: boolean): this {
    return this.setOptions<ContainerOptions>({ visible: !hidden });
  }

  private setOptions<O extends object>(options: O): this {
    Object.entries(options).forEach(([key, value]) => this.setOption(key, value));
    return this;
  }

  private setOption(field: string, value: unknown): void {
    this._options.set(field, value);
  }
}
