import { Container } from 'pixi.js';
import { IComponent } from '../component';
import { IView } from './IView';

export class ViewComponent implements IComponent {
  private readonly _parentView: IView;
  private readonly _view: IView;

  constructor(parentView: IView, view: IView) {
    this._parentView = parentView;
    this._view = view;
  }

  public async initializeComponent(parent: Container): Promise<void> {
    await this._view.initializeView(this._parentView.app, parent, this._parentView.context);
  }
}
