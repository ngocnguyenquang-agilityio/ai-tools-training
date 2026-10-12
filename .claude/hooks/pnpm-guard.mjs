// PreToolUse (Bash/PowerShell): this repo uses pnpm only. Block npm, yarn and npx.
// Exit code 2 blocks the tool call and sends stderr back to Claude.
import path from "node:path";
import { readStdinJson } from "./lib.mjs";

const BLOCKED = new Map([
  ["npm", "pnpm"],
  ["yarn", "pnpm"],
  ["npx", "pnpm dlx (or pnpm exec for local bins)"],
]);

// Prefixes that run the next word as the real command.
const WRAPPERS = new Set(["rtk", "proxy", "sudo", "env", "time", "exec", "command", "nohup"]);

const input = await readStdinJson();
const command = (input?.tool_input?.command ?? "")
  // Heredoc bodies and PowerShell here-strings are text, not commands.
  .replace(/<<-?\s*['"]?(\w+)['"]?[^\n]*\n[\s\S]*?\n\s*\1\s*(?=\n|$)/g, "")
  .replace(/@(['"])[\s\S]*?\1@/g, "")
  // So are quoted strings, e.g. a commit message that mentions npm.
  .replace(/"(?:\\.|[^"\\])*"|'[^']*'/g, '""');

for (const segment of command.split(/&&|\|\||[;|&\n(){}]/)) {
  const words = segment.trim().split(/\s+/);
  let i = 0;
  // Skip env assignments (FOO=bar), flags of wrappers, and wrappers (rtk, sudo, ...).
  while (i < words.length && (/^\w+=/.test(words[i]) || WRAPPERS.has(words[i]) || /^-/.test(words[i])))
    i++;
  const bin = words[i] && path.basename(words[i].replace(/\\/g, "/")).replace(/\.(cmd|exe|ps1)$/i, "");
  if (bin && BLOCKED.has(bin)) {
    console.error(
      `Blocked "${bin}": this repo uses pnpm only (see CLAUDE.md). Use ${BLOCKED.get(bin)} instead.`,
    );
    process.exit(2);
  }
}
