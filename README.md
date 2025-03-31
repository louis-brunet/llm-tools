# llm-tools

```bash
yarn run build:cli
yarn run start:cli --help
```

## Examples

See [./examples](./examples).

### zsh completion widget

Launch llama.cpp's llama-server on port 8012:

```bash
llama-server --fim-qwen-3b-default
```

Create and bind the [ZLE widget](./examples/cli-completion/llm-completion-widget.zsh) for zsh completions:

```bash
source ./examples/cli-completion/llm-completion-widget.zsh
```

Try it out:

```bash
terraform init && <Ctrl-N>
```
