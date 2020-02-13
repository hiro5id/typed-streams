/* tslint:disable:only-arrow-functions */
import {expect} from 'chai';
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

  it('converts mongo stream to typed stream', async function() {
    const db = await mongodbMemoryServerCreator.getRandomDb();
    await db.collection('test').insertMany([{name: "rob"}]);
    const result = await db.collection('test').find({}).toArray();
    expect(result[0].name).eql("rob");
  })
});