import { AdjustmentFilter, ShockwaveFilter, ShockwaveFilterOptions } from 'pixi-filters';
import { Application, Container, PointData } from 'pixi.js';
import { ErrorUtils, FilterUtils, MathUtils } from '../utils';
import { AnimationHandle } from './AnimationHandle';

export interface ICanScale {
  scale: PointData;
}

export interface ICanMove {
  position: PointData;
}

export class Animator {
  private _app?: Application;

  public get app(): Application {
    return this._app || ErrorUtils.notInitialized(this, 'Application');
  }

  public initializeAnimator(app: Application): void {
    this._app = app;
  }

  public async shockWave(target: Container, duration: number, options?: ShockwaveFilterOptions): Promise<void> {
    const filter = FilterUtils.attach(target, new ShockwaveFilter(options));

    await this.generic(elapsed => {
      filter.time = elapsed / duration;
    }, duration);

    FilterUtils.remove(target, filter);
  }

  public glowStart(target: Container, speed: number, handle?: AnimationHandle): void {
    const filter = FilterUtils.attach(target, new AdjustmentFilter({ saturation: 0.5 }));

    handle?.connect(() => FilterUtils.remove(target, filter));

    this.generic(
      elapsed => {
        const contrast = MathUtils.oscillate(2, 3, (elapsed % speed) / speed);
        filter.brightness = contrast;
      },
      undefined,
      handle,
    );
  }

  public async appear(target: ICanScale, duration: number): Promise<void> {
    const originalX = target.scale.x;
    const originalY = target.scale.y;
    target.scale = { x: 0, y: 0 };

    await this.generic(elapsed => {
      const { x, y } = MathUtils.lerp2D(target.scale, { x: originalX, y: originalY }, elapsed / duration);
      target.scale = { x, y };
    }, duration);

    target.scale = { x: originalX, y: originalY };
  }

  public async hide(target: ICanScale, duration: number): Promise<void> {
    await this.generic(elapsed => {
      const { x, y } = MathUtils.lerp2D(target.scale, { x: 0, y: 0 }, elapsed / duration);
      target.scale = { x, y };
    }, duration);
    target.scale = { x: 0, y: 0 };
  }

  public async move(target: ICanMove, newPosition: PointData, duration: number): Promise<void> {
    await this.generic(elapsed => {
      const { x, y } = MathUtils.lerp2D(target.position, newPosition, elapsed / duration);
      target.position = { x, y };
    }, duration);
    target.position = { x: newPosition.x, y: newPosition.y };
  }

  public async generic(
    action: (elapsed: number) => void,
    duration: number | undefined,
    handle?: AnimationHandle,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      let elapsed = 0;

      const destroy = () => {
        this.app.ticker.remove(update);
        resolve();
      };

      const update = () => {
        elapsed += this.app.ticker.deltaMS;
        action(elapsed);

        if (duration !== undefined && elapsed > duration) {
          destroy();
        }
      };

      handle?.connect(destroy);

      try {
        this.app.ticker.add(update);
      } catch (err) {
        reject(err);
      }
    });
  }
}
