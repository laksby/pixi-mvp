import { SoundSourceMap, sound } from '@pixi/sound';
import FontFaceObserver from 'fontfaceobserver';
import { Application, ApplicationOptions, Assets, Container, TextStyleOptions, UnresolvedAsset } from 'pixi.js';
import { Camera } from '../camera';
import { ErrorUtils, FunctionUtils } from '../utils';
import { IView } from './IView';
import { ViewContext } from './types/ViewContext';

export type GameApplicationOptions = Omit<Partial<ApplicationOptions>, 'canvas' | 'resizeTo'>;

export abstract class BaseGame<M> {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _app: Application;
  private readonly _camera: Camera;
  private _model?: M;

  constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    this._app = new Application();
    this._camera = new Camera(this._app);
  }

  public get camera(): Camera {
    return this._camera;
  }

  public get model(): M {
    return this._model || ErrorUtils.notInitialized(this, 'Model');
  }

  public async initializeGame(): Promise<void> {
    const options = this.createOptions();

    await this.app.init({
      canvas: this.canvas,
      resizeTo: window,
      ...options,
    });

    const assets = this.getAssets();
    const sounds = this.getSounds();
    const fonts = this.getFonts();
    const textStyles = this.getTextStyles();

    assets.forEach(asset => Assets.add(asset));
    sound.add(sounds);

    await Promise.all(fonts.map(fontName => new FontFaceObserver(fontName).load()));

    this._model = this.createModel();
    const sceneView = this.createSceneView();
    const fixedView = this.createFixedView();

    const viewContext: ViewContext = {
      model: this.model,
      textStyles: new Map(Object.entries(textStyles)),
    };

    await Promise.all([
      sceneView.initializeView(this, this.app.stage, viewContext),
      fixedView ? fixedView.initializeView(this, this.app.stage, viewContext) : undefined,
    ]);

    this._camera.initializeCamera(sceneView.container);
    this.onCameraInitialize(sceneView.container);

    const resize = FunctionUtils.debounce(() => {
      sceneView.refreshView(this.app.stage);

      if (fixedView) {
        fixedView.refreshView(this.app.stage);
      }
    }, 300);

    window.addEventListener('resize', resize);

    await this.onReady();
  }

  public get canvas(): HTMLCanvasElement {
    return this._canvas;
  }

  public get app(): Application {
    return this._app;
  }

  protected abstract createOptions(): GameApplicationOptions;
  protected abstract createModel(): M;
  protected abstract createSceneView(): IView;

  protected createFixedView(): IView | undefined {
    // Virtual
    return undefined;
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

  protected getTextStyles(): Record<string, TextStyleOptions> {
    // Virtual
    return {};
  }

  protected onCameraInitialize(_rootContainer: Container): void {
    // Virtual
  }

  protected onReady(): void | Promise<void> {
    // Virtual
  }
}
