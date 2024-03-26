import { Application, Container } from 'pixi.js';

export interface IView {
  container: Container;
  initializeView(app: Application, parent: Container, model: unknown): Promise<void>;
  refreshView(parent: Container): Promise<void>;
}
