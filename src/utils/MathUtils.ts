import { PointData, Size } from 'pixi.js';

export abstract class MathUtils {
  public static lerp2D(from: PointData, to: PointData, amount: number): PointData {
    return {
      x: (1 - amount) * from.x + amount * to.x,
      y: (1 - amount) * from.y + amount * to.y,
    };
  }

  public static oscillate(from: number, to: number, amount: number) {
    const amplitude = (to - from) / 2;
    return from + amplitude * Math.sin(2 * Math.PI * amount);
  }

  public static sizeProportional(base: Size, input: Partial<Size>): Size {
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

  public static sizeFitWidth(widthToFit: number, input: Size): Size {
    const width = Math.min(widthToFit, input.width);
    return MathUtils.sizeProportional(input, { width });
  }
}
