/* eslint-disable import/prefer-default-export */

export async function wait(delay: number): Promise<void> {
  return new Promise((r) => setTimeout(r, delay));
}

