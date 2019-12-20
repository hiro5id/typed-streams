/* tslint:disable:max-classes-per-file */
import { Readable, Transform } from '../src';

describe('stream', () => {
  it('streams work', async () => {

    const carFactory = new NewCarFactory();
    const newCarBuyer = new NewCarBuyer(3);
    const newCarThief = new NewCarThief();
    const stolenCarBuyer = new StolenCarBuyer(5);
    const usedCarBuyer = new UsedCarBuyer(10);

    await carFactory.pipe(newCarThief).pipe(stolenCarBuyer).pipe(usedCarBuyer);
    await carFactory.pipe(newCarBuyer);

    /**
     * Uncomment below line to demonstrate typescript give an error for "newCarThief"
     * because a used car cannot be piped into a thief that only wants to steal new cars
     */
    // const cars = carFactory.pipe(newCarBuyer).pipe(newCarThief);

    console.log('done');
  });
});


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
  constructor() {
    super({objectMode: true});
  }
  public _transform(chunk: INewCar, encoding: string, callback: (error?: (Error | null), data?: any) => void): void {
    this.push({ stolenCarNumber: chunk.newCarNumber }, encoding);
    callback();
  }
}