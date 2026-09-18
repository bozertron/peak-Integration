# Research Wave Status

## Wave 1 — Specialist research

Completed and queued outputs from five agents. Their chat IDs and focus areas are recorded in `source-index.md`.

## Wave 2 — Cross-functional synthesis

In progress. AREA-102 and AREA-105 now have verified UI handoffs: Discovery likes and map intro requests preserve listing context and open Communications with the Mountain Horn contact selected. Backend persistence, authorization, realtime transport, and moderation remain open implementation work. `wave-2/AREA-108-synthesis-and-scope.md` is the first cross-functional checkpoint, consolidating product naming, canonical tool homes, handoffs, open decisions, and implementation guardrails. Architecture/security reconciliation and QA/release synthesis remain queued.

## Wave 3 — Final ticket package

Will produce the ordered backlog, decision register, dependency graph, definitions of ready/done, release gates, and operational follow-through runbook.

## Current audit checkpoint

A direct requirement audit has been added as `AREA-106-requirements-audit.md`. The prior tickets were not fully exhaustive: they captured the five major areas, but omitted or underspecified several explicit copy removals, the seven-item landing-page inventory, map-as-secondary constraint, exact hero/header wording, Flow sub-capabilities, Lexicon tile behaviors, and the distinction between intentional Communications and ordinary close-contact conversations. Those requirements are now recorded and linked back to the five implementation tickets.

A deployment-governance ticket has been added as `AREA-107-agent-orchestration-protocol.md`. It captures every supplied agent constraint: one agent/one file, research-execute-test-return-stop, mandatory preamble and verbatim prohibited block, SKIP/STOP-SAFE, anti-clobber, probe pins, blind critic, kill-mutation, two-round cap, no agent commits, three-argument helper, and timeout classes. The canonical 11-rule PROHIBITED block itself was not present in the supplied note, so the first governed wave must retrieve it or stop and ask rather than inventing it.
