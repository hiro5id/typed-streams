/**
 * The generic types idea was based on the MIT licensed project https://github.com/forbesmyester/stronger-typed-streams
 * Originally published by Matt Forrester https://github.com/forbesmyester
 * Types improved and additional features implemented by Roberto Sebestyen roberto@sebestyen.ca https://github.com/hiro5id
 */
import * as NodeStream from 'stream';
import { commonPipe } from './common-pipe';
import { commonToPromiseFinish } from './common-to-promise-finish';
import { Duplex } from './stream-duplex-typed';
import { Writable } from './stream-writable-typed';

export abstract class Transform<In, Out> extends NodeStream.Transform {
  // noinspection JSUnusedGlobalSymbols
  public 'typechecking-field': In | undefined = undefined;
  /**
   * give this stream a name so that we can easily reference it in logs
   * a common implementation would be:
   *   public readonly name: string = MyClass.name;
   */
  public abstract readonly name: string;
  private readonly _baseTransform: (chunk: In, encoding: string, callback: NodeStream.TransformCallback) => void;
  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(opts = {}) {
    super(opts);
    this._baseTransform = super._transform;
  }

  public push(chunk: Out | null, encoding?: string): boolean {
    return super.push(chunk, encoding);
  }

  public _transformEx(chunk: In, encoding: string, callback: (error?: Error | null, data?: any) => void): void {
    this._baseTransform(chunk, encoding, callback);
  }

  public _flushEx(callback: (error?: Error | null, data?: any) => void): void {
    callback();
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
  public err(func: (err: any) => void): Transform<In, Out> {
    this.on('error', func);
    return this;
  }

  public toPromiseFinish(): Promise<void> {
    return commonToPromiseFinish.call(this);
  }

  public _transform(chunk: In, encoding: string, callback: (error?: Error | null, data?: any) => void): void {
    process.nextTick(() => {
      try {
        this._transformEx(chunk, encoding, callback);
      } catch (err) {
        callback(err);
      }
    });
  }

  public _flush(callback: (error?: Error | null, data?: any) => void): void {
    process.nextTick(() => {
      try {
        this._flushEx(callback);
      } catch (err) {
        callback(err);
      }
    });
  }
}
