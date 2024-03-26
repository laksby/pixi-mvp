import { ColorMatrixFilter, Container, Filter } from 'pixi.js';

export abstract class FilterUtils {
  public static hover(container: Container): void {
    const hoverFilter = FilterUtils.attach(container, new ColorMatrixFilter());
    hoverFilter.brightness(1.2, true);
    hoverFilter.enabled = false;

    container.on('mouseover', () => {
      hoverFilter.enabled = true;
    });

    container.on('mouseleave', () => {
      hoverFilter.enabled = false;
    });
  }

  public static attach<T extends Filter>(container: Container, filter: T): T {
    container.filters = [...((container.filters as []) || []), filter];

    return filter;
  }

  public static remove(container: Container, filter: Filter): void {
    if (container.filters) {
      container.filters = (container.filters as []).filter(f => f !== filter);
    }
  }
}
