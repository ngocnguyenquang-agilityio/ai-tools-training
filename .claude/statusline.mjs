// Status line: the current branch, plus the issue number when the branch
// follows <type>/<issue>-<slug>. Claude Code passes session JSON on stdin.
import { readStdinJson, run } from "./hooks/lib.mjs";

await readStdinJson();
const branch = run("git branch --show-current").output;
const issue = branch.match(/^(?:feat|fix|chore|docs|test|refactor)\/(\d+)-/)?.[1];
const parts = [branch || "(detached)"];
if (issue) parts.push(`issue #${issue}`);
else if (branch === "feat/ai-tools" || branch === "main") parts.push("integration branch");
console.log(parts.join(" · "));
