import { Application, PointData } from 'pixi.js';
import { ErrorUtils } from '../utils';

export type LayoutPreset = 'center-screen';
export type LayoutDirection = 'up' | 'down';

export class ComponentLayoutManager {
  private _app?: Application;

  public get app(): Application {
    return this._app || ErrorUtils.notInitialized(this, 'Application');
  }

  public initializeLayoutManager(app: Application): void {
    this._app = app;
  }

  public getPositionFromPreset(preset: LayoutPreset): PointData {
    switch (preset) {
      case 'center-screen':
        return {
          x: this.app.screen.width / 2,
          y: this.app.screen.height / 2,
        };

      default:
        const exhaustiveCheck: never = preset;
        throw new Error(`Unhandled layout preset: ${exhaustiveCheck}`);
    }
  }

  public getShiftedPosition(position: PointData, direction: LayoutDirection, amount: number): PointData {
    switch (direction) {
      case 'up':
        return {
          x: position.x,
          y: position.y - amount,
        };

      case 'down':
        return {
          x: position.x,
          y: position.y + amount,
        };

      default:
        const exhaustiveCheck: never = direction;
        throw new Error(`Unhandled layout direction: ${exhaustiveCheck}`);
    }
  }
}
