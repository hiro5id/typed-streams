export function commonToPromiseFinish() {
  return new Promise<void>((resolve, reject) => {
    this.on('finish', () => {
      resolve();
    });
    this.on('error-somewhere', (err: any) => {
      reject(err);
    });
    this.on('error', (err: any) => {
      reject(err);
    });
  });
}
