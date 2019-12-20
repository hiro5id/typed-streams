/* tslint:disable:max-classes-per-file */
import { Readable, Transform } from '../src';

describe('stream', () => {

  it('parallel streaming, 2 streams and await their finish', async () => {
    const carFactory = new NewCarFactory();
    const newCarBuyer = new NewCarBuyer(3);
    const newCarThief = new NewCarThief();
    const stolenCarBuyer = new StolenCarBuyer(5);
    const usedCarBuyer = new UsedCarBuyer(10);

    await carFactory.pipe(newCarThief).pipe(stolenCarBuyer).pipe(usedCarBuyer).toPromiseFinish();
    await carFactory.pipe(newCarBuyer).toPromiseFinish();

    /**
     * Uncomment below line to demonstrate typescript give an error for "newCarThief"
     * because a used car cannot be piped into a thief that only wants to steal new cars
     */
    // carFactory.pipe(newCarBuyer).pipe(newCarThief);

    console.log('done');
  });

  it('serial streaming, await one stream before starting another', async () => {

    const carFactory1 = new NewCarFactory();
    const carFactory2 = new NewCarFactory();
    const newCarBuyer = new NewCarBuyer(3);
    const newCarThief = new NewCarThief();
    const stolenCarBuyer = new StolenCarBuyer(5);
    const usedCarBuyer = new UsedCarBuyer(10);

    carFactory1
      .pipe(newCarThief)
      .pipe(stolenCarBuyer)
      .pipe(usedCarBuyer)
      .toPromiseFinish()
      .then(() => {
          console.log('finished1');
          carFactory2.pipe(newCarBuyer).toPromiseFinish()
            .then(()=> {
              console.log('finished2');
            });
      });
    console.log('done');
  });

  // Todo: add a stage that throws an error and watch it catch it
  // Todo: see if there is a way to:   If there is no err event registered, pass the error to the next pipeline so that it can be handled at thend by the promise finish or a single error event.   Make sure you pass on the stack trace.
  it('allow adding of error events at each stage', async () => {

    const carFactory1 = new NewCarFactory();
    const carFactory2 = new NewCarFactory();
    const newCarBuyer = new NewCarBuyer(3);
    const newCarThief = new NewCarThief();
    const stolenCarBuyer = new StolenCarBuyer(5);
    const usedCarBuyer = new UsedCarBuyer(10);

    carFactory1
      .err(err => { console.error(`error at carFactory1 ${err}`)})
      .pipe(newCarThief)
      .err(err => { console.error(`error at newCarThief ${err}`)})
      .pipe(stolenCarBuyer)
      .err(err => { console.error(`error at stolenCarBuyer ${err}`)})
      .pipe(usedCarBuyer)
      .err(err => { console.error(`error at usedCarBuyer ${err}`)})
      .toPromiseFinish()
      .then(() => {
        console.log('finished1');
        carFactory2.pipe(newCarBuyer).toPromiseFinish()
          .then(()=> {
            console.log('finished2');
          });
      });
    console.log('done');
  });
});

/******
 * Below are example classes to be used for the tests above
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

  constructor() {
    super({ objectMode: true });
  }

  public _read(): any {
    process.nextTick(() => {
      const v = this.i++ < 20 ? { newCarNumber: this.i } as INewCar : null;
      this.push(v);
      if (v) {
        console.log('produced car# ', v.newCarNumber);
      }
    });
  }
}

class NewCarBuyer extends Transform<INewCar, IUsedCar[]> {

  public readonly name: string = NewCarBuyer.name;
  private newCars: INewCar[] = [];

  constructor(private readonly numberOfCarsToBuyAtATime: number) {
    super({ objectMode: true });
  }

  public _flush(callback: (error?: (Error | null), data?: any) => void): void {
    process.nextTick(() => {
      if (this.newCars.length) {
        this.push(this.newCars.map(m => ({ usedCarNumber: m.newCarNumber } as IUsedCar)));
        console.log(`purchased ${this.newCars.length} car numbers: ${this.newCars.map(m => m.newCarNumber).join(',')}`);
      }
      this.newCars = [];
      callback();
    });
  }

  // tslint:disable-next-line:variable-name
  public _transform(chunk: INewCar, _encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
    process.nextTick(() => {
      this.newCars.push(chunk);
      console.log('shopping for NEW car# ', chunk.newCarNumber);
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

  constructor(private readonly numberOfCarsToBuyAtATime: number) {
    super({ objectMode: true });
  }

  public _flush(callback: (error?: (Error | null), data?: any) => void): void {
    process.nextTick(() => {
      if (this.newCars.length) {
        this.push(this.newCars.map(m => ({ usedCarNumber: m.usedCarNumber } as IUsedCar)));
        console.log(`purchased used ${this.newCars.length} car numbers: ${this.newCars.map(m => m.usedCarNumber).join(',')}`);
      }
      this.newCars = [];
      callback();
    });
  }

  // tslint:disable-next-line:variable-name
  public _transform(chunk: IUsedCar[], _encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
    process.nextTick(() => {
      chunk.forEach(c => this.newCars.push(c));
      console.log('shopping for USED car# ', chunk.map(m => m.usedCarNumber).join(","));
      if (this.newCars.length >= this.numberOfCarsToBuyAtATime) {
        return this._flush(callback);
      }
      callback();
    });
  }
}

class StolenCarBuyer extends Transform<IStolenCar, IUsedCar[]> {
  public readonly name: string = StolenCarBuyer.name;
  private newCars: IStolenCar[] = [];

  constructor(private readonly numberOfCarsToBuyAtATime: number) {
    super({ objectMode: true });
  }

  public _flush(callback: (error?: (Error | null), data?: any) => void): void {
    process.nextTick(() => {
      if (this.newCars.length) {
        this.push(this.newCars.map(m => ({ usedCarNumber: m.stolenCarNumber } as IUsedCar)));
        console.log(`purchased STOLEN ${this.newCars.length} car numbers: ${this.newCars.map(m => m.stolenCarNumber).join(',')}`);
      }
      this.newCars = [];
      callback();
    });
  }

  // tslint:disable-next-line:variable-name
  public _transform(chunk: IStolenCar, _encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
    process.nextTick(() => {
      this.newCars.push(chunk);
      console.log('shopping for stolen car# ', chunk.stolenCarNumber);
      if (this.newCars.length >= this.numberOfCarsToBuyAtATime) {
        return this._flush(callback);
      }
      callback();
    });
  }
}


class NewCarThief extends Transform<INewCar, IStolenCar> {
  public readonly name: string = NewCarThief.name;
  constructor() {
    super({objectMode: true});
  }
  public _transform(chunk: INewCar, encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
    this.push({ stolenCarNumber: chunk.newCarNumber }, encoding);
    callback();
  }
}