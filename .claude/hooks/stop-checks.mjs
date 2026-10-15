// Stop: when code changed, run typecheck, lint and the Jest tests related to
// the changed files before Claude ends its turn. Failures are sent back to
// Claude (exit 2) so it keeps working on them.
import { readStdinJson, run, tail } from "./lib.mjs";

const input = await readStdinJson();
// Claude is already continuing because of this hook: don't loop forever.
if (input?.stop_hook_active) process.exit(0);

const CODE = /\.(c|m)?[jt]sx?$/;

// -z: NUL-separated and unquoted, so paths with spaces still match. Each entry
// is "XY path"; renames and copies are followed by an extra entry holding the
// original path.
const entries = run("git status --porcelain -z --untracked-files=all").stdout.split("\0");
const changed = [];
let codeChanged = false;
for (let i = 0; i < entries.length; i++) {
  const entry = entries[i];
  if (entry.length < 4) continue;
  const status = entry.slice(0, 2);
  const file = entry.slice(3);
  if (/[RC]/.test(status)) i++;
  if (CODE.test(file) || /(^|\/)tsconfig\.json$/.test(file)) codeChanged = true;
  if (CODE.test(file) && !status.includes("D")) changed.push(file);
}
if (!codeChanged) process.exit(0);

const checks = ["pnpm typecheck", "pnpm lint"];
if (changed.length > 0) {
  const files = changed.map((file) => JSON.stringify(file)).join(" ");
  checks.push(`pnpm exec jest --findRelatedTests ${files} --passWithNoTests`);
}

for (const command of checks) {
  const result = run(command);
  if (!result.ok) {
    console.error(`${command} failed. Fix it before finishing:\n${tail(result.output)}`);
    process.exit(2);
  }
}
