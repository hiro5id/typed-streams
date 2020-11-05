/**
 * The generic types idea was based on the MIT licensed project https://github.com/forbesmyester/stronger-typed-streams
 * Originally published by Matt Forrester https://github.com/forbesmyester
 * Types improved and additional features implemented by Roberto Sebestyen roberto@sebestyen.ca https://github.com/hiro5id
 */
import * as NodeStream from 'stream';
import { commonPipe } from './common-pipe';
import { commonToPromiseFinish } from './common-to-promise-finish';
import { Transform } from './stream-transform-typed';
import { Writable } from './stream-writable-typed';

export abstract class Duplex<In, Out> extends NodeStream.Duplex {
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

  public push(chunk: Out | null, encoding?: BufferEncoding): boolean {
    return super.push(chunk, encoding);
  }

  public pipe<NextDuplexOut>(destination: Duplex<Out, NextDuplexOut>, options?: { end?: boolean }): Duplex<Out, NextDuplexOut>;
  public pipe<NextTransformOut>(destination: Transform<Out, NextTransformOut>, options?: { end?: boolean }): Transform<Out, NextTransformOut>;
  public pipe(destination: Writable<Out>, options?: { end?: boolean }): Writable<Out>;
  public pipe(destination: NodeJS.WritableStream, options?: { end?: boolean }): NodeJS.WritableStream {
    const returnStream = super.pipe(destination, options);
    return commonPipe.call(this, returnStream);
  }

  /**
   * Syntactic sugar to easily add error handlers between pipe stages
   * @param func - the error function
   */
  public err(func: (err: any) => void): Duplex<In, Out> {
    this.on('error', func);
    return this;
  }

  public toPromiseFinish(): Promise<void> {
    return commonToPromiseFinish.call(this);
  }
}
