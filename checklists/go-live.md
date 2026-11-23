# The go-live checklist

Read this before the first release, and again before every big release. Each line needs a proof: a file, a log line, an email or a count. "I think so" is not a proof.

## Two copies

- [ ] **Dev and live are separate**: each has its own database, its own file storage, its own secrets and its own address.
- [ ] **Nothing on dev can reach live data**, and dev only holds fake customers.
- [ ] **Live keys are only on live**: payment keys, email settings and the AI model key for live are not used on dev.

## Domain

- [ ] **The domain opens the live copy**, not dev.
- [ ] **The padlock shows** in the browser (a valid certificate), on every page.
- [ ] **Two-factor sign-in is on** for the account that holds the domain, and you know who can change it.

## Security review

- [ ] **The agent has reviewed the whole app** against CLAUDE.md and docs/roles.md, and you have read the list of findings.
- [ ] **Every high finding is fixed**, each with a test, through the pipeline.
- [ ] **Changing a number in a link** never shows another customer's data (try it yourself on dev).
- [ ] **The logs contain no private details** (names, emails, health or payment information).
- [ ] **No secrets in the code** or in the repository history.

## Backups and a restore test

- [ ] **Backups run automatically**, and you know how far back they go.
- [ ] **You have restored a backup** into a separate test copy, never over the live data.
- [ ] **The counts match** after the restore (for example locations, services and bookings).
- [ ] **The restore steps are written down** in docs/release.md, so someone else could follow them.

## Alerts that reach a person

- [ ] **A test error was forced on purpose**, on dev and on live.
- [ ] **The alert arrived** by email or on a phone, and you noted how long it took.
- [ ] **At least two people receive alerts**, so a holiday does not mean silence.
- [ ] **Budget alerts are set** on every paid service.

## Uptime check

- [ ] **An outside service opens your most important page** every few minutes (for us, the booking page).
- [ ] **It alerts the same people** as the error alerts.
- [ ] **You have seen it fail once**, for example by pointing it at a page that does not exist, and the alert arrived.

## Release and going back

- [ ] **Live waits for your approval** in the pipeline, after the checks and the dev deploy have passed.
- [ ] **Only the owner (or the people you choose) can approve** a deploy to live.
- [ ] **Going back is practised**: you have sent the last good version through the pipeline once.
- [ ] **docs/release.md** says how a change goes live, who approves, and how you go back.

## The never-forget list

- [ ] **Read checklists/never-forget.md once more**: backups, access, two-factor sign-in, logs, secrets, privacy policy and terms, budget alerts, and a plan for a bad day.

From now on: dev first, then live.
