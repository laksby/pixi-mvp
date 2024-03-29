import { Application, Container, PointData, Sprite } from 'pixi.js';
import { ErrorUtils } from '../utils';

export type LayoutPreset = 'center-screen' | 'top-screen' | 'center-parent';
export type LayoutDirection = 'up' | 'down';
export type LayoutPositionChange = (container: Container) => PointData;
export type LayoutAmount = number | string;

export class LayoutManager {
  private _app?: Application;

  public get app(): Application {
    return this._app || ErrorUtils.notInitialized(this, 'Application');
  }

  public initializeLayoutManager(app: Application): void {
    this._app = app;
  }

  public positionPreset(preset: LayoutPreset): LayoutPositionChange {
    switch (preset) {
      case 'center-screen':
        return () => ({ x: this.app.screen.width / 2, y: this.app.screen.height / 2 });

      case 'top-screen':
        return () => ({ x: this.app.screen.width / 2, y: 0 });

      case 'center-parent':
        return c => ({ x: this.getCenterX(c.parent), y: this.getCenterY(c.parent) });

      default:
        const exhaustiveCheck: never = preset;
        throw new Error(`Unhandled layout preset: ${exhaustiveCheck}`);
    }
  }

  public positionShift(direction: LayoutDirection, amount: LayoutAmount): LayoutPositionChange {
    switch (direction) {
      case 'up':
        return c => ({ x: c.position.x, y: this.shiftY(c, -amount) });

      case 'down':
        return c => ({ x: c.position.x, y: this.shiftY(c, amount) });

      default:
        const exhaustiveCheck: never = direction;
        throw new Error(`Unhandled layout direction: ${exhaustiveCheck}`);
    }
  }

  private shiftY(container: Container, amount: LayoutAmount): number {
    if (typeof amount === 'string' && amount.endsWith('%')) {
      const percentage = Number(amount.slice(0, -1)) / 100;
      return container.position.y + container.height * percentage;
    } else if (typeof amount === 'number') {
      return container.position.y + amount;
    } else {
      throw new Error(`Unsupported layout amount format: ${amount}`);
    }
  }

  private getCenterX(container: Container): number {
    if (container instanceof Sprite) {
      return container.width / 2 - container.anchor.x * container.parent.width;
    }

    return container.width / 2;
  }

  private getCenterY(container: Container): number {
    if (container instanceof Sprite) {
      return container.height / 2 - container.anchor.y * container.parent.height;
    }

    return container.height / 2;
  }
}
