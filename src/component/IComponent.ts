import { Container } from 'pixi.js';

export interface IComponent {
  initializeComponent(parent: Container): Promise<void>;
  destroyComponent(): void;
}
