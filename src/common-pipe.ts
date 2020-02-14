export function commonPipe(returnStream: NodeJS.WritableStream, throwErrorForTesting = false) {
  (returnStream as any).parentStream = this;
  const that = this;
  that.on('error', (err: any) => {
    that.emit('error-somewhere', err);
  });

  that.on('error-somewhere', (err: any) => {
    // Don't trigger error again, causing infinite loop
    if ((that as any).errored) {
      return true;
    }
    (that as any).errored = true;

    // Amend error message if not already amended
    if (err.ammended == null || err.ammended === false) {
      err.message = `Error in ${this.name} ${err.message}`;
      err.ammended = true;
    }

    // destroy stream otherwise it may continue to stream, especially if this is a read stream
    that.destroy();

    // emit the error to upstream parents streams to signal error
    if ((that as any).parentStream != null) {
      (that as any).parentStream.emit('error-somewhere', err);
    }

    // emit the error to downstream to signal error
    returnStream.emit('error-somewhere', err);
  });

  if (throwErrorForTesting) {
    setTimeout(() => {
      that.emit('error', new Error('testing'));
    }, 0);
  }

  return returnStream;
}
