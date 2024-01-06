/* eslint-disable
  no-extend-native,
  @typescript-eslint/no-unused-vars,
  no-unused-vars,
  no-plusplus,
  no-await-in-loop
*/

export {};

declare global {
  interface Array<T> {
    serialForEach(this: T[], cb: (item: T, index: number) => Promise<unknown>): Promise<unknown>;
  }
}

async function serialForEach<T>(
  this: T[],
  cb: (item: T, index: number) => Promise<void>,
): Promise<unknown> {
  const results = [];
  for (let i = 0; i < this.length; i++) {
    results.push(await cb(this[i], i));
  }
  return results.flatMap((r) => r);
}

Array.prototype.serialForEach = serialForEach;
