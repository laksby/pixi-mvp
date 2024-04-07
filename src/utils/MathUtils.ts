import { Bounds, PointData, Size } from 'pixi.js';

export abstract class MathUtils {
  public static clamp(amount: number, from: number, to: number): number {
    return Math.min(Math.max(amount, from), to);
  }

  public static clamp2D(position: PointData, bounds: Bounds): PointData {
    return {
      x: MathUtils.clamp(position.x, bounds.minX, bounds.maxX),
      y: MathUtils.clamp(position.y, bounds.minY, bounds.maxY),
    };
  }

  public static clampRhombus(position: PointData, bounds: Bounds): PointData {
    const positionC = { x: bounds.minX + bounds.width / 2, y: bounds.minY + bounds.height / 2 };
    const positionT = { x: bounds.minX + bounds.width / 2, y: bounds.minY };
    const positionL = { x: bounds.minX, y: bounds.minY + bounds.height / 2 };
    const positionR = { x: bounds.maxX, y: bounds.minY + bounds.height / 2 };
    const positionB = { x: bounds.minX + bounds.width / 2, y: bounds.maxY };

    let minT: PointData = positionT;
    let maxB: PointData = positionB;
    let minL: PointData = positionL;
    let maxR: PointData = positionR;

    const x = MathUtils.clamp(position.x, positionL.x, positionR.x);
    const y = MathUtils.clamp(position.y, positionT.y, positionB.y);

    if (x < positionC.x) {
      minT = MathUtils.linesIntersection(positionL, positionT, { x, y }, { x, y: y - 1 });
      maxB = MathUtils.linesIntersection(positionL, positionB, { x, y }, { x, y: y + 1 });
    } else if (x > positionC.x) {
      minT = MathUtils.linesIntersection(positionR, positionT, { x, y }, { x, y: y - 1 });
      maxB = MathUtils.linesIntersection(positionR, positionB, { x, y }, { x, y: y + 1 });
    }

    return MathUtils.clamp2D({ x, y }, new Bounds(minL.x, minT.y, maxR.x, maxB.y));
  }

  public static inRange(amount: number, from: number, to: number): boolean {
    return amount >= from && amount <= to;
  }

  public static linesIntersection(start1: PointData, end1: PointData, start2: PointData, end2: PointData): PointData {
    const deltaX1 = end1.x - start1.x;
    const deltaX2 = end2.x - start2.x;
    const deltaY1 = end1.y - start1.y;
    const deltaY2 = end2.y - start2.y;

    return {
      x:
        (start1.y - start2.y + (start2.x * deltaY2) / deltaX2 - (start1.x * deltaY1) / deltaX1) /
        (deltaY2 / deltaX2 - deltaY1 / deltaX1),
      y:
        (start1.x - start2.x + (start2.y * deltaX2) / deltaY2 - (start1.y * deltaX1) / deltaY1) /
        (deltaX2 / deltaY2 - deltaX1 / deltaY1),
    };
  }

  public static lerp(from: number, to: number, amount: number): number {
    return (1 - amount) * from + amount * to;
  }

  public static lerp2D(from: PointData, to: PointData, amount: number): PointData {
    return {
      x: MathUtils.lerp(from.x, to.x, amount),
      y: MathUtils.lerp(from.y, to.y, amount),
    };
  }

  public static oscillate(from: number, to: number, amount: number) {
    const amplitude = (to - from) / 2;
    return from + amplitude * Math.sin(2 * Math.PI * amount);
  }

  public static proportion(base: Size, input: Partial<Size>): Size {
    if (input.width) {
      return {
        width: input.width,
        height: (base.height * input.width) / base.width,
      };
    } else if (input.height) {
      return {
        width: (base.width * input.height) / base.height,
        height: input.height,
      };
    } else {
      throw new Error('Either width or height should be provided');
    }
  }

  public static fitWidth(widthToFit: number, input: Size): Size {
    const width = Math.min(widthToFit, input.width);
    return MathUtils.proportion(input, { width });
  }
}
