---
name: verify-progress-tabs
description: Check that learning progress marked in one btc-graph tab is never erased by another open tab. Use when changing loadProgressState, saveProgressState, updateNodeProgress or sanitizeProgressState in src/core/graph.ts, or setProgress, progress import, or the storage event listener in src/app.ts.
---

# Verify progress across tabs

**Property.** `NoMarkLost`: localStorage always holds the latest mark made on each topic, from whichever tab made it.

**Harm if broken.** A learner's progress disappears after they use the graph in two tabs.

## Run

```sh
export TLA2TOOLS=/absolute/path/to/tla2tools.jar   # TLC 1.7.4 release
export JAVA=/path/to/java                          # Java 11 or later
bash scripts/verification/check-model.sh .claude/skills/verify-progress-tabs/model/ProgressTabs.tla
bash scripts/verification/check-model.sh .claude/skills/verify-progress-tabs/model/ProgressTabs.tla --mutant
npx vitest run tests/progress-tabs.test.ts
```

The model must pass (73 distinct states). The `--mutant` run replays the code before commit 882a2fa and must report `NoMarkLost` violated: tab 1 marks one topic, then tab 2, which loaded earlier, marks another and writes back its stale copy. The test replays that path with a shared fake storage. Read every TLC result with the pstack `/statechart` skill.

## Coverage

Synced with the code at commit `882a2fa`. Move this forward only after you confirm that the model still describes the code at the new commit.

| Model step | Code |
| --- | --- |
| `Mark` | `setProgress` (`src/app.ts`) → `updateNodeProgress` (`src/core/graph.ts`) |
| `Sync` | the `storage` event listener added at the end of app start-up |

`updateNodeProgress` reads and writes in one synchronous call. Browsers do not interleave two tabs' scripts inside one, so the model treats it as one step.

## Not covered

Export, the URL view state, and two tabs marking the same topic at once: the later write wins, as it did before.
