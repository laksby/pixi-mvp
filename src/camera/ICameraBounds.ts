import { Bounds, PointData } from 'pixi.js';

export interface ICameraBounds {
  getBounds(): Bounds;
  clampBounds(position: PointData, bounds: Bounds): PointData;
}
