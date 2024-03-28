import { Application, Container } from 'pixi.js';
import { ViewContext } from './types/ViewContext';

export interface IView {
  app: Application;
  container: Container;
  context: ViewContext;
  initializeView(app: Application, parent: Container, context: ViewContext): Promise<void>;
  refreshView(parent: Container): Promise<void>;
  destroyView(): void;
}
