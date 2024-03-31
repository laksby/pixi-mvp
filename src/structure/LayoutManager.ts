import { Application, Container, PointData, Size, Sprite, TilingSprite } from 'pixi.js';
import { ErrorUtils } from '../utils';

export type LayoutPreset = 'center-screen' | 'top-screen' | 'top-left-screen' | 'top-right-screen' | 'center-parent';
export type LayoutDirection = 'up' | 'down' | 'left' | 'right';
export type LayoutFill = 'width-screen';
export type LayoutPositionChange = (container: Container) => PointData;
export type LayoutSizeChange = (container: Container, size: Size) => Size;
export type LayoutAmount = number | string;

export class LayoutManager {
  private _app?: Application;

  public get app(): Application {
    return this._app || ErrorUtils.notInitialized(this, 'Application');
  }

  public initializeLayoutManager(app: Application): void {
    this._app = app;
  }

  public positionPreset(preset: LayoutPreset, boundingSize?: Size): LayoutPositionChange {
    switch (preset) {
      case 'center-screen':
        return () => ({ x: this.app.screen.width / 2, y: this.app.screen.height / 2 });

      case 'top-screen':
        return () => ({ x: this.app.screen.width / 2, y: 0 });

      case 'top-left-screen':
        return () => ({ x: 0, y: 0 });

      case 'top-right-screen':
        return () => ({ x: this.app.screen.width, y: 0 });

      case 'center-parent':
        return c => ({ x: this.getCenterX(c.parent, boundingSize), y: this.getCenterY(c.parent, boundingSize) });

      default:
        const exhaustiveCheck: never = preset;
        throw new Error(`Unhandled layout preset: ${exhaustiveCheck}`);
    }
  }

  public positionShift(direction: LayoutDirection, amount: LayoutAmount): LayoutPositionChange {
    switch (direction) {
      case 'up':
        return c => ({ x: c.position.x, y: this.shiftY(c, amount, -1) });

      case 'down':
        return c => ({ x: c.position.x, y: this.shiftY(c, amount, 1) });

      case 'left':
        return c => ({ x: this.shiftX(c, amount, -1), y: c.position.y });

      case 'right':
        return c => ({ x: this.shiftX(c, amount, 1), y: c.position.y });

      default:
        const exhaustiveCheck: never = direction;
        throw new Error(`Unhandled layout direction: ${exhaustiveCheck}`);
    }
  }

  public sizeFill(fill: LayoutFill): LayoutSizeChange {
    switch (fill) {
      case 'width-screen':
        return c => ({ width: this.app.screen.width, height: this.getTextureHeight(c) });

      default:
        const exhaustiveCheck: never = fill;
        throw new Error(`Unhandled layout fill: ${exhaustiveCheck}`);
    }
  }

  public sizePadding(value: PointData): LayoutSizeChange {
    return (_, s) => ({ width: s.width - value.x * 2, height: s.height - value.y * 2 });
  }

  private shiftX(container: Container, amount: LayoutAmount, sign: 1 | -1): number {
    if (typeof amount === 'string' && amount.endsWith('%')) {
      const percentage = Number(amount.slice(0, -1)) / 100;
      return container.position.x + container.width * percentage * sign;
    } else if (typeof amount === 'number') {
      return container.position.x + amount * sign;
    } else {
      throw new Error(`Unsupported layout amount format: ${amount}`);
    }
  }

  private shiftY(container: Container, amount: LayoutAmount, sign: 1 | -1): number {
    if (typeof amount === 'string' && amount.endsWith('%')) {
      const percentage = Number(amount.slice(0, -1)) / 100;
      return container.position.y + container.height * percentage * sign;
    } else if (typeof amount === 'number') {
      return container.position.y + amount * sign;
    } else {
      throw new Error(`Unsupported layout amount format: ${amount}`);
    }
  }

  private getCenterX(parent: Container, boundingSize?: Size): number {
    const parentWidth = boundingSize?.width ?? parent.width;

    if (parent instanceof Sprite) {
      return parentWidth / 2 - parent.anchor.x * parentWidth;
    }

    return parentWidth / 2;
  }

  private getCenterY(parent: Container, boundingSize?: Size): number {
    const parentHeight = boundingSize?.height ?? parent.height;

    if (parent instanceof Sprite) {
      return parentHeight / 2 - parent.anchor.y * parentHeight;
    }

    return parentHeight / 2;
  }

  private getTextureHeight(container: Container): number {
    if (container instanceof Sprite || container instanceof TilingSprite) {
      return container.texture?.height ?? 0;
    }

    return 0;
  }
}
