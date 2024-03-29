import { Container } from 'pixi.js';

export interface IElement {
  initializeElement(parent: Container): Promise<void>;
  destroyElement(): void;
}
