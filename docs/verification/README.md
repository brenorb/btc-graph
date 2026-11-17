# Progress verification

| Skill | What it checks | Tool |
| --- | --- | --- |
| [verify-progress-tabs](../../.claude/skills/verify-progress-tabs/SKILL.md) | Progress marked in one tab is never erased by another | TLA+ / TLC, 73 states, plus `tests/progress-tabs.test.ts` |

The model found that each tab saved its whole stale copy of the progress map, so marks made in another tab were lost. Marks now change one node in storage, and tabs reload on `storage` events.

## Track progress on a topic

Generated with pstack `/statechart` from [TrackProgress.tla](flows/track-progress/TrackProgress.tla) ([TLC report](flows/track-progress/report.md)). Pressing the current mark again clears it.

```mermaid
---
title: "Track progress on a topic"
---
stateDiagram-v2
  state "Legend" as legend {
    lg0: known
    lg1: unmarked
    lg2: studying
  }
  class lg0 teal
  class lg1 tan
  class lg2 blue
  s0: Not marked
  s1: Know it
  s2: Learning
  s3: Need to learn
  [*] --> s0
  s0 --> s1: you press know it
  s0 --> s2: you press learning
  s0 --> s3: you press need to learn
  s1 --> s0: you press know it again
  s1 --> s2: you press learning
  s1 --> s3: you press need to learn
  s2 --> s0: you press learning again
  s2 --> s1: you press know it
  s2 --> s3: you press need to learn
  s3 --> s0: you press need to learn again
  s3 --> s1: you press know it
  s3 --> s2: you press learning
  class s0 tan
  class s1 teal
  class s2 blue
  class s3 blue
```
