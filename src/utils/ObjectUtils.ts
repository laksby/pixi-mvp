export abstract class ObjectUtils {
  public static mixIn(target: object, mix: object): void {
    Object.entries(mix).forEach(([key, value]) => {
      Reflect.set(target, key, value);
    });
  }
}
