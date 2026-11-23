# Platform Comparison — Cloudflare vs Azure

*For the Nextia Clinic booking app. Compares the two platforms only on the parts this app needs. Prices are **USD, public pay-as-you-go list rates**, read from live pricing pages in **November 2026**. Every price has its source link. See `docs/plan.md` and `docs/decisions.md` for the app itself.*

> **One-line recommendation:** **Azure** — because this app holds Canadian health data, and Azure is the only one of the two that can keep that data physically in Canada (Decision 7). The raw cost gap is small, and Microsoft for Startups credits make Azure effectively free for the first ~6 months. See [Recommendation](#recommendation) for what would change this.

---

## What the app needs (the only parts compared)

From the plan and decisions: a bilingual, mobile-friendly **website** (Decision 5), a **modular monolith** (Decision 8), **a few thousand patients and a few dozen staff** (Decision 1), **very sensitive health + payment data** (Decision 2), **single-region is fine** and **a one-hour outage is survivable** (Decision 6), and **data location likely must be Canada** (Decision 7, open — working assumption). Seven parts:

1. **Run the app** — compute to serve the website.
2. **Store data** — the relational database (patients, appointments, payments, audit log).
3. **Store files** — documents, receipts, intake forms, images.
4. **Timed jobs** — the day-before reminder email, daily cash-count prompts.
5. **Sign-in** — patient and staff authentication.
6. **Email in and out** — inbound (`hello@`, `payments@` for Interac matching, AI receptionist) and outbound (reminders, receipts).
7. **AI** — the AI receptionist.

---

## Product-by-product: what each platform uses

| Part | Cloudflare product | Azure product |
|------|--------------------|---------------|
| 1. Run the app | **Workers** (Paid plan) + Next.js adapter (OpenNext/vinext) | **App Service** (Linux, Premium v3 P0v3) |
| 2. Store data | **D1** (SQLite) | **Azure Database for PostgreSQL** Flexible Server (Burstable B1ms) |
| 3. Store files | **R2** (object storage) | **Blob Storage** (GPv2, Hot, LRS) |
| 4. Timed jobs | **Cron Triggers** on Workers (free) | **Azure Functions** (Consumption, Timer trigger) |
| 5. Sign-in | **No consumer-auth product** → self-build or 3rd party (Clerk/Auth0/Supabase) | **Microsoft Entra External ID** (CIAM) |
| 6. Email in/out | **Email Routing** (in, free) + **Email Service** (out, public beta) | **ACS Email** (out) + **gap on inbound** → M365 mailbox + Logic Apps |
| 7. AI | **Workers AI** (open models) — or call Claude API | **Azure OpenAI / AI Foundry** (GPT-4o family) — or call Claude API |

**Two gaps to note up front:**
- **Cloudflare has no sign-in product for patients.** Access/Zero Trust is for internal staff only ($7/user/mo, 50 free). You would self-build auth or add a third party. Azure has a first-class CIAM (Entra External ID, free to 50k monthly active users).
- **Neither platform receives inbound email natively in a clean way.** Cloudflare Email Routing *does* receive and can trigger a Worker (good fit for Interac-match and the AI receptionist intake). Azure's ACS Email **cannot receive at all** — you bolt on an M365 mailbox (~$7/mo) + Logic Apps. **On inbound email, Cloudflare is actually the better fit.**

---

## Pricing detail, per part, per platform

### 1. Run the app

| | Product | Price | Source |
|-|---------|-------|--------|
| **Cloudflare** | Workers Paid | **$5/mo** min; incl. 10M requests + 30M CPU-ms, then $0.30/M req, $0.02/M CPU-ms | [workers/platform/pricing](https://developers.cloudflare.com/workers/platform/pricing/) |
| **Azure** | App Service P0v3 (1 vCPU/4 GB) | **$61.32/mo** (730 hrs). Basic B1 = $13.14/mo as a cheaper launch tier | [app-service/linux](https://azure.microsoft.com/en-us/pricing/details/app-service/linux/) |

*Note:* Next.js does not run natively on Workers — it needs the OpenNext/vinext adapter. Azure App Service runs a standard Node/Next.js app directly. Azure's compute is a **fixed** monthly cost; Cloudflare's is near-free until you exceed generous included usage.

### 2. Store data

| | Product | Price | Source |
|-|---------|-------|--------|
| **Cloudflare** | D1 (SQLite) | Incl. 5 GB + 25B rows read + 50M rows written; then $0.75/GB-mo, $0.001/M read, $1.00/M written | [d1/platform/pricing](https://developers.cloudflare.com/d1/platform/pricing/) |
| **Azure** | PostgreSQL B1ms (1 vCore/2 GiB) + 32 GB | **~$17.56/mo** ($13.51 compute + storage $0.1265/GB-mo) | [postgresql/flexible-server](https://azure.microsoft.com/en-us/pricing/details/postgresql/flexible-server/) |

*Note:* At a few thousand patients, Cloudflare D1 stays inside its free/included limits (~$0). Azure Postgres is a small fixed cost but gives you a full standard Postgres engine. **Residency differs sharply — see [Where the data lives](#where-each-platform-keeps-your-data).**

### 3. Store files

| | Product | Price | Source |
|-|---------|-------|--------|
| **Cloudflare** | R2 | **$0.015/GB-mo**; Class A $4.50/M, Class B $0.36/M; **egress free**. Free: 10 GB | [r2/pricing](https://developers.cloudflare.com/r2/pricing/) |
| **Azure** | Blob (Hot, LRS) | **$0.020/GB-mo**; writes $0.055/10k, reads $0.0044/10k; egress first 100 GB/mo free then $0.087/GB | [storage/blobs](https://azure.microsoft.com/en-us/pricing/details/storage/blobs/) |

*Note:* For a clinic (tens of GB), file storage is a rounding error on either platform (< $1/mo). R2's free egress is a genuine edge if you ever serve a lot of file downloads.

### 4. Timed jobs (the day-before reminder)

| | Product | Price | Source |
|-|---------|-------|--------|
| **Cloudflare** | Cron Triggers on Workers | **Free** (invocations billed as normal Worker usage; trivial at this scale) | [workers/platform/pricing](https://developers.cloudflare.com/workers/platform/pricing/) |
| **Azure** | Functions (Consumption, Timer) | **$0** in practice — free grant of 1M executions + 400k GB-s/mo; a daily cron runs ~30×/mo | [functions](https://azure.microsoft.com/en-us/pricing/details/functions/) |

*Note:* Effectively free on both. You only pay the email provider for the messages the job sends.

### 5. Sign-in

| | Product | Price | Source |
|-|---------|-------|--------|
| **Cloudflare** | *No CIAM product.* Access (staff only) = $7/user/mo, 50 free | Self-build or 3rd party adds cost/effort | [zero-trust-services](https://www.cloudflare.com/plans/zero-trust-services/) |
| **Azure** | Entra External ID | **$0** up to **50,000 monthly active users**, then ~$0.03/MAU | [entra-external-id](https://www.microsoft.com/en-us/security/pricing/microsoft-entra-external-id) |

*Note:* This is a real differentiator. A few thousand patients is **free** on Azure with a managed, standards-based identity service. On Cloudflare you own the auth problem — either build it (Workers + D1 + WebAuthn/OAuth) or pay a third party (Clerk/Auth0/Supabase), which adds both dollars and the security burden of patient credentials for a health app. **Advantage: Azure.** (Caveat: Entra is the hardest piece to migrate off — see lock-in.)

### 6. Email in and out

| | Product | Price | Source |
|-|---------|-------|--------|
| **Cloudflare** | Email Routing (in) + Email Service (out, **beta**) | Inbound **free**; outbound 3,000/mo incl., then **$0.35/1,000** | [email-routing](https://developers.cloudflare.com/email-routing/) · [email-service/pricing](https://developers.cloudflare.com/email-service/platform/pricing/) |
| **Azure** | ACS Email (out) + M365 mailbox + Logic Apps (in) | Outbound **$0.00025/email** + $0.00012/MB (no free tier); inbound workaround ~$7/mo mailbox | [acs email-pricing](https://learn.microsoft.com/en-us/azure/communication-services/concepts/email-pricing) · [functions](https://azure.microsoft.com/en-us/pricing/details/functions/) |

*Notes:*
- **Inbound:** Cloudflare Email Routing receives mail and can hand it straight to a Worker — a clean fit for the Interac-code matching (Flow 2) and the AI receptionist intake (Flow 3). Azure ACS **cannot receive email**; you add a Microsoft 365 mailbox (~$7/mo) and a Logic App to pick messages up. **Advantage: Cloudflare on inbound.**
- **Outbound:** Azure ACS is cheaper per email ($0.25/1,000 vs $0.35/1,000) and is GA. Cloudflare's outbound sender is still **public beta** — fine to pilot, but for production deliverability of reminders/receipts you may want a proven third party (Resend/SES/Postmark) on either platform.

### 7. AI (the receptionist)

| | Product | Price | Source |
|-|---------|-------|--------|
| **Cloudflare** | Workers AI (open models) | $0.011/1,000 neurons; e.g. Llama 3.1-70b $0.293/M in, $2.253/M out | [workers-ai/pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) |
| **Azure** | Azure OpenAI / AI Foundry | **GPT-4o mini $0.15/$0.60** per 1M in/out; GPT-4o $2.50/$10.00 | [openai-service](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/) |

*Notes:*
- For a **patient-facing receptionist that must never give medical advice and must hand off when unsure** (plan + Flow 3), model quality and safety matter. Both platforms can host an open/first-party model, but you may well prefer to **call the Claude API** from either platform for quality — that cost then lands on an Anthropic invoice, not the platform bill, and is roughly equal on both.
- **Azure Canada caveat:** the cheapest model (GPT-4o mini) is only offered as **Global Standard**, which can process prompts **outside Canada**. To keep inference in-country you must use a **Standard (Regional)/PTU** deployment in Canada East with a model offered there (verify in the Foundry portal). **AI model choice — not booking volume — is the single biggest cost lever on either platform.**

---

## Monthly cost estimates

### Shared assumptions (stated so you can adjust)

Per booking: **10 page loads**; **~38 DB operations** (30 read / 8 write); **2–4 emails** (confirmation, day-before reminder, receipt); **~50%** of bookings involve an AI chat of **~3,000 input + 1,000 output tokens**; file storage grows to tens of GB total. The daily reminder cron is effectively free on both. AI priced on a **mid/low-cost model** (Workers AI ~Llama-70b rates; Azure GPT-4o mini). All figures exclude taxes, reserved-instance discounts, and any third-party LLM (Claude) you might add.

### Cloudflare

| | 1,000 bookings/mo | 20,000 bookings/mo |
|-|-------------------|--------------------|
| Workers base | $5 | $5 |
| Compute/DB/storage | within included (~$0) | within included (~$0; CPU near 30M ceiling) |
| Outbound email | within 3,000 incl. (~$0) | ~37k over → **~$13** |
| AI (Workers AI) | ~$3 | ~$68 |
| **Total** | **~$8/mo** | **~$86/mo** |

*If the receptionist calls Claude API instead of Workers AI, the Cloudflare bill drops to ~$5–6 (1k) and ~$18 (20k), with the LLM cost moving to Anthropic.* Source rates: [Workers](https://developers.cloudflare.com/workers/platform/pricing/), [Email Service](https://developers.cloudflare.com/email-service/platform/pricing/), [Workers AI](https://developers.cloudflare.com/workers-ai/platform/pricing/).

### Azure (before credits)

| | 1,000 bookings/mo | 20,000 bookings/mo |
|-|-------------------|--------------------|
| App Service P0v3 | $61.32 | $61.32 |
| PostgreSQL B1ms + 32 GB | $17.56 | $17.56 |
| Blob storage | ~$1 | ~$3 |
| Functions (cron) | $0 | $0 |
| Entra External ID | $0 (< 50k MAU) | $0 (< 50k MAU) |
| M365 mailbox (inbound) | $7 | $7 |
| Outbound email (ACS) | ~$1 | ~$21 |
| AI (GPT-4o mini) | ~$0.50 | ~$10 |
| **Total** | **~$89/mo** | **~$120/mo** |

*Using Basic B1 app tier instead of P0v3 drops the fixed baseline by ~$48/mo (~$41 at 1k, ~$72 at 20k), at the cost of no staging slots/autoscale.* Source rates linked in the per-part tables above.

### Reading the two

- **Cloudflare is cheaper at low volume** — its fixed floor is ~$5 vs Azure's ~$87. The ~$87 Azure baseline (compute + DB + inbound mailbox) is **fixed**: going from 1k to 20k bookings (20× traffic) only moves Azure from ~$89 to ~$120, because only email + AI scale per booking.
- **Both are inexpensive in absolute terms.** The difference between them (~$80/mo at low volume) is small against the cost of the app itself, and is dwarfed by the AI model decision and by compliance risk.
- **Add-ons not counted:** Cloudflare's hidden cost is **patient auth** (3rd-party CIAM or build time) — add roughly $0–25/mo plus engineering. Azure includes auth free.

---

## How Microsoft for Startups credits change the Azure cost

Microsoft for Startups (formerly Founders Hub) grants Azure credit via an **Azure Sponsorship subscription** at 100% off list rates for the sponsorship term. **Credits apply to all Azure usage, including Azure OpenAI.** Verified against the official FAQ (updated 2026-11-20).

| Tier | Credit | Valid for | How to unlock |
|------|--------|-----------|---------------|
| Entry | **$200** | 90 days | Sign up (for-profit early-stage startup; **credit card required**) |
| After business verification | **+$4,800** (the "$5,000" milestone) | 180 days | Verify the business |
| Next milestone | **$25,000** | one-time **2-year** window | Hit usage/growth milestones |
| Scaling / Investor Network | **up to $150,000** | 2 years from approval | Referral code from an affiliated investor/accelerator/university |

Sources: [Microsoft for Startups](https://www.microsoft.com/en-us/startups) · [official FAQ](https://learn.microsoft.com/en-us/startups/microsoft-for-startups/mfs-faqs) · [Azure Sponsorship offer MS-AZR-0036P](https://azure.microsoft.com/pricing/offers/ms-azr-0036p/).

**Effect on this app:** At **~$89–$120/mo**, the realistic self-serve credit of **$5,000 over the first ~6 months** covers **the entire Azure bill to $0 during that window** — many times over. The binding limit is the **time window (90 → 180 days)**, not the dollar amount; you cannot spend $5,000 on a $120/mo app before the window closes, and **unused credit does not carry forward**. If you qualify for the $25,000 (2-year) tier, Azure is effectively free for roughly two years.

**What happens when the credits run out:** The sponsorship subscription **automatically converts to pay-as-you-go at standard published rates** — no interruption, but also no grace discount. A **credit card is required up front** precisely so this switch is seamless. In plain terms: you quietly go from **$0/mo to ~$89–$120/mo** the day the window ends (or the day you exhaust the credit, whichever comes first). Budget for the real bill before that date — which ties directly to **plan.md open question #6 (monthly budget / budget alerts)**: set an Azure cost alert *now* so the conversion doesn't surprise you.

> Cloudflare has no equivalent broad credit program for this workload, but it barely needs one — its list cost is already ~$8–86/mo. Credits make Azure *temporarily free*; they do not change its *long-run* ~$89–120/mo cost, which is what you should plan the budget around.

---

## Where each platform keeps your data

This is the decisive dimension for a Canadian health-data app (Decision 2 + Decision 7).

**Azure — can keep data in Canada.** Two in-country regions: **Canada Central (Toronto, 3 availability zones)** and **Canada East (Québec City)**. You pin **App Service, PostgreSQL, and Blob Storage** to a Canadian region and the data at rest stays in Canada (replication stays Central↔East, within the country). Microsoft's commitment: *"will not store or process customer data outside the customer-specified Geo without your authorization."* Compliance coverage explicitly analyzes **PIPEDA, Ontario PHIPA, Quebec private-sector law (Law 25 lineage), FIPPA, ISO 27018**, plus **CCCS Protected B**. Sources: [regions-list](https://learn.microsoft.com/en-us/azure/reliability/regions-list) · [data-residency](https://azure.microsoft.com/en-us/explore/global-infrastructure/data-residency/) · [Canada Protected B](https://learn.microsoft.com/en-us/azure/compliance/offerings/offering-canada-protected-b).
- **Two Azure gaps to design around:** **Entra External ID** is a global identity service (identity data not guaranteed in-Canada), and **Azure OpenAI Global Standard** can route inference anywhere — use a **Canada East Regional/PTU** deployment to keep AI in-country ([deployment-types](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/deployment-types)).

**Cloudflare — cannot currently guarantee Canadian storage.** Cloudflare is a global edge platform. Its Data Localization Suite can keep **TLS termination / traffic inspection** in Canada (Regional Services + Geo Key Manager support Canada), but the **stored data** products do not: **R2 and D1 jurisdictional guarantees cover only `eu`, `us`, and `fedramp` — there is no Canada jurisdiction.** The nearest control is a best-effort **location hint** (`wnam`/`enam`) that explicitly *does not guarantee* placement and spans the US. Workers AI has no Canada pinning. Sources: [R2 data-location](https://developers.cloudflare.com/r2/reference/data-location/) · [D1 data-location](https://developers.cloudflare.com/d1/configuration/data-location/) · [DLS region support](https://developers.cloudflare.com/data-localization/region-support/).

**Verdict:** If the working assumption in Decision 7 holds (Canadian residency for health data), **Azure solves it and Cloudflare does not** — on Cloudflare you could not contractually keep patient records in Canada today without a legal/DPA review, and likely not at all for D1/R2. This single fact outweighs the modest price difference.

> Caveat for both: "data in Canada" alone does not auto-satisfy **Quebec Law 25 s.17** (a privacy impact assessment is required even for a transfer to Toronto), and any US-incorporated provider carries **US CLOUD Act** exposure. Confirm with a privacy professional (plan.md open question #5).

---

## How hard it would be to leave later (lock-in)

| Piece | Cloudflare | Azure |
|-------|-----------|-------|
| Compute | Medium–high — Workers runtime + bindings + Next.js adapter are CF-specific; business logic ports | Moderate — Node/Next.js app ports; App Service config (slots/auth) is proprietary |
| Database | Medium — D1 is standard SQLite, data dumps out easily; access pattern is CF-bound | **High portability** — standard Postgres, `pg_dump`/restore anywhere |
| Files | **Low** — R2 is S3-compatible; free egress makes leaving cheap | Moderate — Blob API differs from S3 but tooling exists |
| Auth | N/A — you own it (no CF product) | **Low portability (worst lock-in)** — Entra password hashes can't be bulk-exported; leaving forces reset/JIT migration |
| Email | Low–medium — inbound Worker logic is CF-specific; outbound swaps easily | Moderate — swap ACS for SES/SendGrid |
| AI | Low — swap model API easily | Low–moderate — OpenAI-compatible; repoint to another provider |

**Summary:** Cloudflare's stickiest piece is the **Workers runtime glue**; its data layers (R2 S3-compat, D1 SQLite) are genuinely portable. Azure's data layer (Postgres) is the *most* portable of anything on either platform, but **Entra External ID is the single hardest thing to leave** on either side — password hashes cannot be exported, so an exit means a mass reset or just-in-time re-auth. **Mitigation (do this regardless of platform):** put a standards-based (OIDC) abstraction over auth from day one and keep your own user-profile table keyed to the IdP subject, so identity isn't welded to the vendor. Overall, neither platform is a one-way door; both are weeks-not-months to exit if the app keeps business logic framework-agnostic.

---

## How easily *I* can drive each one with commands

Relevant because I (Claude Code) will be doing much of the build/ops.

- **Cloudflare — easiest to drive.** **Wrangler** (and the newer **cf CLI**) give a single-file config (`wrangler.jsonc`), fast one-command deploys, local dev, and direct resource management for Workers/D1/R2/Queues/cron. I also have first-class skills loaded for it in this session (`wrangler`, `cf-cli`, `workers-best-practices`, `nextjs-on-cloudflare`, D1/R2/Email/Workers-AI skills). Tight, scriptable, low-ceremony. **Strong advantage.**
- **Azure — drivable but heavier.** The **az CLI** and **Bicep/Terraform** cover almost everything and are fully scriptable, but there are more moving parts, more verbose commands, and a few steps that lean on the portal (Entra External ID user-flow setup, ACS domain/DKIM verification, some Foundry model deployments). More ceremony, more services to wire together.

**Verdict:** Cloudflare is meaningfully faster and cleaner for me to automate end-to-end. Azure is entirely doable and well-documented, just more setup per part.

---

## Scorecard

| Dimension | Cloudflare | Azure |
|-----------|:----------:|:-----:|
| Low-volume cost (1k) | ✅ ~$8 | ~$89 ($0 with credits) |
| High-volume cost (20k) | ✅ ~$86 | ~$120 ($0 with credits) |
| Startup credits | — | ✅ ~$0 for ~6mo–2yr |
| **Canadian data residency** | ❌ not guaranteed | ✅ **Canada Central/East** |
| Sign-in (patients) | ❌ no product | ✅ Entra External ID free to 50k MAU |
| Inbound email | ✅ Email Routing → Worker | ⚠️ gap (M365 + Logic Apps) |
| Outbound email | ⚠️ beta | ✅ ACS (GA, cheaper/email) |
| AI in-region | ❌ no Canada pin | ✅ Canada East Regional/PTU |
| Lock-in (overall) | ✅ portable data layers | ⚠️ Entra is sticky |
| Ease for me to drive | ✅ Wrangler/cf CLI | ⚠️ az CLI, more parts |
| Compliance posture (CA health) | ❌ thin | ✅ PIPEDA/PHIPA/Law 25/Protected B |

---

## Recommendation

**Choose Azure.**

The deciding factor is **Decision 7 + Decision 2**: this app holds health and payment data for Quebec and Ontario clinics, and the working assumption is that the data must physically live in Canada. **Azure can guarantee that (Canada Central/East) and Cloudflare cannot** — Cloudflare's R2/D1 have no Canada jurisdiction, only best-effort US-spanning hints. For a health app, that one fact outranks the price difference. Azure also **includes patient sign-in free** (Entra External ID to 50k MAU), where Cloudflare has no auth product at all, and it carries explicit **PIPEDA / PHIPA / Law 25 / Protected B** compliance posture. On top of that, **Microsoft for Startups credits make Azure effectively $0/mo for the first ~6 months (or ~2 years at the $25k tier)** — long enough to validate the app — after which it settles at a very manageable **~$89–$120/mo**.

Cloudflare is the cheaper, lighter, easier-to-drive platform, and it genuinely wins on **inbound email** (Email Routing → Worker fits the Interac-matching and AI-intake flows beautifully) and on **ease of automation**. But those are conveniences; Canadian residency and built-in compliant identity are requirements. A small monthly saving is not worth putting patient health records in a US jurisdiction.

**Use the Azure gaps deliberately:** pin App Service + Postgres + Blob to **Canada Central**; use a **Canada East Regional/PTU** deployment for the AI receptionist (not Global Standard) so inference stays in-country; abstract auth behind OIDC from day one to soften the Entra lock-in; and set an **Azure budget alert now** (plan.md open question #6) so the credit-to-paid switch never surprises you.

### What would change my mind — switch to Cloudflare if:

1. **Decision 7 resolves to "Canada not required."** If a privacy professional confirms US storage is acceptable for this data under PIPEDA/Law 25/PHIPA, the single biggest reason for Azure disappears — and Cloudflare's lower cost, free egress, superb inbound email, and far easier automation would likely make it the better pick.
2. **The clinic becomes cost-ultra-sensitive and stays small**, *and* residency is relaxed — the ~$80/mo gap at low volume matters more than it should here, but if it did and Canada weren't required, Cloudflare wins.
3. **A strong Canadian-resident managed auth and transactional-email story** lands on Cloudflare (today auth is absent and outbound email is beta). That would close its two functional gaps.
4. **The app pivots toward heavy edge/low-latency global traffic or SaaS** (Decision 3 reversed) — Cloudflare's edge model and per-use pricing shine there. Not the current plan.

### What would change it toward something *other than either*:

- If **Canadian residency is required but you also want to avoid US CLOUD Act exposure entirely**, consider a **Canadian-sovereign host** (e.g. a Canadian cloud/managed Postgres) for the data layer — neither Azure nor Cloudflare fully removes CLOUD Act risk. Flag for the privacy professional.

---

## Sources (all read live, November 2026)

**Cloudflare:** [Workers](https://developers.cloudflare.com/workers/platform/pricing/) · [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) · [D1 data location](https://developers.cloudflare.com/d1/configuration/data-location/) · [R2 pricing](https://developers.cloudflare.com/r2/pricing/) · [R2 data location](https://developers.cloudflare.com/r2/reference/data-location/) · [Workflows pricing](https://developers.cloudflare.com/workflows/reference/pricing/) · [Zero Trust/Access](https://www.cloudflare.com/plans/zero-trust-services/) · [Email Routing](https://developers.cloudflare.com/email-routing/) · [Email Service pricing](https://developers.cloudflare.com/email-service/platform/pricing/) · [Workers AI pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/) · [Data Localization region support](https://developers.cloudflare.com/data-localization/region-support/) · [Data Localization](https://www.cloudflare.com/data-localization/)

**Azure:** [App Service Linux](https://azure.microsoft.com/en-us/pricing/details/app-service/linux/) · [Container Apps](https://azure.microsoft.com/en-us/pricing/details/container-apps/) · [PostgreSQL Flexible Server](https://azure.microsoft.com/en-us/pricing/details/postgresql/flexible-server/) · [Azure SQL](https://azure.microsoft.com/en-us/pricing/details/azure-sql-database/single/) · [Blob Storage](https://azure.microsoft.com/en-us/pricing/details/storage/blobs/) · [Bandwidth](https://azure.microsoft.com/en-us/pricing/details/bandwidth/) · [Functions](https://azure.microsoft.com/en-us/pricing/details/functions/) · [Logic Apps](https://azure.microsoft.com/en-us/pricing/details/logic-apps/) · [Entra External ID](https://www.microsoft.com/en-us/security/pricing/microsoft-entra-external-id) · [External ID FAQ](https://learn.microsoft.com/en-us/entra/external-id/customers/faq-customers) · [ACS Email pricing](https://learn.microsoft.com/en-us/azure/communication-services/concepts/email-pricing) · [ACS inbound gap](https://learn.microsoft.com/en-us/answers/questions/1364225/) · [Azure OpenAI pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/) · [AI deployment types](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/deployment-types) · [AI Canada availability](https://learn.microsoft.com/en-us/azure/foundry/foundry-models/concepts/models-sold-directly-by-azure-region-availability) · [Regions list](https://learn.microsoft.com/en-us/azure/reliability/regions-list) · [Data residency](https://azure.microsoft.com/en-us/explore/global-infrastructure/data-residency/) · [Canada Protected B](https://learn.microsoft.com/en-us/azure/compliance/offerings/offering-canada-protected-b)

**Microsoft for Startups:** [Program](https://www.microsoft.com/en-us/startups) · [Official FAQ (updated 2026-11-20)](https://learn.microsoft.com/en-us/startups/microsoft-for-startups/mfs-faqs) · [Azure Sponsorship offer MS-AZR-0036P](https://azure.microsoft.com/pricing/offers/ms-azr-0036p/)

*Caveat on Azure numbers: Azure pricing pages render prices client-side; the region-specific figures above come from Microsoft's Azure Retail Prices API (the authoritative data behind those pages, filtered to `canadacentral`). Confirm contract-grade quotes in the Azure Pricing Calculator for your billing currency. All estimates exclude taxes, reserved-instance discounts, and any third-party LLM (Claude) you choose to add.*
