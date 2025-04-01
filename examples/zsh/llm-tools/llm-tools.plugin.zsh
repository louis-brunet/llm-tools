#####
# COMMON
#####

_llm_tools_debounce_seconds() {
  # Check if arguments are provided
    if [ $# -lt 2 ]; then
        echo "Usage: $0 <timeout_in_seconds_float> <command...>"
        return 1
    fi

    # Get the timeout in seconds
    local timeout_seconds_float="$1"
    shift

    # Use the name of the command to execute as the debounce file suffix
    local file_suffix="$1"

    local debounce_file="${TEMPDIR:-/tmp}/debounce_pid_$file_suffix"

    if [[ -f "$debounce_file" ]]; then
      # Kill the process waiting to execute
      local old_pid=$(cat "$debounce_file")
      if kill -0 $old_pid 2>/dev/null; then
        kill $old_pid 2>/dev/null
        rm "$debounce_file"
      fi
    fi

    # Write our PID to the debounce file
    echo $$ > "$debounce_file"

    sleep "$timeout_seconds_float"

    # Execute the command if we are still the latest one waiting
    if grep -q "$$" "$debounce_file" 2>/dev/null; then
      rm "$debounce_file";
      $@
    fi
}

_llm_tools_trigger_cli_completion() {
  local prefix="$1"
  local suffix="$2"
  local LLM_TOOLS_CLI_COMPLETION_COMMAND="${LLM_TOOLS_CLI_COMPLETION_COMMAND:-$_llm_tools_script_dir/../../../packages/apps/cli/build/main.js}"

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

  echo "$suggestion"
}

#####
# ZLE WIDGET
#####

function llm-completion-widget() {
  # Get text from current cursor position to beginning of line
  local prefix=${BUFFER[1, $CURSOR]}

  # Get text from cursor position to end of line (suffix)
  local suffix=${BUFFER[$CURSOR + 1, -1]}

  local suggestion=$(_llm_tools_trigger_cli_completion "$prefix" "$suffix")
  LBUFFER+="$suggestion"
}

function _configure-llm-tools-completion() {
  local _widget="llm-completion-widget"
  local _widget_keybind="^N"

  # Bind widget
  zle -N "$_widget"
  bindkey "$_widget_keybind" "$_widget"

  # # Print instructions
  # echo "Widget '$_widget' defined. Press $_widget_keybind to trigger completions."
  # echo "Run 'source $_script_path' in your terminal to apply in current session."
}


#####
# ZSH-AUTOSUGGESTIONS STRATEGY
#####

# Example strategy implementation:
# https://github.com/zsh-users/zsh-autosuggestions/blob/master/src/strategies/match_prev_cmd.zsh

LLM_TOOLS_ZSH_AUTOSUGGESTIONS_STRATEGY="${LLM_TOOLS_ZSH_AUTOSUGGESTIONS_STRATEGY:-custom_llm_tools}"

_zsh_autosuggest_strategy_"$LLM_TOOLS_ZSH_AUTOSUGGESTIONS_STRATEGY"() {
# TODO: better and configuratble debouncing
  # typeset -g suggestion="${1} TODO: implement $LLM_TOOLS_ZSH_AUTOSUGGESTIONS_STRATEGY strategy"
  # typeset -g suggestion="${1}$(_llm_tools_trigger_cli_completion "${1}")"
  # typeset -g suggestion="${1}$(_llm_tools_debounce 750 _llm_tools_trigger_cli_completion "${1}")"
  local debounced_suggestion="$(_llm_tools_debounce_seconds 0.750 _llm_tools_trigger_cli_completion "${1}")"
  if [[ debounced_suggestion = "" ]]; then
    return 0
  fi
  typeset -g suggestion="${1}${debounced_suggestion}"
}


#####
# main
#####

_script_path=$(realpath "$0")
_llm_tools_script_dir=$(dirname "$_script_path")
_configure-llm-tools-completion
unset -f _configure-llm-tools-completion
