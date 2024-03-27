export abstract class ErrorUtils {
  public static notInitialized(host: object, target: string): never {
    throw new Error(`${target} not initialized inside ${Object.getPrototypeOf(host).constructor.name}`);
  }
}
