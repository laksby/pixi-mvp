import { TextStyleOptions } from 'pixi.js';

export interface ViewContext {
  model: unknown;
  textStyles: Map<string, TextStyleOptions>;
}
