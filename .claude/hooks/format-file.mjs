// PostToolUse (Edit/Write): format the edited file with Prettier, and run
// eslint --fix on JS/TS files. ESLint errors that can't be fixed are sent
// back to Claude (exit 2).
import path from "node:path";
import { projectDir, readStdinJson, run, tail } from "./lib.mjs";

const input = await readStdinJson();
const filePath = input?.tool_input?.file_path;
if (!filePath) process.exit(0);

const relative = path.relative(projectDir, path.resolve(projectDir, filePath));
// Skip files outside the repo (plans, memory, scratchpad).
if (relative.startsWith("..") || path.isAbsolute(relative)) process.exit(0);

const quoted = JSON.stringify(relative);

// Prettier itself skips files in .prettierignore and unknown file types.
run(`pnpm exec prettier --write --ignore-unknown ${quoted}`);

if (/\.(c|m)?[jt]sx?$/.test(relative)) {
  const eslint = run(`pnpm exec eslint --fix --no-warn-ignored ${quoted}`);
  if (!eslint.ok) {
    console.error(`ESLint errors remain in ${relative}:\n${tail(eslint.output)}`);
    process.exit(2);
  }
}
