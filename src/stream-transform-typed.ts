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

  public _transformEx(chunk: In, encoding: string, callback: (error?: Error | null, data?: any) => void): void;
  public async _transformEx(chunk: In, encoding: string, callback?: (error?: Error | null, data?: any) => void): Promise<void> {
    try {
      await new Promise((resolve, reject) => {
        this._baseTransform(chunk, encoding, (err?: any) => {
          if (err != null) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    } catch (err) {
      if (callback != null) {
        callback(err);
        return;
      } else {
        throw err;
      }
    }

    if (callback != null) {
      callback();
    } else {
      return;
    }
  }

  /**
   * A callback function (optionally with an error argument and data) to be called when remaining data has been flushed.
   * This function MUST NOT be called by application code directly. It should be implemented by child classes, and called by the internal Readable class methods only.
   *
   * In some cases, a transform operation may need to emit an additional bit of data at the end of the stream. For example, a zlib compression stream will store an amount of internal state used to optimally compress the output. When the stream ends, however, that additional data needs to be flushed so that the compressed data will be complete.
   *
   * Custom Transform implementations may implement the transform._flush() method. This will be called when there is no more written data to be consumed, but before the 'end' event is emitted signaling the end of the Readable stream.
   *
   * Within the transform._flush() implementation, the readable.push() method may be called zero or more times, as appropriate. The callback function must be called when the flush operation is complete.
   *
   * The transform._flush() method is prefixed with an underscore because it is internal to the class that defines it, and should never be called directly by user programs.
   */
  public _flushEx(callback: (error?: Error | null, data?: any) => void): void {
    callback();
  }

  /**
   * This callback gets called when a NULL value comes through the stream indicating the end of the stream
   * This optional function will be called before the stream closes, delaying the 'finish' event until callback is called. This is useful to close resources or write buffered data before a stream ends.
   */
  public _finalEx(callback: (error?: Error | null) => void): void {
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
        const result = this._transformEx(chunk, encoding, callback);
        if (typeof result === 'object') {
          ((result as any) as Promise<void>)
            .then(() => {
              callback();
            })
            .catch((err) => {
              callback(err);
            });
        }
      } catch (err) {
        callback(err);
      }
    });
  }

  /**
   * A callback function (optionally with an error argument and data) to be called when remaining data has been flushed.
   * This function MUST NOT be called by application code directly. It should be implemented by child classes, and called by the internal Readable class methods only.
   *
   * In some cases, a transform operation may need to emit an additional bit of data at the end of the stream. For example, a zlib compression stream will store an amount of internal state used to optimally compress the output. When the stream ends, however, that additional data needs to be flushed so that the compressed data will be complete.
   *
   * Custom Transform implementations may implement the transform._flush() method. This will be called when there is no more written data to be consumed, but before the 'end' event is emitted signaling the end of the Readable stream.
   *
   * Within the transform._flush() implementation, the readable.push() method may be called zero or more times, as appropriate. The callback function must be called when the flush operation is complete.
   *
   * The transform._flush() method is prefixed with an underscore because it is internal to the class that defines it, and should never be called directly by user programs.
   */
  public _flush(callback: (error?: Error | null, data?: any) => void): void {
    process.nextTick(() => {
      try {
        this._flushEx(callback);
      } catch (err) {
        callback(err);
      }
    });
  }

  /**
   * This callback gets called when a NULL value comes through the stream indicating the end of the stream
   * This optional function will be called before the stream closes, delaying the 'finish' event until callback is called. This is useful to close resources or write buffered data before a stream ends.
   */
  public _final(callback: (error?: Error | null) => void): void {
    process.nextTick(() => {
      try {
        this._finalEx(callback);
      } catch (err) {
        callback(err);
      }
    });
  }
}
