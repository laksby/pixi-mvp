export interface IPresenter {
  initializePresenter(): Promise<void>;
  refreshView(): Promise<void>;
}
