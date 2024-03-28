import { PointData } from 'pixi.js';
import { MapFunction } from '../types';

export abstract class GeneratorUtils {
  public static array<T>(length: number, mapFunction?: MapFunction<number, T>): T[] {
    const array = new Array(length).fill(0);
    return mapFunction ? array.map((_, index) => mapFunction(index)) : array;
  }

  public static randomEnum<E>(enumObject: Record<string, E>): E {
    const values = Object.values(enumObject);
    return values[GeneratorUtils.randomInteger(0, values.length - 1)];
  }

  public static randomPoint2D(min: PointData, max: PointData): PointData {
    return {
      x: GeneratorUtils.randomNumber(min.x, max.x),
      y: GeneratorUtils.randomNumber(min.y, max.y),
    };
  }

  public static randomInteger(min: number, max: number): number {
    return Math.round(GeneratorUtils.randomNumber(min, max));
  }

  public static randomNumber(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
