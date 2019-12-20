import * as NodeStream from 'stream';
import { Writable } from './stream-writable-typed';
import { Transform } from './typed-streams';

export abstract class Duplex<In, Out> extends NodeStream.Duplex {
  // noinspection JSUnusedGlobalSymbols
  public 'typechecking-field': In | undefined = undefined;

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
}
