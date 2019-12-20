/**
 * Copyright Notice:  This was based on the MIT licensed project https://github.com/forbesmyester/stronger-typed-streams
 * Originally published by Matt Forrester https://github.com/forbesmyester
 * Modified by Roberto Sebestyen roberto@sebestyen.ca https://github.com/hiro5id
 */
import * as NodeStream from 'stream';
import { Duplex } from './stream-duplex-typed';
import { Writable } from './stream-writable-typed';

export abstract class Transform<In, Out> extends NodeStream.Transform {
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
  public err(func: (err: string) => void): Transform<In, Out> {
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
