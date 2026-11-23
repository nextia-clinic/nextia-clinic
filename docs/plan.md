# Nextia Clinic — One-Page Plan

*A dental and medical clinic with seven locations across Quebec and Ontario (Montréal, Laval, Toronto, Mississauga, Ottawa, Kitchener, Oshawa). The app works fully in English and French, with light and dark themes.*

## The problem

Patients cannot book or move an appointment outside opening hours, and the front desk spends hours on the phone.

## Who pays, and why

Patients pay a **$50 deposit by card at booking** for any service of **$150 or more**. The rest is paid after the visit by card, Interac e-Transfer, or cash. (Who pays to run the app, and how the deposit is handled, are open questions below.)

## The users, and what each may do

- **Owner (me)** — everything, including approving refunds.
- **Location manager** (one per location) — staff, hours, and reports for their own location.
- **Front desk** — bookings, payments, and cash for their own location.
- **Practitioner** — their own calendar and their own patients' notes.
- **Patient** — their own bookings and payments.
- **AI receptionist** — reads `hello@nextiaclinic.com` and the website chat; answers from clinic policies; books and moves appointments. It never gives medical advice, never sees medical notes, only *proposes* refunds, and hands off to the front desk when it is not sure.

## The data

The app keeps names, contact details, appointments, payments, and health information. **Health information is the most sensitive.**

## The business rules

- A $50 card deposit is taken at booking for any service of $150 or more.
- The remainder is paid after the visit by card, Interac e-Transfer, or cash.
- Cancelling is free up to **24 hours before the appointment time** — a full 24-hour window, not simply the day before the date. Cancelling later than that (including a no-show) means the **deposit is kept**.
- Only the **owner** can approve a refund. The AI receptionist can only *propose* one.
- Every payment change is logged with **who did it and when**. Every refund also records the **reason**.
- Staff (location manager and front desk) act within **their own location** only.
- Practitioners see only **their own** calendar and their own patients' notes.
- **Interac e-Transfer** is sent by the patient to **payments@nextiaclinic.com** with their **booking code** (e.g. `NC-4821`) in the message. The app matches the transfer to the booking by that code. If there is no clear match, the **front desk** checks it — a payment is **never** marked as paid on a guess.
- **Cash** is taken at the **front desk** with a **receipt**, and **each location counts its cash every day**.
- A **reminder email** goes out the **day before the appointment**, in the **patient's language**.

## What must never go wrong

1. A double booking.
2. A patient seeing another patient's record.
3. A refund to the wrong person.

## Not in version one

- A phone app in the app stores.
- Billing to insurance companies.
- Video visits.
- Other clinics using the app.

## How we will know it works

- Fewer phone calls to the front desk.
- Fewer missed appointments.

## Open questions

Each needs an owner (default: me, the owner) and a date to decide.

1. **Deposit applied to the bill** — When the patient attends, is the $50 deposit applied to the final bill, or kept separately? *(The cancel/no-show rule is now decided: free up to 24 hours before, deposit kept after that.)*
2. **Who pays to run the app** — Who covers hosting, email, payments, and AI model costs?
3. **Full data model and sensitivity** — Confirmed so far: names, contact details, appointments, payments, health information. Any other data to store, and how each is classified?
4. **Children / minors** — Does the clinic treat minors, and must the app handle guardian/parental consent and access?
5. **Which laws apply** — Not yet decided. Candidates to confirm with a professional (see `checklists/rules-that-apply.md`): federal PIPEDA, Quebec Law 25, Ontario PHIPA, and French-language rules (OQLF). *The English/French requirement itself is decided and firm.*
6. **Monthly budget** — Total monthly budget for the agent, hosting, email, payments, and AI model, so a budget alert can be set on every paid service.
