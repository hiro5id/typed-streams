import { AggregationCursor, Cursor } from 'mongodb';
import { commonPipe } from './common-pipe';
import { Readable } from './stream-readable-typed';

export function MongoToReadable<T>(mongoStream: Cursor<T> | AggregationCursor<T>, name: string, throwErrorForTesting = false): Readable<T> {
  (mongoStream as any).name = name;
  (mongoStream as any).super = mongoStream.pipe;
  (mongoStream as any).pipe = function (destination: NodeJS.WritableStream, options?: { end?: boolean }) {
    const returnStream = (mongoStream as any).super(destination, options);
    return commonPipe.call(this, returnStream, throwErrorForTesting);
  };
  return mongoStream as any;
}
