import assert from 'node:assert';
import { Mock } from 'node:test';

function deepStrictEqual(actual: unknown, expected: unknown): boolean {
  try {
    assert.deepStrictEqual(actual, expected);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export function calledWithArg<
  TArguments extends unknown[],
  TArgumentIndex extends number,
>(
  mockFunction: Mock<(...args: TArguments) => unknown>,
  argumentIndex: TArgumentIndex,
  argument: TArguments[TArgumentIndex],
): boolean {
  return !!mockFunction.mock.calls.find(
    (call) => call.arguments[argumentIndex] === argument,
  );
}

export function calledWithArgs<TArguments extends unknown[]>(
  mockFunction: Mock<(...args: TArguments) => unknown>,
  expectedArguments: TArguments,
): boolean {
  return !!mockFunction.mock.calls.find((call) => {
    return expectedArguments.every((arg, index) =>
      deepStrictEqual(call.arguments[index], arg),
    );
  });
}

// export function calledTimes<TArguments extends unknown[]>(
//   mockFunction: Mock<(...args: unknown[]) => unknown>,
//   count: number,
// ): boolean {
// }
