# Review

- Run the `review` skill at the end of a unit of work that changed code, before reporting back and before handing me commit commands.
- Not after every edit. Skip it when the diff has no code (docs or config text only).
- The skill is the single source of review criteria and diff handling (merge-base, uncommitted and untracked files). Do not restate or override them here.
- After the review: fix hard violations and real spec gaps, then re-run typecheck and tests.
- Show me the remaining judgement-call findings with the report, then give the commit commands. I run the commit.
