# The founder questions

Settle these before you ask an agent to build anything. Write a short answer to each one, in your own words. A short, honest answer is better than no answer, because the agent turns every gap into a guess. If you have not decided something, write "not decided yet", and the plan will list it as an open question.

Give your answers to the agent at the start of the planning interview (`prompts/04-plan.md`).

## The problem and the money

- [ ] **1. What problem does the app solve?** One sentence that a customer would understand.
  Example (Nextia Clinic): patients cannot book or move an appointment outside opening hours, and the front desk spends hours on the phone.
- [ ] **2. Who pays, and why?** Who pays for the app or through the app, and what do they get for it?
  Example: the clinic pays for the app because it saves front desk time; patients pay a deposit to keep their booking.

## People and data

- [ ] **3. Who uses the app, and what may each person do?** Every kind of person, including staff, customers and any AI assistant. One line each.
  Example: owner (everything, including refunds); location manager (staff, hours and reports for their own location); front desk (bookings, payments and cash for their own location); practitioner (their own calendar and their own patients' notes); patient (their own bookings and payments); AI receptionist (a short list of actions).
- [ ] **4. What data does the app keep, and how sensitive is it?** Names and emails are personal. Health information, payment details and information about children need much more care.
  Example: names, contact details, appointments, payments and health information. Health information is the most sensitive.

## Risk

- [ ] **5. Which laws apply to you?** Start from `checklists/rules-that-apply.md`. This is not legal advice; ask a professional if your data is sensitive.
  Example: federal and provincial privacy laws, the stricter rules for health information, and French language rules because we serve patients in Quebec.
- [ ] **6. What must never go wrong?** The three things that would hurt your business the most.
  Example: a double booking; a patient seeing another patient's record; a refund to the wrong person.

## Limits

- [ ] **7. What is not in version one?** The good ideas that can wait, so the first version stays small enough to finish.
  Example: a phone app in the app stores, billing to insurance companies, video visits, other clinics using the app.
- [ ] **8. What is your monthly budget?** For the agent, hosting, email, payments and any AI model. Set a budget alert at this amount on every paid service.
- [ ] **9. How will you know that it works?** One or two things you can count.
  Example: fewer phone calls to the front desk, and fewer missed appointments.

## Then

- [ ] I gave my answers to the agent, and the one-page plan (`docs/plan.md`) agrees with them.
- [ ] Every requirement in the plan is approved on the review page.
- [ ] The open questions in the plan have an owner (usually me) and a date to decide.
