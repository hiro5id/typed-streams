import * as NodeStream from 'stream';

export abstract class Writable<In> extends NodeStream.Writable {
  // noinspection JSUnusedGlobalSymbols
  public 'typechecking-field': In | undefined = undefined;

  // noinspection TypeScriptAbstractClassConstructorCanBeMadeProtected
  constructor(opts = {}) {
    super(opts);
  }

  public abstract _write(chunk: In, encoding: string, callback: (error?: Error | null) => void): void;
}
