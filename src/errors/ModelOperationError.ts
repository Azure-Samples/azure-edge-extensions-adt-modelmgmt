export default class ModelOperationError extends Error {
  public readonly code?: string;

  public readonly error?: Error;

  constructor(message: string, code?: string, error?: Error) {
    super(message);
    this.code = code;
    this.error = error;
  }
}
