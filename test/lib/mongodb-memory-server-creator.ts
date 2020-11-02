/* tslint:disable:object-literal-sort-keys */
import * as fs from 'fs-extra';
import { Db, MongoClient } from 'mongodb';
import MongodbMemoryServer from 'mongodb-memory-server-core';
import * as path from 'path';
import * as uuid from 'uuid';

// tslint:disable-next-line:no-var-requires no-require-imports
const getPort = require('get-port');

export class MongodbMemoryServerCreator {
  public readonly tempDataDir: string;
  public readonly binaryDir: string;
  public readonly mongodbVersion: string;
  private _mongod: MongodbMemoryServer | undefined;
  private _client: MongoClient | undefined;
  private _connectionUri: string | undefined;
  private _port: number | undefined;
  private _dbPath: string | undefined;
  private _dbName: string | undefined;

  constructor() {
    this.mongodbVersion = '4.2.0';
    this.tempDataDir = path.normalize(path.resolve(__dirname, '../../node_modules/.cache/mongodb-memory-server/mongodb-binaries', 'temp-db-data', uuid.v4()));
    this.binaryDir = path.normalize(path.resolve(__dirname, '../../node_modules/.cache/mongodb-memory-server/mongodb-binaries'));

    console.log(`MongodbMemoryServerCreator.tempDataDir: ${this.tempDataDir} MongodbMemoryServerCreator.binaryDir: ${this.binaryDir}`);
  }


  get port(): number | undefined {
    return this._port;
  }

  get dbPath(): string | undefined {
    return this._dbPath;
  }

  get dbName(): string | undefined {
    return this._dbName;
  }

  get connectionUri(): string {
    if (this._connectionUri == null) {
      throw new Error('no connection URL available, was the database started?');
    }
    return this._connectionUri;
  }

  public downloadedBinaryExists(): boolean {
    return fs.existsSync(this.downloadedBinaryPath);
  }

  get downloadedBinaryPath(): string {
    return path.join(this.binaryDir, this.mongodbVersion, 'mongod');
  }

  public async start(): Promise<void> {
    if (this._mongod != null) { return; }

    // console.log(`Mongo path: ${this.downloadedBinaryPath}`);

    await fs.mkdirp(this.tempDataDir);
    await fs.mkdirp(this.binaryDir);

    this._mongod = new MongodbMemoryServer({
      instance: {
        dbPath: this.tempDataDir,
        port: await getPort({ port: 51347 }),
      },
      binary: {
        version: this.mongodbVersion,
        downloadDir: this.binaryDir,
      },
    });

    this._connectionUri = await this._mongod.getConnectionString();
    this._port = await this._mongod.getPort();
    this._dbPath = await this._mongod.getDbPath();
    this._dbName = await this._mongod.getDbName();
  }

  public async stop(): Promise<void> {
    if (this._client != null) {
      await this._client.close(true);
    }

    if (this._mongod != null) {
      await this._mongod.stop();
      this.deleteFolderRecursive(this.tempDataDir);
    }
  }


  public async getConnectedClient(): Promise<MongoClient> {
    if (this._mongod == null) {
      await this.start();
    }
    if (this._client == null) {
      if (this._connectionUri == null) { throw new Error('connectionUri is expected to be defined if mongo server has been started'); }
      this._client = await MongoClient.connect(await this._connectionUri, { useNewUrlParser: true, useUnifiedTopology: true });
    }
    return this._client;
  }

  public async getDb(dbName: string): Promise<Db> {
    const mongoClient = await this.getConnectedClient();
    return mongoClient.db(dbName);
  }

  public getRandomDb(): Promise<Db> {
    return this.getDb(uuid.v4());
  }

  private deleteFolderRecursive(pathToDelete: string): void {
    const that = this;
    if (fs.existsSync(pathToDelete)) {
      fs.readdirSync(pathToDelete).forEach(file => {
        const curPath = `${pathToDelete}/${file}`;
        if (fs.lstatSync(curPath).isDirectory()) {
          // recurse
          that.deleteFolderRecursive(curPath);
        } else {
          // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(pathToDelete);
    }
  }
}
