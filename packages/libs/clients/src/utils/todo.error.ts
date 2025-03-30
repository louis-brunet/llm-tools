export class TodoError extends Error {
  constructor(message?: string) {
    super(`TODO${message !== undefined ? ` ${message}` : ''}`);
  }
}
