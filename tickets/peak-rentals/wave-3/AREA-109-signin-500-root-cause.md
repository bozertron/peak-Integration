# [AREA-109] Sign-in 500 root cause and diagnostic-matrix pressure test

- Priority: P0
- Phase: 1 (release gate — blocks all UI work)
- Owner: Orchestrator
- Source: "Peak Rentals — Release-Blocking Diagnostic Matrix" + controlled local reproduction
- Dependencies: none
- Risk: release-blocking / authentication
- Status: Root cause CLASS determined by experiment. Exact variant needs one server-side reading.

## Intent

The supplied diagnostic matrix is evidence-complete but untested. This ticket
pressure-tests its declarations against a controlled reproduction, and replaces
its twenty-field evidence package with a single unauthenticated probe.

## Method

The matrix asks for evidence we cannot obtain (server logs for a v0.build
preview). Rather than wait on it, the failure was reproduced locally against
this exact codebase: `next start` on a production build, one environment
variable changed per scenario, capturing HTTP status, response body, and
server stderr.

Reproduction scripts and raw logs: session scratchpad (`experiment.sh`,
`probe.sh`, `scn-*.log`, `probe-*.log`). Commit them to `tickets/peak-rentals/evidence/`
before this ticket closes.

## Findings — evidence table

| # | Scenario | `POST /sign-in/email` | Response body | Server stderr |
|---|---|---|---|---|
| 1 | All config correct, valid credentials | **200** | full JSON session + user | none |
| 2 | All config correct, wrong password | **401** | `{"message":"Invalid email or password","code":"INVALID_EMAIL_OR_PASSWORD"}` | none |
| 3 | `BETTER_AUTH_SECRET` unset | **500** | **empty** | `BetterAuthError: You are using the default secret.` |
| 4 | `DATABASE_URL` unset | **500** | **empty** | `Could not validate the database schema` / `no PostgreSQL user name specified in startup packet` |
| 5 | `DATABASE_URL` set, auth tables absent | **500** | **empty** | `BetterAuthError: Database schema mismatch` |

### F1 — An empty 500 body is the fingerprint of a configuration fault
A correctly configured deployment returns a JSON body on **every** outcome,
including failure (scenario 2). All three configuration faults return 500 with a
zero-length body. If the preview's 500 has an empty body, the cause is
configuration or initialisation, not application logic. This single observation
is obtainable from the browser Network tab and eliminates most of the matrix.

### F2 — `GET /api/auth/ok` is a zero-cost health oracle
Better Auth mounts `/api/auth/ok`. Measured: `{"ok":true}` + 200 when healthy,
**500 in all three fault scenarios**. It needs no credentials, no payload, no
request ID, no correlation ID, and no server access.

### F3 — `GET /` proves nothing
The landing route returned **200 in all five scenarios**, healthy and broken
alike, because it is statically prerendered. "The site loads but sign-in fails"
is consistent with every hypothesis and must not be treated as evidence.

### F4 — The three faults are externally indistinguishable
All three produce byte-identical external symptoms (500, empty body, `/ok` 500).
Separating them **requires** one server-side reading. The matrix is correct that
server logs are irreducible — but only for this last narrowing step, after the
probe has already established the fault class.

## Pressure test of the matrix's declarations

| Matrix declaration | Verdict | Basis |
|---|---|---|
| "Do not classify repeated identical 500s as retryable without server evidence" | **UPHELD** | Scenarios 3–5 are deterministic. Retry can never succeed. |
| "Do not patch based solely on opaque browser `c.js` errors, HMR reconnects, or snapshot 404s" | **UPHELD** | Confirmed noise; unrelated to the auth failure surface. |
| Nine checks presented as co-equal peers | **PRIORITY-INVERTED** | "Validate auth configuration" is listed fifth. It is the only check that discriminates, and should run first. |
| **"Rollback is the safest release action"** | **UNSAFE — REJECT** | All three root causes are environment-scoped, not code-scoped. Redeploying older code inherits the same variables and fails identically. See F5. |
| Evidence package of ~20 fields | **DISPROPORTIONATE** | The fault class is resolvable with one unauthenticated GET (F2) plus one body-length observation (F1). |
| Missing-evidence list | **INCOMPLETE** | Omits the two decisive items: response **body length**, and whether the auth tables exist in the target database (scenario 5 — a live, confirmed 500 mode). |

### F5 — Rollback is not a valid remedy for any confirmed cause
Environment variables are bound to the deployment environment, not the commit.
Rolling back to a "last known-good deployment" carries the same variables and
reproduces the same 500. Worse: if the known-good deployment *does* succeed
under an identical test, that is evidence of **environment drift**, and the
matrix's own decision rule would then direct the operator to ship older code
while leaving the real fault in place. Rollback should be struck from this
incident's remedy set.

## Recommended replacement procedure (supersedes the matrix for this incident)

1. `curl -i https://<preview-host>/api/auth/ok`
   - `{"ok":true}` → auth stack is healthy; the 500 is elsewhere. Stop; re-scope.
   - 500 → configuration fault confirmed. Continue.
2. Record the sign-in response **body length**. Empty confirms F1.
3. Read the server-side stderr for that route once. Match against scenarios 3–5:
   - `default secret` → set `BETTER_AUTH_SECRET` in the preview environment.
   - `no PostgreSQL user name` / connection error → `DATABASE_URL` unset or unreachable.
   - `Database schema mismatch` → run the migration against the target database.
4. Re-probe `/api/auth/ok` to confirm. Do not roll back.

## Acceptance criteria

- `GET /api/auth/ok` on the affected preview returns `{"ok":true}` with status 200.
- `POST /api/auth/sign-in/email` returns 200 for valid credentials and 401 with a
  JSON body for invalid ones — never an empty-bodied 500.
- The specific fault variant (3, 4, or 5) is recorded with its server-side line.
- Reproduction scripts and raw logs are committed under `tickets/peak-rentals/evidence/`.
- The rollback recommendation is formally withdrawn from this incident record.

## Verification evidence

- Controlled five-scenario reproduction, statuses and stderr as tabled above.
- Post-fix probe output.

## Rollout and rollback

Remedy is a configuration change in the deployment environment plus, for
variant 5, a schema migration. **No code rollback.** Preserve the failing
deployment's environment-variable *names* (never values) before changing them.

## Follow-through checkpoints

- Post-fix: `/api/auth/ok` returns 200; one full sign-in round trip succeeds.
- Deployment: add `/api/auth/ok` to the deployment smoke check so this class of
  fault is caught before a human reports it.
- Monitoring: alert on empty-bodied 5xx from `/api/auth/*`.
- Owner and escalation path: Orchestrator; unresolved ambiguity escalates to the user.

## Open question for the user

Which environment is affected — the v0.build preview only, or also a production
deployment? The remedy is environment-scoped, so this determines blast radius.
