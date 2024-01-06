import { RestError } from '@azure/core-http';
import ModelOperationError from '../errors/ModelOperationError';

export default function handleError(
  handler: (argv: unknown) => Promise<void>,
): (args: unknown) => Promise<void> {
  return async (args: unknown) => {
    try {
      await handler(args);
    } catch (e) {
      if (e instanceof RestError) {
        throw new ModelOperationError(e.message, e.code, e);
      } else if (e instanceof Error) {
        throw new ModelOperationError(e.message);
      } else if (typeof e === 'string') {
        throw new ModelOperationError(e);
      } else {
        throw e;
      }
    }
  };
}
