# Testing

- Test behavior through public interfaces, not implementation details. A refactor must not break a test.
- Do not write tautological tests that repeat the code's own formula.
- Find the typecheck, lint and test commands in the project files (package.json, Makefile, CI config). Do not guess them.
- Run them before reporting work done.
- If something cannot be run, say "not verified" and why. Never imply it passed.
