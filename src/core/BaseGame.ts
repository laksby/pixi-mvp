import { SoundSourceMap, sound } from '@pixi/sound';
import FontFaceObserver from 'fontfaceobserver';
import { Application, ApplicationOptions, Assets, UnresolvedAsset } from 'pixi.js';
import { FunctionUtils } from '../utils';
import { IView } from './IView';

export abstract class BaseGame<M> {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _app: Application;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._app = new Application();
  }

  public async initializeGame(options: Omit<Partial<ApplicationOptions>, 'canvas' | 'resizeTo'>): Promise<void> {
    await this.app.init({
      canvas: this.canvas,
      resizeTo: window,
      ...options,
    });

    const assets = this.getAssets();
    const sounds = this.getSounds();
    const fonts = this.getFonts();

    assets.forEach(asset => Assets.add(asset));
    sound.add(sounds);

    await Promise.all(fonts.map(fontName => new FontFaceObserver(fontName).load()));

    const model = this.createModel();
    const rootView = this.createRootView(model);

    await rootView.initializeView(this.app, this.app.stage, model);

    const resize = FunctionUtils.debounce(() => rootView.refreshView(this.app.stage), 300);
    window.addEventListener('resize', resize);
  }

  public get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  public get app(): Application {
    return this._app;
  }

  protected getAssets(): UnresolvedAsset[] {
    // Virtual
    return [];
  }

  protected getSounds(): SoundSourceMap {
    // Virtual
    return {};
  }

  protected getFonts(): string[] {
    // Virtual
    return [];
  }

  protected abstract createModel(): M;
  protected abstract createRootView(model: M): IView;
}
