#!/bin/zsh

set -e

AGENT="$1"
TASK="$2"

if [[ -z "$AGENT" || -z "$TASK" ]]; then
  echo "Usage:"
  echo './scripts/run-agent.sh <agent> "<task>"'
  exit 1
fi

export OLLAMA_MODEL="${OLLAMA_MODEL:-qwen2.5-coder:3b}"

node scripts/agent-runner.mjs "$AGENT" "$TASK"