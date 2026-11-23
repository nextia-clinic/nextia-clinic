# Accounts this app uses

A by-hand reference for the owner. Every outside account the Nextia Clinic app
depends on, who can sign in to it, whether two-factor sign-in is on, and the
name of the KeePass entry that holds its secret.

**Never write a secret, key, password, or recovery code in this file.** This
file only names the KeePass entry where each secret lives; the secret itself
stays in KeePass. If a value below is wrong, fix it here — but keep secrets out.

## The accounts

| Account | What it is for | Who has access | Two-factor on? | KeePass entry |
| --- | --- | --- | --- | --- |
| **GitHub** — organisation `nextia-clinic` | Holds the code and all documents; runs the deploy pipeline | Owner (org owner) † | On †, see [`two-factor.md`](two-factor.md) | `GitHub — nextia-clinic` † |
| **Cloudflare** — account `nextia.clinic` | Hosting: Workers, D1, R2, Cron, Email Routing | Owner (account owner) † | **Off † — turn it on (below)** | `Cloudflare — nextia.clinic` † |
| **Stripe** — test mode | Takes the $50 card deposit; holds all card numbers so we never do | Owner † | **Off † — turn it on (below)** | `Stripe — test mode` † |
| **AI model API** — Anthropic (Claude) | Powers the AI receptionist | Owner † | **Off † — turn it on (below)** | `Anthropic — AI model API` † |

**† Suggested default — owner to confirm.** The two-factor statuses and KeePass
entry names above are sensible best guesses, not checked facts. Before relying
on this file, go through the checklist below and correct any cell that is wrong.

### To confirm (owner)

- [ ] **GitHub** — is two-factor actually on? (If not, follow
      [`two-factor.md`](two-factor.md).)
- [ ] **Cloudflare / Stripe / Anthropic** — confirm whether two-factor is on;
      if off, use the steps below and update the cell to "On".
- [ ] **KeePass entries** — confirm each entry exists under the name shown, or
      rename the cell to match the real entry. Create any that are missing.
- [ ] **Who has access** — confirm each account really is owner-only; list any
      other person who can sign in (e.g. a developer, or an accountant on
      Stripe) and update the cell.

Notes:

- Only the **owner** has access to every account today. Add a person only when
  the work needs it, and record them in the "Who has access" column above.
- Stripe is in **test mode** for now. Before the first real release, switching
  to live mode is a separate owner decision — do not switch it on your own.
- The **secret** for each account (API key, token, password) lives only in
  KeePass, under the entry named above, and is loaded into the app through
  environment config — never committed to the repo (CLAUDE.md §1).

## Turn on two-factor sign-in where it is missing

Two-factor sign-in adds a second step at login — a code from your phone — so a
stolen password alone is not enough to get in. For a health-clinic project this
is a must, not a nice-to-have. GitHub is already done
([`two-factor.md`](two-factor.md)); the three below still need it.

Before you start, install an authenticator app on your phone if you don't have
one (Google Authenticator, Microsoft Authenticator, or 1Password). It shows a
fresh 6-digit code every 30 seconds. Whenever an account offers **recovery
codes**, save them in KeePass — never in this repo.

### Cloudflare (account `nextia.clinic`)

1. On a computer, go to https://dash.cloudflare.com and sign in.
2. Click your profile in the top-right, then **My Profile**.
3. Open the **Authentication** tab.
4. Under **Two-Factor Authentication**, choose **Authenticator app** and click
   to set it up.
5. Scan the QR code with your authenticator app, then type the 6-digit code it
   shows to confirm.
6. Save the **recovery codes** Cloudflare gives you into KeePass.
7. Check it worked: sign out, then sign back in — Cloudflare should ask for the
   6-digit code after your password.

### Stripe (test mode)

1. Go to https://dashboard.stripe.com and sign in.
2. Click your account name, then **Profile** (or **Settings → Your account**).
3. Find **Two-step authentication** and start the setup.
4. Choose the **authenticator app** option, scan the QR code, and enter the
   6-digit code to confirm.
5. Save the **backup/recovery codes** into KeePass.
6. Check it worked: sign out, then sign back in — Stripe should ask for the
   6-digit code after your password.

### AI model API (Anthropic / Claude)

1. Go to https://console.anthropic.com and sign in.
2. Open **Settings**, then your account/profile section.
3. Find **Two-factor authentication** and start the setup.
4. Choose the **authenticator app** option, scan the QR code, and enter the
   6-digit code to confirm.
5. Save any **recovery codes** into KeePass.
6. Check it worked: sign out, then sign back in — the console should ask for the
   6-digit code after your password.

When each one is on, change its **Two-factor on?** cell in the table above to
"On".

## When someone leaves the business

Do these the same day the person leaves. Work down the list for every account
in the table above.

- [ ] **Remove their access** from each account (GitHub org, Cloudflare,
      Stripe, Anthropic). Remove them as a member/collaborator, not just lower
      their role.
- [ ] **Rotate every shared secret** they could have seen — API keys and
      tokens for Cloudflare, Stripe, and Anthropic. Create a new one, update
      the KeePass entry, update the app's environment config, then delete the
      old secret at the provider.
- [ ] **Change any password they knew** on accounts that were shared, and
      confirm two-factor is still on afterwards.
- [ ] **Remove their KeePass access** and, if the KeePass database password was
      shared with them, change it.
- [ ] **Revoke their recovery codes** where the account allows it (regenerate a
      fresh set and save it to KeePass).
- [ ] **Check the audit/access logs** on GitHub and Cloudflare for anything
      unexpected around their departure.
- [ ] **Update this file** — remove the person from every "Who has access"
      cell above.
