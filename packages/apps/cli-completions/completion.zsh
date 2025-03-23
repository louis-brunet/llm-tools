#!/usr/bin/env zsh

LLM_TOOLS_CLI_COMPLETIONS_COMMAND="${LLM_TOOLS_CLI_COMPLETIONS_COMMAND:-$PROJECTS/llm-tools/packages/apps/cli-completions/build/main.js}"

function llm-completion-widget() {
  # Get text from current cursor position to beginning of line
  local prefix=${BUFFER[1, $CURSOR]}

  # Get text from cursor position to end of line (suffix)
  local suffix=${BUFFER[$CURSOR + 1, -1]}

  # local RECENT_COMMAND_COUNT=15
  # local extra_context=(
  #   # "CONTEXT.zsh:working_dir=$(pwd)\nfiles=$(echo *)"
  #   "CONTEXT.zsh:pwd\n# $(pwd)\nls\n# $(echo *)"
  #   ".histfile:$(fc -ln "-$RECENT_COMMAND_COUNT")"
  # )
  # local suggestion=$("$LLM_TOOLS_CLI_COMPLETIONS_COMMAND" infill --prefix "$prefix" --suffix "$suffix" --multi-line --extra "${extra_context[@]}")

  local files_args=("${(@f)$(find . -maxdepth 1 -type f -o -type d | grep -v "^\.$" | sed 's:^./::' | sort)}")
  local history_args=("${(@f)$(fc -ln -15)}")
  # --debug \
  local suggestion=$(
    "$LLM_TOOLS_CLI_COMPLETIONS_COMMAND" \
      cli-completion \
      --prefix "$prefix" \
      --suffix "$suffix" \
      --working-directory "$(pwd)" \
      --files "${files_args[@]}" \
      --history "${history_args[@]}"
  )

  LBUFFER+="$suggestion"

}

function _configure-llm-tools-completion() {
  local _widget="llm-completion-widget"
  local _widget_keybind="^N"

  # Bind widget
  zle -N "$_widget"
  bindkey "$_widget_keybind" "$_widget"

  # Print instructions
  echo "Widget '$_widget' defined. Press $_widget_keybind to trigger completions."
  echo "Run 'source $(realpath "$0")' in your terminal to apply in current session."
}

_configure-llm-tools-completion
unset -f _configure-llm-tools-completion
