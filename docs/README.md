# Documents index

Every document for the Nextia Clinic project, and what each is for. Start with
the plan, then the decisions. The rules you must follow on every change live in
[`../CLAUDE.md`](../CLAUDE.md).

## Core

- [`plan.md`](plan.md) — the one-page product plan: the problem, the users and
  what each may do, the business rules, what must never go wrong, and the open
  questions still to decide.
- [`decisions.md`](decisions.md) — the architecture decisions in plain language
  (users, data sensitivity, SaaS or not, languages, web or mobile, outages, data
  location, app shape, hosting platform), plus the data flows between the app's
  rooms.
- [`../CLAUDE.md`](../CLAUDE.md) — the rules to follow on every change: security,
  privacy, roles, English/French, testing, branches and pull requests, keeping
  docs current, and manual steps.

## Guides

- [`setup-guide.md`](setup-guide.md) — what a new person needs before they can
  work on the project.
- `manual-steps/` — step-by-step instructions for anything the owner must do by
  hand (created per task as needed):
  - [`manual-steps/accounts.md`](manual-steps/accounts.md) — every account the
    app uses, who has access, two-factor status, which KeePass entry holds each
    secret, how to turn on two-factor where missing, and a leaver checklist.
  - [`manual-steps/cloudflare-token.md`](manual-steps/cloudflare-token.md) —
    create a Cloudflare API token scoped to Workers, D1, and R2 with an expiry
    date, load it from KeePass into your terminal without it showing on screen,
    verify it, and recover if it leaks.
  - [`manual-steps/two-factor.md`](manual-steps/two-factor.md) — turn on
    two-factor sign-in for your GitHub account.

## Checklists

- [`../checklists/founder-questions.md`](../checklists/founder-questions.md) —
  the questions to settle before asking an agent to build anything.
- [`../checklists/founder.md`](../checklists/founder.md) — what the owner must
  have ready before the build starts.
- [`../checklists/rules-that-apply.md`](../checklists/rules-that-apply.md) —
  how to work out which privacy and language laws apply (not legal advice).
- [`../checklists/go-live.md`](../checklists/go-live.md) — checks to pass before
  the first release and every big release.
- [`../checklists/never-forget.md`](../checklists/never-forget.md) — backups,
  restores, and other things to recheck every few months.

## Reference

- [`../outputs/06-platform/comparison.md`](../outputs/06-platform/comparison.md)
  — full platform comparison (Cloudflare vs Azure) and cost estimates behind
  decision 9.
- [`plan-review.json`](plan-review.json) — machine-readable review of the plan.
