# Review

- Run the `review` skill at the end of a unit of work, before reporting back and before handing me commit commands.
- Not after every edit. It always runs before a commit handoff, even for a docs or config diff, because the issue spec check still applies. Skip it only for an ad hoc docs or config edit that is not headed for a commit.
- The skill is the single source of review criteria and diff handling (merge-base, uncommitted and untracked files). Do not restate or override them here.
- After the review: fix hard violations and real spec gaps, then re-run typecheck and tests.
- Show me the remaining judgement-call findings with the report, then give the commit commands. I run the commit.
