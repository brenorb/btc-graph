--------------------------- MODULE TrackProgress ---------------------------
\* Marking how well you know one topic in the Bitcoin learning graph.
VARIABLES mark

vars == <<mark>>

Init == mark = "none"

Press(s) == mark' = IF mark = s THEN "none" ELSE s

Next == \E s \in {"need_to_learn", "learning", "know_it"} : Press(s)

Spec == Init /\ [][Next]_vars

OneMark == mark \in {"none", "need_to_learn", "learning", "know_it"}
=============================================================================
