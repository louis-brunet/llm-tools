class MockNotImplementedError extends Error {
  constructor(mockName?: string) {
    super(`mock ${mockName ? `for '${mockName}' ` : ''}not implemented`);
  }
}

export async function notImplemented(): Promise<never> {
  throw new MockNotImplementedError();
  await Promise.reject(new MockNotImplementedError());
}
