# CLAUDE.md — Rules for every change

Rules that apply to **every** change in this project. They are short on purpose;
the full reasoning lives in the longer documents in `docs/` — see
[`docs/README.md`](docs/README.md) for the index. When in doubt, follow
[`docs/plan.md`](docs/plan.md) (product rules) and
[`docs/decisions.md`](docs/decisions.md) (architecture decisions).

## 1. Security

Patient health and payment data is highly sensitive (`docs/decisions.md` §2).
Protect it on every change.

- Encrypt data in transit and at rest.
- **Never store card numbers.** The payment provider holds them; we never do.
- Log every payment change with **who** and **when**; every refund also records
  the **reason** (`docs/plan.md`).
- Never commit secrets, keys, or credentials. Keep them in environment config,
  outside the repo.
- Validate and authorize every request at the boundary of each module
  (`docs/decisions.md` §8, Data flows).

## 2. Patient-data privacy

Health information is the most sensitive data we hold (`docs/plan.md`). The
privacy filter in **Shared helpers** screens data whenever it leaves toward a
person or the AI (`docs/decisions.md`, Data flows).

- A patient's record is visible only to that patient, their own practitioner,
  and staff of their own location acting within their role.
- **Medical notes never reach the AI receptionist** — the privacy filter strips
  them before anything reaches it.
- Send only what is needed: reminders and receipts carry the appointment time
  and place, never medical notes.
- A payment is **never** marked paid on a guess — if an Interac match is
  unclear, the front desk resolves it by hand (`docs/plan.md`).
- Collect and keep only the data the feature needs.

## 3. Roles & location scope

Each role may do only what the plan allows, and staff act within their own
location only (`docs/plan.md`, "The users" and "The business rules").

- **Front desk** and **location managers** see and act on **their own location
  only** — never another location's data.
- **Practitioners** see only their own calendar and their own patients' notes.
- **Patients** see only their own bookings and payments.
- Only the **owner** approves refunds. The AI receptionist can only *propose* one.
- Enforce the role-and-location check in **People and roles**, at the door of
  every module — the AI receptionist cannot bypass it (`docs/decisions.md`,
  Data flows).

## 4. English & French

Both languages are a firm requirement, fully, from the first page
(`docs/decisions.md` §4). The bilingual rule itself is decided and not open.

- **Every page works fully in English and French** — screens, emails, receipts,
  and the AI receptionist's replies.
- Keep all wording in language files, never hard-coded in the code, so a new
  language can be added later.
- A patient's chosen language travels with everything sent to them — including
  the day-before reminder, which goes out in the patient's language
  (`docs/plan.md`).
- No change is complete if it adds or changes user-facing text in only one
  language.

## 5. Testing

Tests protect the three things that must never go wrong: a double booking, a
patient seeing another's record, and a refund to the wrong person
(`docs/plan.md`).

- **Every change comes with its own tests** — no change is complete without them.
- **All tests must pass before a pull request is opened.** A red test blocks the
  PR.
- Cover the rules that matter: role-and-location scope, the no-double-booking
  slot check, the privacy filter keeping medical notes from the AI, and both
  languages.
- **Use only our fake patients in tests and examples** — Maria Lopez, Jean Roy,
  Priya Shah, and Daniel Kim. Never use a real person's details.

## 6. Branches & pull requests

All work flows through branches and review. Releases are never done by hand
(`docs/decisions.md` §6, §9).

- **Work only on a branch** — never commit directly to `main`.
- **Every change ships as a pull request.** All tests pass before the PR is
  opened (§5).
- **Never deploy by hand.** Deploys happen through the pipeline, not from a
  laptop.
- **Ask the owner before adding any new paid service or outside/third-party
  service.** Cost and who receives our data are the owner's call
  (`docs/plan.md`, open questions 2 and 6) — never add one on your own.
- Keep each PR focused and reviewable.

## 7. Docs stay current

The documents in `docs/` are the single source of truth. Code and docs must
never drift apart.

- When a change alters a rule, flow, or decision, **update the matching document
  in the same pull request** — `docs/plan.md` for product rules,
  `docs/decisions.md` for architecture decisions.
- When a decision changes, record it in `docs/decisions.md`; don't let the old
  wording stand.
- When an open question in `docs/plan.md` is answered, move it from open
  questions into the decided rules.
- Keep `docs/README.md` (the index) in step when documents are added or removed.

## 8. Manual steps

When something can only be done by the owner by hand (creating an account,
setting a secret, a one-off in a dashboard), the work isn't finished until the
instructions are written down.

- Write **step-by-step instructions in `docs/manual-steps/`** for anything the
  owner must do by hand.
- One file per task, in plain language, in the order the steps must be done —
  each step something the owner can follow without guessing.
- Never put secrets, keys, or passwords in these files; describe where the owner
  enters them instead.
- Reference the manual-steps file from the pull request that needs it, so nothing
  is forgotten before release.
