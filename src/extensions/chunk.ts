/* eslint-disable no-extend-native */

export {};

declare global {
  interface Array<T> {
    chunk(this: T[], n: number): T[][];
  }
}

function chunk<T>(this: T[], chunkSize: number): T[][] {
  if (!chunkSize) throw new Error('A value for chunkSize is required but was not provided.');

  let slicePoint = 0;
  const result = [];

  while (slicePoint < this.length) {
    result.push(this.slice(slicePoint, slicePoint + chunkSize));
    slicePoint += chunkSize;
  }
  return result;
}

Array.prototype.chunk = chunk;
