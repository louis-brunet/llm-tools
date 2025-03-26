import { LlamaCppClient } from './clients';

async function main() {
  const client = new LlamaCppClient({ serverOrigin: 'http://localhost:8012' });
  const result = await client.infill({
    input_prefix: 'def foo(a, b):\n    ',
    prompt: '',
    input_suffix: '\n    return sum',
    input_extra: [{ filename: 'bar.py', text: 'print("hi")' }],
  });
  process.stdout.write(result.content);
}

main()
  .then()
  .catch((e: unknown) => {
    console.error(e);
  });
