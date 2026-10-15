// Shared helpers for the Claude Code hooks in this folder.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// The repo root, whatever directory Claude is currently in.
export const projectDir =
  process.env.CLAUDE_PROJECT_DIR ??
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

// Hooks get their input as JSON on stdin.
export async function readStdinJson() {
  let raw = "";
  for await (const chunk of process.stdin) raw += chunk;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Run a command in the repo root. `shell: true` lets Windows find the
// pnpm.cmd shim. Colours are off so feedback to Claude is plain text.
// `stdout` is untrimmed, for output where leading spaces matter.
export function run(command) {
  const result = spawnSync(command, {
    cwd: projectDir,
    shell: true,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
    env: { ...process.env, FORCE_COLOR: "0", NO_COLOR: "1" },
  });
  const output = [result.error?.message, result.stdout, result.stderr].filter(Boolean).join("\n");
  return { ok: result.status === 0, output: output.trim(), stdout: result.stdout ?? "" };
}

// Keep feedback short: the end of a long log is the useful part.
export function tail(text, max = 4000) {
  return text.length > max ? `...\n${text.slice(-max)}` : text;
}
