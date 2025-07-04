## Secret/API Key Hygiene

- **Never hardcode API keys, secrets, or tokens in code, scripts, or documentation.**
- **Always use environment variables** for all sensitive values.
- **Do not log secrets or API keys** in any output, even in tests or debug code.
- **Pre-commit and CI checks** will block commits/pushes containing likely secrets or keys.
- If you accidentally commit a secret, rotate it immediately and notify the team.
- See `.env.example` for the correct pattern for environment files.

### Automated Secret Scanning

- **Pre-commit hook**: See `scripts/check-secrets.sh` and `.husky/pre-commit`.
- **CI workflow**: See `.github/workflows/secret-scan.yml`.
- These tools automatically block commits and pushes with likely secrets/API keys.

### If You Accidentally Commit a Secret/API Key

1. **Immediately rotate the secret** in the relevant provider (OpenAI, Stripe, Supabase, etc.).
2. **Remove the secret from all code, logs, and history** (use tools like git-filter-repo or BFG if
   needed).
3. **Notify the team** so everyone can update their local environment and CI/CD secrets.
4. **Document the incident** in the risk log if required.

### .gitignore Policy

- All environment and secret files (e.g., `.env`, `environment.txt`) must be listed in `.gitignore`
  to prevent accidental commits.

### One-Time Full Git History Scan

- To check for secrets in git history, run:
  - `npx trufflehog filesystem --regex --entropy=False --exclude_paths .gitignore .`
  - or:
    `git log -p | grep -E -i '(_API_KEY|SECRET|TOKEN|sk-[a-zA-Z0-9]{20,}|eyJ[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,}\.[a-zA-Z0-9_-]{20,})'`
- If any secrets are found, follow the rotation and notification steps above.
