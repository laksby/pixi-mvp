import { Application, Bounds, Container, PointData } from 'pixi.js';
import { EventEmitter } from '../common';
import { ErrorUtils, MathUtils } from '../utils';
import { ICameraBounds } from './ICameraBounds';

export interface CameraEvents {
  zoom: PointData;
}

export class Camera {
  private readonly _app: Application;
  private readonly _keys = new Map<string, boolean>();
  private _rootContainer?: Container;
  private _bounds?: ICameraBounds;
  private _isDragging = false;
  private _lastDragMousePosition: PointData = { x: 0, y: 0 };
  private _dragMousePosition: PointData = { x: 0, y: 0 };
  private _zoomAmount = 0;
  private _zoomCenter: PointData = { x: 0, y: 0 };

  public readonly events = new EventEmitter<CameraEvents>();
  public isEnabled = false;
  public moveStep = 20;
  public zoomFactor = 0.5;
  public zoomMin = 0.2;
  public zoomMax = 5;

  constructor(app: Application) {
    this._app = app;
  }

  public get rootContainer(): Container {
    return this._rootContainer || ErrorUtils.notInitialized(this, 'RootContainer');
  }

  public initializeCamera(rootContainer: Container): void {
    this._rootContainer = rootContainer;
    this.addEventListeners();
    this.startUpdateLoop();
  }

  public setBounds(bounds: ICameraBounds): void {
    this._bounds = bounds;
  }

  protected addEventListeners(): void {
    const onKeyDown = (event: KeyboardEvent) => {
      this._keys.set(event.key, true);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      this._keys.set(event.key, false);
    };

    const onPointerDown = (event: PointerEvent) => {
      this._isDragging = true;
      this._lastDragMousePosition.x = event.x;
      this._lastDragMousePosition.y = event.y;
    };

    const onPointerMove = (event: PointerEvent) => {
      this._dragMousePosition.x = event.x;
      this._dragMousePosition.y = event.y;
    };

    const onPointerUp = () => {
      this._isDragging = false;
    };

    const onWheel = (event: WheelEvent) => {
      this._zoomAmount = event.deltaY > 0 ? -0.1 : 0.1;
      this._zoomCenter.x = event.x;
      this._zoomCenter.y = event.y;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('wheel', onWheel);
  }

  protected startUpdateLoop(): void {
    const update = () => {
      this.update();
    };

    this._app.ticker.add(update);
  }

  protected update(): void {
    if (this.isEnabled) {
      this.applyMove();
      this.applyZoom();
    }
  }

  protected applyMove(): void {
    if (this._keys.get('ArrowLeft')) {
      this.changePosition(-this.moveStep, 0);
    }

    if (this._keys.get('ArrowRight')) {
      this.changePosition(this.moveStep, 0);
    }

    if (this._keys.get('ArrowUp')) {
      this.changePosition(0, -this.moveStep);
    }

    if (this._keys.get('ArrowDown')) {
      this.changePosition(0, this.moveStep);
    }

    if (this._isDragging) {
      this.changePosition(
        this._lastDragMousePosition.x - this._dragMousePosition.x,
        this._lastDragMousePosition.y - this._dragMousePosition.y,
      );

      this._lastDragMousePosition.x = this._dragMousePosition.x;
      this._lastDragMousePosition.y = this._dragMousePosition.y;
    }
  }

  protected applyZoom(): void {
    if (this._zoomAmount !== 0) {
      const zoomCenterLocal = this.rootContainer.toLocal(this._zoomCenter);
      this.changeScale(1 + this._zoomAmount * this.zoomFactor);

      const zoomCenterGlobal = this.rootContainer.toGlobal(zoomCenterLocal);
      this.changePosition(zoomCenterGlobal.x - this._zoomCenter.x, zoomCenterGlobal.y - this._zoomCenter.y);

      this._zoomAmount = 0;
      this.events.emit('zoom', {
        x: this.rootContainer.scale.x,
        y: this.rootContainer.scale.y,
      });
    }
  }

  protected changePosition(amountX: number, amountY: number): void {
    const bounds =
      this._bounds?.getBounds() ??
      new Bounds(
        Number.NEGATIVE_INFINITY,
        Number.NEGATIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY,
      );

    const minX = bounds.minX * this.rootContainer.scale.x;
    const maxX = bounds.maxX * this.rootContainer.scale.x - this._app.screen.width;
    const minY = bounds.minY * this.rootContainer.scale.y;
    const maxY = bounds.maxY * this.rootContainer.scale.y - this._app.screen.height;

    const currentX = -this.rootContainer.position.x;
    const currentY = -this.rootContainer.position.y;
    const newPosition = { x: currentX + amountX, y: currentY + amountY };

    const clamped = this._bounds?.clampBounds(newPosition, new Bounds(minX, minY, maxX, maxY)) ?? newPosition;

    this.rootContainer.position.x = -clamped.x;
    this.rootContainer.position.y = -clamped.y;
  }

  protected changeScale(factor: number): void {
    this.rootContainer.scale.x = MathUtils.clamp(this.rootContainer.scale.x * factor, this.zoomMin, this.zoomMax);
    this.rootContainer.scale.y = MathUtils.clamp(this.rootContainer.scale.y * factor, this.zoomMin, this.zoomMax);
  }
}
