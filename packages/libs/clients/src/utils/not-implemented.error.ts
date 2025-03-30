export class NotImplementedError extends Error {
  constructor(messsage?: string) {
    super(`not implemented${messsage ? `: ${messsage}` : ''}`);
  }
}
