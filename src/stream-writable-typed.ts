/**
 * The generic types idea was based on the MIT licensed project https://github.com/forbesmyester/stronger-typed-streams
 * Originally published by Matt Forrester https://github.com/forbesmyester
 * Types improved and additional features implemented by Roberto Sebestyen roberto@sebestyen.ca https://github.com/hiro5id
 */
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

  private readonly _baseWrite: (chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void) => void;
  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(opts = {}) {
    super(opts);
    this._baseWrite = super._write;
  }

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

  /**
   * This callback gets called when a NULL value comes through the stream indicating the end of the stream
   * This optional function will be called before the stream closes, delaying the 'finish' event until callback is called. This is useful to close resources or write buffered data before a stream ends.
   */
  public _finalEx(callback: (error?: Error | null) => void): void {
    callback();
  }

  public _writeEx(chunk: In, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    this._baseWrite(chunk, encoding, callback);
  }

  public _write(chunk: In, encoding: BufferEncoding, callback: (error?: Error | null) => void): void {
    process.nextTick(() => {
      try {
        this._writeEx(chunk, encoding, callback);
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
