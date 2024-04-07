import { PointData, Size } from 'pixi.js';

export abstract class TileUtils {
  public static tileSquare(col: number, row: number, tileWidth: number, tileHeight: number): PointData {
    return {
      x: col * tileWidth,
      y: row * tileHeight,
    };
  }

  public static tileIsoSquare(col: number, row: number, tileWidth: number, tileHeight: number): PointData {
    return {
      x: col * tileWidth + Math.abs(row % 2) * (tileWidth / 2),
      y: row * (tileHeight / 2),
    };
  }

  public static tileIsoRhombic(col: number, row: number, tileWidth: number, tileHeight: number): PointData {
    return {
      x: (col - row) * (tileWidth / 2),
      y: (col + row) * (tileHeight / 2),
    };
  }

  public static mapSquare(cols: number, rows: number, tileWidth: number, tileHeight: number): Size {
    return {
      width: cols * tileWidth,
      height: rows * tileHeight,
    };
  }

  public static mapIsoSquare(cols: number, rows: number, tileWidth: number, tileHeight: number): Size {
    return {
      width: cols * tileWidth + Math.abs(cols % 2) * (tileWidth / 2),
      height: rows * (tileHeight / 2) + tileHeight / 2,
    };
  }

  public static mapIsoRhombic(cols: number, rows: number, tileWidth: number, tileHeight: number): Size {
    return {
      width: (cols + rows) * (tileWidth / 2),
      height: (cols + rows) * (tileHeight / 2),
    };
  }

  public static tileSizeIsoSquare(cols: number, rows: number, mapWidth: number, mapHeight: number): Size {
    return {
      width: (2 * mapWidth) / (cols + Math.abs(cols % 2)),
      height: (2 * mapHeight) / (rows + 1),
    };
  }

  public static tileSizeIsoRhombic(cols: number, rows: number, mapWidth: number, mapHeight: number): Size {
    return {
      width: (2 * mapWidth) / (cols + rows),
      height: (2 * mapHeight) / (cols + rows),
    };
  }
}
