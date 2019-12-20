import * as NodeStream from 'stream';

export abstract class Writable<In> extends NodeStream.Writable {
  // noinspection JSUnusedGlobalSymbols
  public 'typechecking-field': In | undefined = undefined;
  /**
   * give this stream transform a name so that we can easily reference it in logs
   */
  public abstract readonly name: string;

  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(opts = {}) {
    super(opts);
  }

  public abstract _write(chunk: In, encoding: string, callback: (error?: Error | null) => void): void;

  /**
   * Syntactic sugar to easily add error handlers between pipe stages
   * @param func - the error function
   */
  public err(func: (err: string) => void): Writable<In> {
    this.on('error', func);
    return this;
  }

  public toPromiseFinish(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.on('finish', () => {
        resolve();
      });
      this.on('error', err => {
        reject(err);
      });
    });
  }
}
