#!/bin/zsh

set -e

OUTPUT_FILE="$1"
TASK="$2"
MODEL="${OLLAMA_MODEL:-qwen2.5-coder:3b}"

if [[ -z "$OUTPUT_FILE" || -z "$TASK" ]]; then
  echo 'Usage: ./scripts/run-implementation.sh <output-file> "<task>"'
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required."
  exit 1
fi

if [[ "$OUTPUT_FILE" == /* || "$OUTPUT_FILE" == *".."* ]]; then
  echo "Error: unsafe output path: $OUTPUT_FILE"
  exit 1
fi

mkdir -p "$(dirname "$OUTPUT_FILE")"

TEMP_RESPONSE=$(mktemp)
TEMP_SOURCE=$(mktemp)
BACKUP_FILE=$(mktemp)

cleanup() {
  rm -f "$TEMP_RESPONSE" "$TEMP_SOURCE" "$BACKUP_FILE"
}

trap cleanup EXIT

# Preserve the existing implementation in case validation fails.
FILE_EXISTED=false

if [[ -f "$OUTPUT_FILE" ]]; then
  FILE_EXISTED=true
  cp "$OUTPUT_FILE" "$BACKUP_FILE"
fi

EXISTING_FILE=""

if [[ -f "$OUTPUT_FILE" ]]; then
  EXISTING_FILE=$(cat "$OUTPUT_FILE")
fi

PROMPT=$(cat <<EOF
You are a focused Senior TypeScript implementation agent.

You are generating exactly ONE project file:

$OUTPUT_FILE

# ENGINEERING RULES

$(cat .cursor/rules/engineering.mdc)

# APPROVED SPECIFICATION

$(cat docs/SPEC.md)

# APPROVED ARCHITECTURE

$(cat docs/ARCHITECTURE.md)

# CURRENT FILE

$EXISTING_FILE

# CURRENT TASK

$TASK

# IMPORTANT

Generate ONLY the complete contents of:

$OUTPUT_FILE

Do not generate any other file.

Do not output:
- Markdown
- code fences
- JSON
- filenames
- explanations
- terminal commands
- notes
- commentary

Return source code only.

# TYPESCRIPT RULES

- Code must compile.
- Project uses ESM.
- Relative imports must use .js extensions.
- Use import type for type-only imports.
- Tests use Vitest, never Jest.
- Do not invent paths.
- Do not invent dependencies.
- Reuse existing project modules.
- Do not duplicate business logic.
- Do not modify project configuration.
- Implement only the requested task.

Before responding, verify:
1. syntax is valid
2. imports match the requested project structure
3. no Markdown exists
4. no explanatory text exists
5. the result contains only source code
EOF
)

REQUEST=$(jq -n \
  --arg model "$MODEL" \
  --arg prompt "$PROMPT" \
  '{
    model: $model,
    prompt: $prompt,
    stream: false,
    options: {
      temperature: 0
    }
  }'
)

echo "Generating $OUTPUT_FILE..."

curl \
  --fail \
  --silent \
  --show-error \
  http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d "$REQUEST" \
  > "$TEMP_RESPONSE"

ERROR=$(jq -r '.error // empty' "$TEMP_RESPONSE")

if [[ -n "$ERROR" ]]; then
  echo "Ollama error: $ERROR"
  exit 1
fi

jq -r '.response // empty' "$TEMP_RESPONSE" > "$TEMP_SOURCE"

if [[ ! -s "$TEMP_SOURCE" ]]; then
  echo "Error: Ollama generated an empty file."
  exit 1
fi

# Remove ANSI/control sequences.
perl -i -pe 's/\e\[[0-9;?]*[ -\/]*[@-~]//g' "$TEMP_SOURCE"

# Remove accidental Markdown fences.
sed -i '' \
  -e '/^[[:space:]]*```typescript[[:space:]]*$/d' \
  -e '/^[[:space:]]*```ts[[:space:]]*$/d' \
  -e '/^[[:space:]]*```javascript[[:space:]]*$/d' \
  -e '/^[[:space:]]*```[[:space:]]*$/d' \
  "$TEMP_SOURCE"

if [[ ! -s "$TEMP_SOURCE" ]]; then
  echo "Error: generated source became empty after cleanup."
  exit 1
fi

cp "$TEMP_SOURCE" "$OUTPUT_FILE"

echo "Generated candidate:"
echo "  $OUTPUT_FILE"

echo ""
echo "Running typecheck..."

if ! npm run typecheck; then
  echo ""
  echo "❌ TypeScript validation failed."

  if [[ "$FILE_EXISTED" == true ]]; then
    cp "$BACKUP_FILE" "$OUTPUT_FILE"
    echo "Previous version restored."
  else
    rm -f "$OUTPUT_FILE"
    echo "Invalid generated file removed."
  fi

  exit 1
fi

echo ""
echo "Running lint..."

if ! npm run lint; then
  echo ""
  echo "❌ ESLint validation failed."

  if [[ "$FILE_EXISTED" == true ]]; then
    cp "$BACKUP_FILE" "$OUTPUT_FILE"
    echo "Previous version restored."
  else
    rm -f "$OUTPUT_FILE"
    echo "Invalid generated file removed."
  fi

  exit 1
fi

echo ""
echo "✅ Generated file passed typecheck and lint:"
echo "   $OUTPUT_FILE"