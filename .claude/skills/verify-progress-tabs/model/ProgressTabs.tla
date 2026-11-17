---------------------------- MODULE ProgressTabs ----------------------------
\* Two browser tabs of btc-graph sharing one localStorage key. Each tab
\* loaded the progress map when it opened (loadProgressState) and marks
\* topics through setProgress.
\*   Mark(t, n) -> setProgress: the old code changed the tab's own copy and
\*                 saved all of it; the fix calls updateNodeProgress, which
\*                 re-reads storage and changes one node in one step
\*   Sync(t)    -> the 'storage' event listener reloads the tab's copy
\* Broken = TRUE is the code before the fix.
CONSTANT Broken

Tabs == {"t1", "t2"}
Nodes == {"utxo", "mining"}

VARIABLES stored, copy, last, marked

vars == <<stored, copy, last, marked>>

Init ==
  /\ stored = [n \in Nodes |-> "none"]
  /\ copy = [t \in Tabs |-> [n \in Nodes |-> "none"]]
  /\ last = [n \in Nodes |-> "none"]
  /\ marked = {}

Mark(t, n) ==
  /\ <<t, n>> \notin marked
  /\ marked' = marked \cup {<<t, n>>}
  /\ last' = [last EXCEPT ![n] = t]
  /\ IF Broken
     THEN /\ copy' = [copy EXCEPT ![t][n] = t]
          /\ stored' = [copy[t] EXCEPT ![n] = t]
     ELSE /\ stored' = [stored EXCEPT ![n] = t]
          /\ copy' = [copy EXCEPT ![t] = [stored EXCEPT ![n] = t]]

Sync(t) ==
  /\ ~Broken
  /\ copy[t] # stored
  /\ copy' = [copy EXCEPT ![t] = stored]
  /\ UNCHANGED <<stored, last, marked>>

Idle == UNCHANGED vars

Next == Idle \/ \E t \in Tabs : Sync(t) \/ \E n \in Nodes : Mark(t, n)

Spec == Init /\ [][Next]_vars

\* Storage holds the latest mark made on every topic, from whichever tab.
NoMarkLost == stored = last
=============================================================================
