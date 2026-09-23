---
trigger: always_on
---

# Sensitive Data & Secret Prevention (Frontend Web)

## Mandate
Never commit private API keys, backend secrets, production credentials, or unmasked `.env` files into the web application repository.

## Rules & Best Practices

1. **VUE_APP / Client Environment Variables**:
   - Only non-sensitive, public configuration (like public API endpoints or feature flags) should be in `.env.development` or `.env.production`.
   - Never embed database passwords, secret keys, or private API keys in client-side bundles.
   - Use `.env.example` as a template with placeholder values.

2. **Pre-Commit Secret Verification**:
   - `scripts/secret_scanner.py` runs before commits to verify no private keys, `.env` secret files, or credentials are staged.
   - If a violation is caught, unstage using `git restore --staged <file>`.
