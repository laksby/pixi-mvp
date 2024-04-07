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

  public static randomEnumWithWeights<E extends string>(weightedEnum: Record<E, number>): E {
    const entries = Object.entries(weightedEnum) as [E, number][];
    const weights = entries.map(([, weight]) => weight);

    const weightSum = weights.reduce((acc, value) => acc + value, 0);
    const probabilities = weights.map(value => value / weightSum);

    const ranges = probabilities.reduce<[number, number][]>((acc, p, index, arr) => {
      const prevMax = index > 0 ? acc[index - 1][1] : 0;
      const currentMax = index < arr.length - 1 ? prevMax + p : 1;
      return acc.concat([[prevMax, currentMax]]);
    }, []);

    const test = GeneratorUtils.randomNumber(0, 1);
    const rangeIndex = ranges.findIndex(range => test >= range[0] && test <= range[1]) ?? ranges.length - 1;

    return entries[rangeIndex][0];
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
