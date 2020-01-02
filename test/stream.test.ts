/* tslint:disable:max-classes-per-file */
import { expect } from 'chai';
import { Readable, Transform, Writable } from '../src';

describe('stream', () => {

  it('parallel streaming, 2 streams and await their finish', async () => {
    const messages: string[] = [];

    const carFactory = new NewCarFactory("factory-A", 1, 20, messages);
    const carFactory2 = new NewCarFactory("factory-B", 21, 40, messages);
    const newCarBuyer = new NewCarBuyer(3, messages);
    const newCarThief = new NewCarThief(messages);
    const stolenCarBuyer = new StolenCarBuyer(5, messages);
    const usedCarBuyer = new UsedCarBuyer(10, messages);

    const pipe1: Promise<void> = carFactory.pipe(newCarThief).pipe(stolenCarBuyer).pipe(usedCarBuyer).toPromiseFinish();
    const pipe2 = carFactory2.pipe(newCarBuyer).toPromiseFinish();

    await Promise.all([pipe1, pipe2]);

    /**
     * Uncomment below line to demonstrate typescript give an error for "newCarThief"
     * because a used car cannot be piped into a thief that only wants to steal new cars
     */
    // carFactory.pipe(newCarBuyer).pipe(newCarThief);


    expect(messages).eql([
      "Stole new car number 1",
      "factory-A factory produced car# 1",
      "factory-B factory produced car# 21",
      "shopping for stolen car# 1",
      "shopping for NEW car#  21",
      "Stole new car number 2",
      "factory-A factory produced car# 2",
      "factory-B factory produced car# 22",
      "shopping for stolen car# 2",
      "shopping for NEW car#  22",
      "Stole new car number 3",
      "factory-A factory produced car# 3",
      "factory-B factory produced car# 23",
      "shopping for stolen car# 3",
      "shopping for NEW car#  23",
      "Stole new car number 4",
      "factory-A factory produced car# 4",
      "purchased 3 car numbers: 21,22,23",
      "factory-B factory produced car# 24",
      "shopping for stolen car# 4",
      "shopping for NEW car#  24",
      "Stole new car number 5",
      "factory-A factory produced car# 5",
      "factory-B factory produced car# 25",
      "shopping for stolen car# 5",
      "shopping for NEW car#  25",
      "purchased STOLEN 5 car numbers: 1,2,3,4,5",
      "Stole new car number 6",
      "factory-A factory produced car# 6",
      "factory-B factory produced car# 26",
      "shopping for USED car#  1,2,3,4,5",
      "shopping for stolen car# 6",
      "shopping for NEW car#  26",
      "Stole new car number 7",
      "factory-A factory produced car# 7",
      "purchased 3 car numbers: 24,25,26",
      "factory-B factory produced car# 27",
      "shopping for stolen car# 7",
      "shopping for NEW car#  27",
      "Stole new car number 8",
      "factory-A factory produced car# 8",
      "factory-B factory produced car# 28",
      "shopping for stolen car# 8",
      "shopping for NEW car#  28",
      "Stole new car number 9",
      "factory-A factory produced car# 9",
      "factory-B factory produced car# 29",
      "shopping for stolen car# 9",
      "shopping for NEW car#  29",
      "Stole new car number 10",
      "factory-A factory produced car# 10",
      "purchased 3 car numbers: 27,28,29",
      "factory-B factory produced car# 30",
      "shopping for stolen car# 10",
      "shopping for NEW car#  30",
      "purchased STOLEN 5 car numbers: 6,7,8,9,10",
      "Stole new car number 11",
      "factory-A factory produced car# 11",
      "factory-B factory produced car# 31",
      "shopping for USED car#  6,7,8,9,10",
      "shopping for stolen car# 11",
      "shopping for NEW car#  31",
      "purchased used 10 car numbers: 1,2,3,4,5,6,7,8,9,10",
      "Stole new car number 12",
      "factory-A factory produced car# 12",
      "factory-B factory produced car# 32",
      "shopping for stolen car# 12",
      "shopping for NEW car#  32",
      "Stole new car number 13",
      "factory-A factory produced car# 13",
      "purchased 3 car numbers: 30,31,32",
      "factory-B factory produced car# 33",
      "shopping for stolen car# 13",
      "shopping for NEW car#  33",
      "Stole new car number 14",
      "factory-A factory produced car# 14",
      "factory-B factory produced car# 34",
      "shopping for stolen car# 14",
      "shopping for NEW car#  34",
      "Stole new car number 15",
      "factory-A factory produced car# 15",
      "factory-B factory produced car# 35",
      "shopping for stolen car# 15",
      "shopping for NEW car#  35",
      "purchased STOLEN 5 car numbers: 11,12,13,14,15",
      "Stole new car number 16",
      "factory-A factory produced car# 16",
      "purchased 3 car numbers: 33,34,35",
      "factory-B factory produced car# 36",
      "shopping for USED car#  11,12,13,14,15",
      "shopping for stolen car# 16",
      "shopping for NEW car#  36",
      "Stole new car number 17",
      "factory-A factory produced car# 17",
      "factory-B factory produced car# 37",
      "shopping for stolen car# 17",
      "shopping for NEW car#  37",
      "Stole new car number 18",
      "factory-A factory produced car# 18",
      "factory-B factory produced car# 38",
      "shopping for stolen car# 18",
      "shopping for NEW car#  38",
      "Stole new car number 19",
      "factory-A factory produced car# 19",
      "purchased 3 car numbers: 36,37,38",
      "factory-B factory produced car# 39",
      "shopping for stolen car# 19",
      "shopping for NEW car#  39",
      "Stole new car number 20",
      "factory-A factory produced car# 20",
      "factory-B factory produced car# 40",
      "shopping for stolen car# 20",
      "shopping for NEW car#  40",
      "purchased STOLEN 5 car numbers: 16,17,18,19,20",
      "factory-A factory finished producing cars 1...20",
      "factory-B factory finished producing cars 21...40",
      "shopping for USED car#  16,17,18,19,20",
      "purchased used 10 car numbers: 11,12,13,14,15,16,17,18,19,20",
      "purchased 2 car numbers: 39,40"
    ]);
  });


  it('Error is bubbled up properly when stream is implemented with extended(Ex) helpers', async () => {
    const messages: string[] = [];

    const carFactoryA = new NewCarFactory("factory-A", 1, 20, messages);
    const carFactoryB = new NewCarFactory("factory-B", 21, 40, messages);
    const newCarBuyer = new NewCarBuyer(3, messages);
    const newCarThief = new NewCarThief(messages);
    const stolenCarBuyer = new StolenCarBuyerErrorEx(5, messages);
    const usedCarBuyer = new UsedCarBuyer(10, messages);

    const pipe1: Promise<void> = carFactoryA.pipe(newCarThief).pipe(stolenCarBuyer).pipe(usedCarBuyer).toPromiseFinish();
    const pipe2 = carFactoryB.pipe(newCarBuyer).toPromiseFinish();
    let caughtError: Error;

    try {
      await Promise.all([pipe1, pipe2]);
    } catch(err) {
      caughtError = err;
    }

    expect(caughtError!.message).eql("Error in StolenCarBuyer this is a test");
    expect(messages).eql([
      "Stole new car number 1",
      "factory-A factory produced car# 1",
      "factory-B factory produced car# 21",
      "shopping for stolen car# 1",
      "shopping for NEW car#  21",
      "factory-B factory produced car# 22",
      "shopping for NEW car#  22",
      "factory-B factory produced car# 23",
      "shopping for NEW car#  23",
      "purchased 3 car numbers: 21,22,23",
      "factory-B factory produced car# 24",
      "shopping for NEW car#  24",
      "factory-B factory produced car# 25",
      "shopping for NEW car#  25",
      "factory-B factory produced car# 26",
      "shopping for NEW car#  26",
      "purchased 3 car numbers: 24,25,26",
      "factory-B factory produced car# 27",
      "shopping for NEW car#  27",
      "factory-B factory produced car# 28",
      "shopping for NEW car#  28",
      "factory-B factory produced car# 29",
      "shopping for NEW car#  29",
      "purchased 3 car numbers: 27,28,29",
      "factory-B factory produced car# 30",
      "shopping for NEW car#  30",
      "factory-B factory produced car# 31",
      "shopping for NEW car#  31",
      "factory-B factory produced car# 32",
      "shopping for NEW car#  32",
      "purchased 3 car numbers: 30,31,32",
      "factory-B factory produced car# 33",
      "shopping for NEW car#  33",
      "factory-B factory produced car# 34",
      "shopping for NEW car#  34",
      "factory-B factory produced car# 35",
      "shopping for NEW car#  35",
      "purchased 3 car numbers: 33,34,35",
      "factory-B factory produced car# 36",
      "shopping for NEW car#  36",
      "factory-B factory produced car# 37",
      "shopping for NEW car#  37",
      "factory-B factory produced car# 38",
      "shopping for NEW car#  38",
      "purchased 3 car numbers: 36,37,38",
      "factory-B factory produced car# 39",
      "shopping for NEW car#  39",
      "factory-B factory produced car# 40",
      "shopping for NEW car#  40",
      "factory-B factory finished producing cars 21...40",
      "purchased 2 car numbers: 39,40"
    ]);
  });

  it('serial streaming, 2 streams one after the other', async () => {
    const messages: string[] = [];


    const carFactory1 = new NewCarFactory("factory-A", 1, 10, messages);
    const carFactory2 = new NewCarFactory("factory-B", 11, 20, messages);
    const newCarBuyer = new NewCarBuyer(3, messages);
    const newCarThief = new NewCarThief(messages);
    const stolenCarBuyer = new StolenCarBuyer(5, messages);
    const usedCarBuyer = new UsedCarBuyer(10, messages);

    await carFactory1
      .pipe(newCarThief)
      .pipe(stolenCarBuyer)
      .pipe(usedCarBuyer)
      .toPromiseFinish();

    messages.push('Finished Stream 1');

    await carFactory2.pipe(newCarBuyer).toPromiseFinish();
    messages.push('Finished Stream 2');
    expect(messages).eql([
      "Stole new car number 1",
      "factory-A factory produced car# 1",
      "shopping for stolen car# 1",
      "Stole new car number 2",
      "factory-A factory produced car# 2",
      "shopping for stolen car# 2",
      "Stole new car number 3",
      "factory-A factory produced car# 3",
      "shopping for stolen car# 3",
      "Stole new car number 4",
      "factory-A factory produced car# 4",
      "shopping for stolen car# 4",
      "Stole new car number 5",
      "factory-A factory produced car# 5",
      "shopping for stolen car# 5",
      "purchased STOLEN 5 car numbers: 1,2,3,4,5",
      "Stole new car number 6",
      "factory-A factory produced car# 6",
      "shopping for USED car#  1,2,3,4,5",
      "shopping for stolen car# 6",
      "Stole new car number 7",
      "factory-A factory produced car# 7",
      "shopping for stolen car# 7",
      "Stole new car number 8",
      "factory-A factory produced car# 8",
      "shopping for stolen car# 8",
      "Stole new car number 9",
      "factory-A factory produced car# 9",
      "shopping for stolen car# 9",
      "Stole new car number 10",
      "factory-A factory produced car# 10",
      "shopping for stolen car# 10",
      "purchased STOLEN 5 car numbers: 6,7,8,9,10",
      "factory-A factory finished producing cars 1...10",
      "shopping for USED car#  6,7,8,9,10",
      "purchased used 10 car numbers: 1,2,3,4,5,6,7,8,9,10",
      "Finished Stream 1",
      "factory-B factory produced car# 11",
      "shopping for NEW car#  11",
      "factory-B factory produced car# 12",
      "shopping for NEW car#  12",
      "factory-B factory produced car# 13",
      "shopping for NEW car#  13",
      "purchased 3 car numbers: 11,12,13",
      "factory-B factory produced car# 14",
      "shopping for NEW car#  14",
      "factory-B factory produced car# 15",
      "shopping for NEW car#  15",
      "factory-B factory produced car# 16",
      "shopping for NEW car#  16",
      "purchased 3 car numbers: 14,15,16",
      "factory-B factory produced car# 17",
      "shopping for NEW car#  17",
      "factory-B factory produced car# 18",
      "shopping for NEW car#  18",
      "factory-B factory produced car# 19",
      "shopping for NEW car#  19",
      "purchased 3 car numbers: 17,18,19",
      "factory-B factory produced car# 20",
      "shopping for NEW car#  20",
      "factory-B factory finished producing cars 11...20",
      "purchased 1 car numbers: 20",
      "Finished Stream 2"
    ]);

  });

  it('error is thrown by transform stream and caught at the end of await and connected upstreams/downstreams are destroyed', async () => {
    // arrange
    const messages: string[] = [];
    const carFactory = new NewCarFactory("factory-A", 1, 20, messages);
    const newCarBuyerErr = new NewCarBuyerErr(3, messages);
    const usedCarBuyer = new UsedCarBuyer(10, messages);
    const usedCarCrusher = new UsedCarCrusher(messages);
    let usedCarBuyerCaughtErr: Error| null = null;
    let awaitCaughtErr: Error | null = null;
    let carFactoryCaughtErr: Error| null = null;
    let newCarBuyerCaughtErr: Error| null = null;
    let usedCarCrusherCaughtErr: Error| null = null;

    // action
    try {
      await carFactory
        .err(err => {
          carFactoryCaughtErr = err;
        })
        .pipe(newCarBuyerErr)
        .err(err => {
          newCarBuyerCaughtErr = err;
        })
        .pipe(usedCarBuyer)
        .err(err => {
          usedCarBuyerCaughtErr = err;
        })
        .pipe(usedCarCrusher)
        .err(err => {
          usedCarCrusherCaughtErr = err;
        })
        .toPromiseFinish();
    } catch (err) {
      awaitCaughtErr = err;
    }

    // assert
    expect(carFactoryCaughtErr).to.equal(null);
    expect(usedCarBuyerCaughtErr).to.equal(null);
    expect(usedCarCrusherCaughtErr).to.equal(null);
    expect(newCarBuyerCaughtErr!.message).eql('Error in NewCarBuyerErr Purposeful error to test error in transform stream');
    expect(awaitCaughtErr!.message).eql('Error in NewCarBuyerErr Purposeful error to test error in transform stream');
    expect(messages).eql([
      "factory-A factory produced car# 1",
      "shopping for NEW car# 1",
      "factory-A factory produced car# 2",
      "shopping for NEW car# 2",
      "factory-A factory produced car# 3"
    ]);
  });
});

/******
 * Below are sample classes and definitions to be used for the tests above
 *****/

interface INewCar {
  newCarNumber: number;
}

interface IUsedCar {
  usedCarNumber: number;
}

interface IStolenCar {
  stolenCarNumber: number;
}

class NewCarFactory extends Readable<INewCar> {
  public readonly name: string = NewCarFactory.name;
  private i = 0;

  constructor(private readonly factoryName: string, private readonly startNumber: number, private readonly endNumber: number, private readonly messages: string[]) {
    super({ objectMode: true });
    this.i = this.startNumber;
  }

  public _read(): any {
    process.nextTick(() => {
      let v: INewCar | null;
      if (this.i <= this.endNumber) {
        v = { newCarNumber: this.i } as INewCar;
      } else {
        v = null;
      }
      this.i++;
      this.push(v);
      if (v != null) {
        this.messages.push(`${this.factoryName} factory produced car# ${v.newCarNumber}`);
      } else {
        this.messages.push(`${this.factoryName} factory finished producing cars ${this.startNumber}...${this.endNumber}`);
      }
    });
  }
}

class NewCarBuyer extends Transform<INewCar, IUsedCar[]> {

  public readonly name: string = NewCarBuyer.name;
  private newCars: INewCar[] = [];

  constructor(private readonly numberOfCarsToBuyAtATime: number, private readonly messages: string[]) {
    super({ objectMode: true });
  }

  public _flushEx(callback: (error?: (Error | null), data?: any) => void): void {
    console.log(`called _flushEx from extended class`);
    if (this.newCars.length) {
      this.push(this.newCars.map(m => ({ usedCarNumber: m.newCarNumber } as IUsedCar)));
      this.messages.push(`purchased ${this.newCars.length} car numbers: ${this.newCars.map(m => m.newCarNumber).join(',')}`);
    }
    this.newCars = [];
    callback();
  }

  public _transformEx(chunk: INewCar, _encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
    this.newCars.push(chunk);
    this.messages.push(`shopping for NEW car#  ${chunk.newCarNumber}`);
    if (this.newCars.length >= this.numberOfCarsToBuyAtATime) {
      return this._flush(callback);
    }
    callback();
  }
}

class NewCarBuyerErr extends Transform<INewCar, IUsedCar[]> {

  public readonly name: string = NewCarBuyerErr.name;
  private newCars: INewCar[] = [];

  constructor(private readonly numberOfCarsToBuyAtATime: number, private readonly messages: string[]) {
    super({ objectMode: true });
  }

  public _flush(callback: (error?: (Error | null), data?: any) => void): void {
    process.nextTick(() => {
      if (this.newCars.length) {
        this.push(this.newCars.map(m => ({ usedCarNumber: m.newCarNumber } as IUsedCar)));
        this.messages.push(`purchased ${this.newCars.length} car numbers: ${this.newCars.map(m => m.newCarNumber).join(',')}`);
      }
      this.newCars = [];
      callback();
    });
  }

  // tslint:disable-next-line:variable-name
  public _transform(chunk: INewCar, _encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
    process.nextTick(() => {
      this.newCars.push(chunk);
      if (chunk.newCarNumber === 3) {
        return callback(new Error('Purposeful error to test error in transform stream'));
      }
      this.messages.push(`shopping for NEW car# ${chunk.newCarNumber}`);
      if (this.newCars.length >= this.numberOfCarsToBuyAtATime) {
        return this._flush(callback);
      }
      callback();
    });
  }
}

class UsedCarBuyer extends Transform<IUsedCar[], IUsedCar[]> {
  public readonly name: string = UsedCarBuyer.name;
  private newCars: IUsedCar[] = [];

  constructor(private readonly numberOfCarsToBuyAtATime: number, private readonly messages: string[]) {
    super({ objectMode: true });
  }

  public _flush(callback: (error?: (Error | null), data?: any) => void): void {
    process.nextTick(() => {
      if (this.newCars.length) {
        this.push(this.newCars.map(m => ({ usedCarNumber: m.usedCarNumber } as IUsedCar)));
        this.messages.push(`purchased used ${this.newCars.length} car numbers: ${this.newCars.map(m => m.usedCarNumber).join(',')}`);
      }
      this.newCars = [];
      callback();
    });
  }

  // tslint:disable-next-line:variable-name
  public _transform(chunk: IUsedCar[], _encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
    process.nextTick(() => {
      chunk.forEach(c => this.newCars.push(c));
      this.messages.push(`shopping for USED car#  ${chunk.map(m => m.usedCarNumber).join(',')}`);
      if (this.newCars.length >= this.numberOfCarsToBuyAtATime) {
        return this._flush(callback);
      }
      callback();
    });
  }
}

class UsedCarCrusher extends Writable<IUsedCar[]> {
  public readonly name: string = UsedCarCrusher.name;

  constructor(private readonly messages: string[]) {
    super({ objectMode: true });
  }

  public _write(chunk: IUsedCar[], _encoding: string, callback: (error?: (Error | null)) => void): void {
    process.nextTick(() => {
      this.messages.push(`crushing used cars # ${chunk.map(m => m.usedCarNumber).join(',')}`);
      callback();
    });
  }
}

class StolenCarBuyer extends Transform<IStolenCar, IUsedCar[]> {
  public readonly name: string = StolenCarBuyer.name;
  private newCars: IStolenCar[] = [];

  constructor(
    private readonly numberOfCarsToBuyAtATime: number,
    private readonly messages: string[]) {
    super({ objectMode: true });
  }

  public _flush(callback: (error?: (Error | null), data?: any) => void): void {
    process.nextTick(() => {
      if (this.newCars.length) {
        this.push(this.newCars.map(m => ({ usedCarNumber: m.stolenCarNumber } as IUsedCar)));
        this.messages.push(`purchased STOLEN ${this.newCars.length} car numbers: ${this.newCars.map(m => m.stolenCarNumber).join(',')}`);
      }
      this.newCars = [];
      callback();
    });
  }

  // tslint:disable-next-line:variable-name
  public _transform(chunk: IStolenCar, _encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
    process.nextTick(() => {
      this.newCars.push(chunk);
      this.messages.push(`shopping for stolen car# ${chunk.stolenCarNumber}`);
      if (this.newCars.length >= this.numberOfCarsToBuyAtATime) {
        return this._flush(callback);
      }
      callback();
    });
  }
}


class StolenCarBuyerErrorEx extends Transform<IStolenCar, IUsedCar[]> {
  public readonly name: string = StolenCarBuyer.name;
  private newCars: IStolenCar[] = [];

  constructor(
    private readonly numberOfCarsToBuyAtATime: number,
    private readonly messages: string[]) {
    super({ objectMode: true });
  }

  public _flushEx(callback: (error?: (Error | null), data?: any) => void): void {
    if (this.newCars.length) {
      this.push(this.newCars.map(m => ({ usedCarNumber: m.stolenCarNumber } as IUsedCar)));
      this.messages.push(`purchased STOLEN ${this.newCars.length} car numbers: ${this.newCars.map(m => m.stolenCarNumber).join(',')}`);
    }
    this.newCars = [];
    callback();
  }

  public _transformEx(chunk: IStolenCar, _encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
    this.newCars.push(chunk);
    this.messages.push(`shopping for stolen car# ${chunk.stolenCarNumber}`);
    if (this.newCars.length >= this.numberOfCarsToBuyAtATime) {
      return this._flush(callback);
    }
    throw new Error('this is a test');
    // callback();
  }
}


class NewCarThief extends Transform<INewCar, IStolenCar> {
  public readonly name: string = NewCarThief.name;

  constructor(private readonly messages: string[]) {
    super({ objectMode: true });
  }

  public _transform(chunk: INewCar, encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
    this.messages.push(`Stole new car number ${chunk.newCarNumber}`);
    this.push({ stolenCarNumber: chunk.newCarNumber }, encoding);
    callback();
  }
}