import { Container } from 'pixi.js';

export abstract class ContainerUtils {
  public static byLabel(label: string, container: Container): Container | undefined {
    if (container.label === label) {
      return container;
    }

    for (const child of container.children) {
      const match = ContainerUtils.byLabel(label, child);

      if (match) {
        return match;
      }
    }

    return undefined;
  }
}
