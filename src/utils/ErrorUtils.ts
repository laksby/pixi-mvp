export abstract class ErrorUtils {
  public static notInitialized(host: object, target: string): never {
    throw new Error(`${target} not initialized inside ${Object.getPrototypeOf(host).constructor.name}`);
  }

  public static notExists(host: object, target: string): never {
    throw new Error(`${target} not exists inside ${Object.getPrototypeOf(host).constructor.name}`);
  }
}
