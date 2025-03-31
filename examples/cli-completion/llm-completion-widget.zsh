#!/usr/bin/env zsh

_script_path=$(realpath "$0")
_script_dir=$(dirname "$_script_path")

function llm-completion-widget() {
  local LLM_TOOLS_CLI_COMPLETION_COMMAND="${LLM_TOOLS_CLI_COMPLETION_COMMAND:-$_script_dir/../../packages/apps/cli/build/main.js}"

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

  local pad_starting_hypen_pattern='s/^\(-\)/ \1/'

  local files_args=("${(@f)$(find . -maxdepth 1 -type f -o -type d | grep -v "^\.$" | sed -e 's:^./::' -e "$pad_starting_hypen_pattern" | sort)}")
  local matching_commands=()

  # NOTE: `${=myvar}` trims a string in zsh
  if [[ "${=prefix}" != "" ]] || [[ "${=suffix}" != "" ]]; then
    local matching_commands_pattern="*$prefix*$suffix*"
    local matching_command_count=5
    matching_commands=("${(@f)$(fc -l -n -m -r "*$prefix*$suffix" 1 2>/dev/null \
      | head -n "$matching_command_count" \
      | tac \
      | sed "$pad_starting_hypen_pattern")}")
  fi
  local recent_command_count=25
  local history_args=("${(@f)$(fc -ln "-$recent_command_count" | sed "$pad_starting_hypen_pattern")}")
  # --debug \
  local suggestion=$(
    "$LLM_TOOLS_CLI_COMPLETION_COMMAND" \
      cli-completion \
      --prefix "$prefix" \
      --suffix "$suffix" \
      --working-directory "$(pwd)" \
      --files "${files_args[@]}" \
      --recent-history "${history_args[@]}" \
      --matched-history "${matching_commands[@]}"
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
  echo "Run 'source $_script_path' in your terminal to apply in current session."
}

_configure-llm-tools-completion
unset -f _configure-llm-tools-completion
