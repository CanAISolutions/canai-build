#!/bin/sh
# Block commit if likely secrets are found in staged files

PATTERNS='(_API_KEY|APIKEY|apiKey|apikey|SECRET|secret|Token|token)[^\\n]*=|sk-[a-zA-Z0-9]{20,}|eyJ[a-zA-Z0-9_-]{20,}\\.[a-zA-Z0-9_-]{20,}\\.[a-zA-Z0-9_-]{20,}'

if git diff --cached --name-only | grep -E '\\.(js|ts|json|md|env|sh|yml|toml|txt)$' | xargs grep -E -i "$PATTERNS"; then
  echo "❌ Potential secret/API key detected in staged files. Please remove before committing."
  exit 1
fi

exit 0