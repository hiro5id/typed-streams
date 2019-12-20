import * as NodeStream from 'stream';
import { Duplex } from './stream-duplex-typed';
import { Writable } from './stream-writable-typed';
import { Transform } from './typed-streams';

export abstract class Readable<Out> extends NodeStream.Readable {
  // noinspection JSUnusedGlobalSymbols
  public 'typechecking-field': Out | undefined = undefined;

  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(opts = {}) {
    super(opts);
  }

  public abstract _read(size: number): any;

  public push(chunk: Out | null, encoding?: string): boolean {
    return super.push(chunk, encoding);
  }

  public pipe<NextDuplexOut>(destination: Duplex<Out, NextDuplexOut>, options?: { end?: boolean }): Duplex<Out, NextDuplexOut>;
  public pipe<NextTransformOut>(destination: Transform<Out, NextTransformOut>, options?: { end?: boolean }): Transform<Out, NextTransformOut>;
  public pipe(destination: Writable<Out>, options?: { end?: boolean }): Writable<Out>;
  public pipe(destination: NodeJS.WritableStream, options?: { end?: boolean }): NodeJS.WritableStream {
    return super.pipe(destination, options);
  }
}
