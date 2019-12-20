import * as NodeStream from 'stream';
import { Transform } from './stream-transform-typed';
import { Writable } from './stream-writable-typed';

export abstract class Duplex<In, Out> extends NodeStream.Duplex {
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

  public push(chunk: Out | null, encoding?: string): boolean {
    return super.push(chunk, encoding);
  }

  public pipe<NextDuplexOut>(destination: Duplex<Out, NextDuplexOut>, options?: { end?: boolean }): Duplex<Out, NextDuplexOut>;
  public pipe<NextTransformOut>(destination: Transform<Out, NextTransformOut>, options?: { end?: boolean }): Transform<Out, NextTransformOut>;
  public pipe(destination: Writable<Out>, options?: { end?: boolean }): Writable<Out>;
  public pipe(destination: NodeJS.WritableStream, options?: { end?: boolean }): NodeJS.WritableStream {
    return super.pipe(destination, options);
  }

  /**
   * Syntactic sugar to easily add error handlers between pipe stages
   * @param func - the error function
   */
  public err(func: (err: string) => void): Duplex<In, Out> {
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
