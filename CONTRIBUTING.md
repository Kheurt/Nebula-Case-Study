# Contributing to case-study-test

Thank you for contributing! This document gives a quick path to get started and points to the
project Constitution for governance and expectations: see CONSTITUTION.md.

Quick start

1. Fork the repository (or create a branch in a shared fork) and create a short-lived branch:
   - feature/your-short-description
   - fix/short-description
2. Implement your change and add tests. Follow the project style and linting rules.
3. Push your branch and open a Pull Request (PR). Use the PR template and fill in the requested
   details (motivation, tests, security considerations, suggested version bump).

PR checklist (summary)

- Title and description explain the why and what.
- Link to an issue or RFC where appropriate.
- Tests added/updated and instructions for running them locally.
- Linting/formatting applied.
- Documentation updated for user-visible changes (quickstart, README, or docs/).
- Security notes included if the PR touches secrets, authentication, or sensitive data.
- Suggested semantic version bump when the change affects public APIs.

Review expectations

- Keep PRs small and focused when possible. Large refactors should be split into reviewable steps.
- Reviewers should provide constructive feedback and aim to respond within 48 hours when possible.
- Contributors should respond to review comments promptly and keep the PR updated.

Testing locally

This repository may not include a standard test runner. If there is a test command, try one of the
following from the project root:

- npm test
- make test
- pytest

If no test command is present, describe how to run any manual checks in your PR description.

Security disclosures

If you discover a security vulnerability, please report it privately to the maintainers at
krys.tedongmouo@orange.com rather than opening a public issue.

Thank you for helping make this project better!