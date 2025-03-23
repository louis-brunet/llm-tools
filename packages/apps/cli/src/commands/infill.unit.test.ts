import { ILlmToolsInfillRequest, LlmToolsService } from '@llm-tools/clients';
import {
  infill,
  infillCommand,
  InfillCommandOptions,
} from '../commands/infill';
import { describe, it, mock, TestContext } from 'node:test';
import { notImplemented } from '../../test/utils/not-implemented';

void describe('infill', async () => {
  const validInfillCommandOptions: InfillCommandOptions = {
    server: 'some-server',
    prefix: 'some-prefix',
    prompt: 'some-prompt',
    suffix: 'some-suffix',
    multiLine: true,
    extra: ['extra:abc\ndef'],
  };
  await it('is defined', (t: TestContext) => {
    t.assert.ok(infillCommand);
    t.assert.ok(infill);
  });
  const defaultInfillMock = mock.method(LlmToolsService.prototype, 'infill');
  defaultInfillMock.mock.mockImplementation(notImplemented);
  const defaultCompletionMock = mock.method(
    LlmToolsService.prototype,
    'cliCompletion',
  );
  defaultCompletionMock.mock.mockImplementation(notImplemented);

  await it('calls library with correct arguments', async (t: TestContext) => {
    const mockInfill = t.mock.method(LlmToolsService.prototype, 'infill');
    mockInfill.mock.mockImplementation((_request) => {
      return Promise.resolve({ content: 'some response', tokensPredicted: 42 });
    });
    // const mockStdoutWrite = t.mock.method(process.stdout, 'write');
    // mockStdoutWrite.mock.mockImplementation((_buffer) => true);
    const mockConsoleDebug = t.mock.method(console, 'debug');
    mockConsoleDebug.mock.mockImplementation((_message) => {});

    const result = await infill(validInfillCommandOptions, { debug: true });

    t.assert.strictEqual(mockInfill.mock.callCount(), 1);
    const expectedRequest: ILlmToolsInfillRequest = {
      prompt: validInfillCommandOptions.prompt,
      inputSuffix: validInfillCommandOptions.suffix,
      inputPrefix: validInfillCommandOptions.prefix,
      inputExtra: [
        {
          fileName: 'extra',
          text: 'abc\ndef',
        },
      ],
    };
    if (!validInfillCommandOptions.multiLine) {
      expectedRequest.singleLine = true;
    }
    t.assert.deepStrictEqual(
      mockInfill.mock.calls[0].arguments[0],
      expectedRequest,
    );
    // let loggedResponse = false;
    // for (const call of mockStdoutWrite.mock.calls) {
    //   if (call.arguments[0].toString().includes('some response')) {
    //     loggedResponse = true;
    //     break;
    //   }
    // }
    // t.assert.ok(loggedResponse);
    // t.assert.ok(mockStdoutWrite.mock.callCount() >= 1);
    t.assert.strictEqual(result, 'some response');
    t.assert.strictEqual(mockConsoleDebug.mock.callCount(), 1);
  });

  await it('throws error if extra context format is not valid', async (t: TestContext) => {
    await t.assert.rejects(
      () =>
        infill({
          ...validInfillCommandOptions,
          extra: ['extra context without separator'],
        }),
      TypeError,
    );
  });

  await it('trims content to single line if requested', async (t: TestContext) => {
    const mockInfill = t.mock.method(LlmToolsService.prototype, 'infill');
    mockInfill.mock.mockImplementation((_request) => {
      return Promise.resolve({
        // TODO: might need to change this when the newline token is added to the list of stop tokens
        content: 'some response\njfkdqsm qfjkdqm',
        tokensPredicted: 42,
      });
    });
    const result = await infill({
      ...validInfillCommandOptions,
      multiLine: false,
    });
    t.assert.ok(!result.includes('\n'));
  });
});
