import { Application, Container } from 'pixi.js';
import { BaseGame } from './BaseGame';
import { ViewContext } from './types/ViewContext';

export interface IView {
  game: BaseGame<unknown>;
  app: Application;
  container: Container;
  context: ViewContext;
  initializeView(game: BaseGame<unknown>, parent: Container, context: ViewContext): Promise<void>;
  refreshView(parent: Container): Promise<void>;
  destroyView(): void;
  updateElements(): Promise<void>;
  hide(): void;
  show(): void;
}
