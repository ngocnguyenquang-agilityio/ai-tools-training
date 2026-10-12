// Stop: when code changed, run typecheck and lint before Claude ends its turn.
// Failures are sent back to Claude (exit 2) so it keeps working on them.
import { readStdinJson, run, tail } from "./lib.mjs";

const input = await readStdinJson();
// Claude is already continuing because of this hook: don't loop forever.
if (input?.stop_hook_active) process.exit(0);

// -z: NUL-separated and unquoted, so paths with spaces still match.
const status = run("git status --porcelain -z --untracked-files=all");
const codeChanged = status.output
  .split("\0")
  .some((entry) => /\.(c|m)?[jt]sx?$|(^|\/)tsconfig\.json$/.test(entry));
if (!codeChanged) process.exit(0);

for (const script of ["typecheck", "lint"]) {
  const result = run(`pnpm ${script}`);
  if (!result.ok) {
    console.error(`pnpm ${script} failed. Fix it before finishing:\n${tail(result.output)}`);
    process.exit(2);
  }
}
