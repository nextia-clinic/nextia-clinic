# Nextia Clinic — System Design Decisions

*Plain-language record of the big architecture questions, the owner's answers, and the resulting recommendation. One section per decision. See `docs/plan.md` for the product plan.*

---

## 1. How many users in the first year

**Decision:** A few thousand patients and a few dozen staff, across all seven locations.

**Why it matters:** The expected number of users — and how many use the app at the same moment — decides how much computing power we need and whether we must build for big traffic spikes. Building for millions when you have thousands wastes money and time; building for thousands when you'll have millions means painful rework.

**Trade-offs:** At this size a single modest server is plenty, so we can keep the setup simple and cheap. The cost is that if growth is far faster than expected, we'd need to revisit capacity — but that's a good problem to have and is straightforward to address later.

**What would change it:** Opening the app to other clinics (SaaS), a sudden marketing push, or tens of thousands of patients booking in the same window would push us toward a design that can add more servers on demand.

---

## 2. How sensitive is the data

**Decision:** Very sensitive. The app holds health information and payment information, both of which must be strongly protected.

**Why it matters:** How sensitive the data is sets the whole security bar — encryption, who can see what, how logins work, and how carefully every access is recorded. Health and payment data carry the highest legal and ethical duty of care, so this is a foundational choice, not something to bolt on later.

**Trade-offs:** Treating the data as highly sensitive means more work up front: encryption at rest and in transit, strict role-based access, full audit logs of who saw or changed what, and careful handling of card data (ideally letting a payment provider hold card numbers so we never do). The benefit is protecting patients and the clinic from a damaging breach; the cost is slower, more deliberate building and some ongoing security discipline.

**What would change it:** Nothing realistic lowers this — once health data is involved, the high bar stays. It could only rise further (e.g. stricter certification) if required by a partner, insurer, or regulator.

---

## 3. One business or many (SaaS)

**Decision:** One business with seven locations. It is not a SaaS and there is no plan to sell it to other clinics.

**Why it matters:** Building for many separate customers (SaaS) is far more complex — every piece of data must be walled off per clinic, billing must be per clinic, and clinics must set themselves up. Knowing it's one business means we can build the seven locations as one system with one set of rules, which is dramatically simpler and cheaper.

**Trade-offs:** Designing for a single business keeps the data model, logins, and billing simple. The seven locations are handled as a built-in concept (staff and front desk are scoped to their own location), not as separate tenants. The cost is that if you ever did want to sell it to outside clinics, that would be a significant rework — but the plan explicitly rules that out for version one, so we're not paying for flexibility we don't need.

**What would change it:** A decision to offer the app to clinics you don't own would turn this into a SaaS and change the foundation (per-clinic data separation and billing).

---

## 4. Which languages

**Decision:** English and French, fully, from the first page — with the app built so more languages can be added later.

**Why it matters:** Supporting two languages properly affects everything the patient sees and receives: screens, emails, receipts, and the AI receptionist's replies. If we plan for it from the start (keeping all wording in a single place rather than scattered through the code), adding a language later is easy; if we don't, retrofitting it is painful and error-prone.

**Trade-offs:** Doing full bilingual from day one — including the day-before reminder email in the patient's language, which the plan already requires — is more work up front than English-only. But "room for more languages later" is nearly free if we design for it now: all text lives in language files, and a patient's chosen language travels with everything sent to them. The cost of skipping this is a messy retrofit, so we take the small extra effort now.

**What would change it:** Dropping the bilingual requirement (not planned — the plan says it's firm) would simplify things. Committing to specific additional languages now would add translation work but not change the underlying design.

---

## 5. Web or mobile

**Decision:** A website that works well on a phone (and on tablets and computers). No app-store phone app for now.

**Why it matters:** This decides what we build and how patients reach it. A website reaches everyone instantly through a browser with nothing to download and no app-store approval; a native app is a separate, larger effort with its own review process and separate iPhone/Android builds. The plan already excludes a store app from version one, so confirming this keeps the first version focused.

**Trade-offs:** A responsive website is the fastest, cheapest path and works on every device from one codebase — ideal for booking and managing appointments. The limits are things a store app does better: push notifications to the lock screen and offline use. For this clinic, email/SMS reminders cover the notification need, so the website is the right call. If we later want a store app, the website's design can make that easier without a full rewrite.

**What would change it:** Strong demand for lock-screen push notifications, offline access, or a store presence for marketing would justify adding a native app later — which the plan lists as a possible future, not version one.

---

## 6. What happens if the app is down for an hour

**Decision:** A one-hour outage is a bad morning but not a dangerous one. Patients can still phone the clinic, and the front desk can fall back to phone and paper.

**Why it matters:** How much a short outage hurts decides how much we spend on keeping the app always-on. Guaranteeing near-zero downtime means running duplicate servers and databases in multiple places — real money and complexity. Accepting rare short outages lets us run a simpler, cheaper setup.

**Trade-offs:** Because a short outage is survivable, we can run a straightforward single-region setup and invest in solid, tested backups and quick recovery rather than expensive always-on redundancy. The trade is that a serious failure might take an hour or two to recover from, versus seconds for a fully redundant system — an acceptable deal here. We still aim for good everyday reliability; we just don't pay a premium to eliminate every rare outage.

**What would change it:** If downtime started causing real patient harm or major revenue loss — or if the clinic grew to depend on the app with no phone fallback — we'd invest in redundancy to shrink recovery time.

---

## 7. Where the data must live

**Decision:** Open question — not yet decided. To be settled when the hosting platform is chosen in the next step. Health and payment data are involved, so Canadian storage (Quebec and Ontario clinics; Quebec Law 25, Ontario PHIPA, federal PIPEDA) is the likely requirement and should be the working assumption until confirmed with a privacy professional.

**Why it matters:** Which country the data physically sits in is both a legal and a design question. Canadian health-privacy rules can require or strongly favour keeping health data in Canada, and this choice limits which hosting providers and regions are available — so it must be settled before, or as part of, picking the platform.

**Trade-offs:** Keeping data in Canada is safest for compliance but narrows hosting options and can cost a little more; allowing data abroad widens choice but risks running afoul of Canadian law for health data. Because this is undecided, we will design the app so the data's location is a configuration choice, not something hard-wired — keeping the option open without extra rework.

**What would change it:** Confirmation from a privacy professional, or the laws listed in `docs/plan.md` open question #5 and `checklists/rules-that-apply.md`, will turn this into a firm decision. The chosen hosting platform's available regions may also constrain it.

---

## 8. Suggested shape for the app

**Decision (recommendation):** Build a **modular monolith** in a **single repository (one codebase)**.

A plain-words explanation of the three choices:

- **Monolith** — the whole app is one program. Simplest to build and run, but over time everything can get tangled together, so one messy change can ripple everywhere.
- **Modular monolith** *(recommended)* — still one program you deploy as a single unit, but organised inside into clear, separate parts (for example: *booking*, *payments*, *patient records*, *AI receptionist*, *audit log*). Each part has a tidy boundary. You get the simplicity of a monolith with much of the cleanliness of separate services.
- **Services (microservices)** — the app is split into many small programs that run and deploy independently. Powerful for very large teams and huge scale, but it adds a lot of moving parts: network calls between pieces, harder testing, and more things that can break. Overkill for a few thousand users and a small team.

**Why this fits Nextia:**

- *A few thousand users* (Decision 1) means one program on a modest server is plenty — no need for the complexity of many services.
- *Very sensitive data* (Decision 2) is actually easier to protect when access rules and audit logging live in one well-structured place rather than being spread across many services that each must be secured and must talk to each other safely.
- *One business, not SaaS* (Decision 3) means we don't need the heavy data-separation that pushes some products toward services.
- *A one-hour outage is survivable* (Decision 6) means we don't need the always-on redundancy that services are sometimes used for.
- The clear modules map directly onto the plan's real-world boundaries: the booking rules, the payment/deposit/Interac/cash handling, the private patient records, the AI receptionist (which must *not* see medical notes), and the audit log. Keeping these as clean internal modules makes the "must never go wrong" list (no double booking, no patient seeing another's record, no refund to the wrong person) easier to enforce and review.

**Single repository (one codebase):** With one small team and one business, keeping everything in one repository is simplest — one place to find the code, one version of the truth, and easy to change a feature end-to-end. Many repositories only start to pay off with multiple independent teams, which isn't the case here.

**Trade-offs in plain words:**

- *Upside:* Fastest and cheapest to build; easiest to operate (one thing to deploy, back up, and monitor); easiest to keep secure and auditable; easy for a small team to understand the whole picture.
- *Downside:* It all scales up and down together — you can't give just the "payments" part more power on its own. At a few thousand users that doesn't matter. Discipline is needed to keep the internal modules tidy so the monolith doesn't slowly turn into a tangle; good module boundaries from the start prevent this.
- *The migration path is friendly:* because the parts are already cleanly separated inside, if one module ever truly needs to become its own service later (say the AI receptionist grows heavy), it can be lifted out without rewriting the whole app. We get simplicity now and keep the door open.

**What would change it:** Becoming a SaaS for many clinics, growth to very large scale, a much bigger team working in parallel, or one part (e.g. the AI receptionist) needing to scale or deploy independently would justify splitting that part into its own service — and possibly its own repository — later.

### Trade-offs vs the other two shapes (short list)

Compared with a **plain monolith**, the modular monolith is:
- **Better:** cleaner inside, so the "must never go wrong" rules (no double booking, no patient seeing another's record, no wrong refund) are easier to enforce and review; easier to pull a part out later if needed.
- **Worse:** a little more up-front thought to set the module boundaries, and some ongoing discipline to keep them tidy.

Compared with **services (microservices)**, the modular monolith is:
- **Better:** far simpler and cheaper to build, run, test, back up, and secure; one thing to deploy; a small team can hold the whole picture in their head.
- **Worse:** everything scales up and down together (you can't give just "payments" more power on its own), and all parts share one deploy — fine at a few thousand users, limiting only at large scale or with many independent teams.

### What would make me change my mind (short list)

I'd move **toward services** if:
- You decide to sell the app to other clinics (SaaS).
- Usage grows far beyond a few thousand users, with real traffic spikes.
- One part — likely the AI receptionist — needs to scale or be deployed on its own.
- The team grows to several groups that need to work and release independently.

I'd be fine staying a **plain monolith** (skip the modules) if:
- The app turned out much smaller and simpler than planned, with few distinct parts and no strict audit/role rules — which, given health data and the roles in the plan, is unlikely.

---

*All seven questions above were asked and answered one at a time with the owner on 2026-11-22. Decision 7 (data location) remains open pending the platform choice.*

---

## Data flows

How work moves through the app's five rooms: **Booking**, **People and roles**, **Payments**, **AI receptionist**, and **Shared helpers** (the back-of-house room that holds the login/identity guard, the audit log, the privacy filter, the scheduler, and email sending/receiving).

Two guards run throughout:

- **Role and location check** — "are you allowed to do this, and only for your own location/yourself?" This lives in **People and roles** and is applied at the door of every other room before it acts.
- **Privacy filter** — "strip out anything this person or the AI must not see (above all, medical notes)." This lives in **Shared helpers** and runs whenever data leaves a room toward a person or toward the AI.

### Flow 1 — A patient books an appointment and gets a reminder

1. **People and roles** — the patient signs in; the room confirms who they are and that their role is "patient." *(Role and location check: a patient may act only as themselves.)*
2. **Booking** — the patient picks a location, service, and time. The room checks the slot is free so two patients can't take it — this is where the "no double booking" rule is enforced. *(Role and location check again: the booking is tied to this patient only.)*
3. **Payments** — if the service is $150 or more, the room takes the $50 card deposit before the booking is confirmed. The card number is held by the payment provider, not us.
4. **Booking** — the appointment is saved and a booking code (e.g. `NC-4821`) is created. **Shared helpers** writes an audit entry: who booked, what, and when.
5. **Shared helpers** — the scheduler queues a reminder; the day before, the email is sent in the patient's language. *(Privacy filter: the reminder contains only the appointment time and place — no medical notes.)*

### Flow 2 — An Interac e-Transfer notice arrives and is matched to a booking

1. **Shared helpers** — the transfer notice lands in the `payments@nextiaclinic.com` inbox; the email-intake helper receives it.
2. **Payments** — the room reads the booking code from the message and looks for the one booking it matches.
3. **If there is one clear match → Payments** marks that booking paid and **Shared helpers** logs who/what/when. *(No person is involved here, but the action is still recorded, because every payment change is logged.)*
4. **If there is no clear match → People and roles + Payments** — it is handed to the **front desk of that location** to check by hand. *(Role and location check: only front desk for that location can resolve it.)* A payment is **never** marked paid on a guess.

### Flow 3 — A patient email reaches the AI receptionist

1. **Shared helpers** — the email lands in `hello@nextiaclinic.com` (or the website chat) and the intake helper receives it. *(Privacy filter: before anything reaches the AI, medical notes are withheld — the AI receptionist never sees them.)*
2. **AI receptionist** — the room reads the message and answers from clinic policies only. It never gives medical advice.
3. **If the patient wants to book or move an appointment → Booking** — the AI calls into the Booking room, which runs the **same** slot check (no double booking) and ties the change to that patient. *(Role and location check happens in Booking/People and roles, not in the AI — the AI cannot bypass it.)*
4. **If money is involved (e.g. a refund) → Payments** — the AI can only *propose* a refund; **Payments** records the proposal and only the **owner** can approve it.
5. **AI receptionist** — whenever it is unsure, it hands off to the **front desk** rather than guessing. **Shared helpers** logs what the AI did.

**In one line:** the role-and-location check is the doorway guard that **People and roles** applies at the entrance to every room, and the privacy filter is the screen that **Shared helpers** holds up whenever data leaves toward a person or the AI — most importantly keeping medical notes away from the AI receptionist.

