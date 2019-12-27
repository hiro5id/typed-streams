import * as NodeStream from 'stream';
import { commonToPromiseFinish } from './common-to-promise-finish';

export abstract class Writable<In> extends NodeStream.Writable {
  // noinspection JSUnusedGlobalSymbols
  public 'typechecking-field': In | undefined = undefined;
  /**
   * give this stream a name so that we can easily reference it in logs
   * a common implementation would be:
   *   public readonly name: string = MyClass.name;
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
  public err(func: (err: any) => void): Writable<In> {
    this.on('error', func);
    return this;
  }

  public toPromiseFinish(): Promise<void> {
    return commonToPromiseFinish.call(this);
  }
}
