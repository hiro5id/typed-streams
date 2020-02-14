/* tslint:disable:only-arrow-functions member-access */
import {expect} from 'chai';
import { MongoToReadable, Writable } from '../src';
import { MongodbMemoryServerCreator } from './lib/mongodb-memory-server-creator';

describe('mongo-stream', function() {
  this.timeout(100000);
  let mongodbMemoryServerCreator: MongodbMemoryServerCreator;

  beforeEach(async function(): Promise<void> {
    mongodbMemoryServerCreator = new MongodbMemoryServerCreator();
    await mongodbMemoryServerCreator.start();
  });

  afterEach(async () => {
    await mongodbMemoryServerCreator.stop();
  });

  it('mongo converted to typed stream catches errors appropriately', async function() {
    const messages: string[] = [];
    const db = await mongodbMemoryServerCreator.getRandomDb();
    await db.collection('test').insertMany([{name: "rob"}, {name: "rob2"}]);
    const result =  db.collection('test').find({});
    const resultReadable = MongoToReadable<IRobTestCollection>(result,"testCollection", true);

    let error = null;
    try {
      await resultReadable
        .pipe(new RobTestCollectionWriter(messages))
        .toPromiseFinish();
    } catch (err) {
      error = err;
    }

    expect(error != null).equals(true, "expecting error to be thrown");
    expect(error?.message).eql('Error in testCollection testing')

  });

  it('mongo converted to typed stream streams appropriately', async function() {
    const messages: string[] = [];
    const db = await mongodbMemoryServerCreator.getRandomDb();
    await db.collection('test').insertMany([{name: "rob"}, {name: "rob2"}]);
    const result =  db.collection('test').find({});
    const resultReadable = MongoToReadable<IRobTestCollection>(result,"testCollection");

    await resultReadable
      .pipe(new RobTestCollectionWriter(messages))
      .toPromiseFinish();

    expect(messages).eql([ 'wrote rob', 'wrote rob2' ])

  })

});


interface IRobTestCollection {
  name: string;
}


class RobTestCollectionWriter extends Writable<IRobTestCollection> {
  public readonly name: string = RobTestCollectionWriter.name;

  constructor(private readonly messages: string[]) {
    super({ objectMode: true });
  }

  _writeEx(chunk: IRobTestCollection, _encoding: string, callback: (error?: (Error | null)) => void): void {
    this.messages.push(`wrote ${chunk.name}`);
    callback();
  }
}