# llm-tools

```bash
yarn run build:cli
yarn run start:cli --help
```

## Examples

### ZSH

See [./examples/zsh](./examples/zsh).

Launch llama.cpp's llama-server on port 8012:

```bash
llama-server --fim-qwen-3b-default
```

Source the [zsh example file](./examples/zsh/llm-tools/llm-tools.plugin.zsh). 

```bash
source ./examples/zsh/llm-tools/llm-tools.plugin.zsh
```

#### zsh-autosuggestions strategy

Defines a custom strategy for zsh-autosuggestions, with the name
`$LLM_TOOLS_ZSH_AUTOSUGGESTIONS_STRATEGY`, or "custom_llm_tools" by default.

To use this strategy, modify your zsh-autosuggestions configuration:

```zsh
# zshrc

ZSH_AUTOSUGGEST_STRATEGY=("$LLM_TOOLS_ZSH_AUTOSUGGESTIONS_STRATEGY" <INSERT_YOUR_OTHER_STRATEGIES_HERE>)
```


#### zsh completion widget

Creates a ZLE widget that calls the llm-tools CLI to generate a completion.

Binds the widget to the key `^N`.
