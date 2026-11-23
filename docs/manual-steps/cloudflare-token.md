# Create and use a scoped Cloudflare API token

A by-hand task for the owner. You will create a Cloudflare API token that can do
only three things on the clinic's account — manage **Workers**, **D1**, and
**R2** — give it an **expiry date**, store it in **KeePass**, and load it into
your terminal as an environment variable **without pasting it into chat and
without it showing on screen** before you start Claude Code.

> **Never put the token itself in this file, in the repo, in chat, or in a
> screenshot.** It lives only in KeePass and, briefly, in one terminal session's
> memory. This guide refers to it only by the KeePass entry name
> **`Cloudflare — Workers/D1/R2 API token`**.

## Why it is scoped and time-limited

A token that can only touch Workers, D1, and R2 — and only on the clinic's own
account — cannot read your billing, change DNS, or reach another account, so a
leak does far less damage. An expiry date means a forgotten or leaked token
stops working on its own. This matches CLAUDE.md §1 (least privilege, secrets
out of the repo).

## Part A — Create the token in Cloudflare

1. On a computer, go to https://dash.cloudflare.com and sign in to the
   `nextia.clinic` account.
2. Click your profile in the top-right, then **My Profile**.
3. Open **API Tokens**, then click **Create Token**.
4. Scroll to **Custom token** and click **Get started**.
5. Name it clearly, e.g. **`workers-d1-r2 (dev)`**.
6. Under **Permissions**, add exactly these three rows (click **+ Add more**
   for each). All are **Account** permissions:
   - **Account** → **Workers Scripts** → **Edit**
   - **Account** → **D1** → **Edit**
   - **Account** → **Workers R2 Storage** → **Edit**

   Add nothing else — no DNS, no billing, no Zone, no other account scopes.
7. Under **Account Resources**, choose **Include** → **Specific account** →
   **nextia.clinic**. Do **not** leave it on "All accounts".
8. Under **Client IP Address Filtering**, you may leave it blank.
9. Under **TTL**, set an **End Date** so the token expires. A good default is
   about **90 days** out — for example, pick a date three months from the day
   you create it. Put a reminder in your calendar to rotate it a few days before
   that date.
10. Click **Continue to summary**, check the three permissions and the single
    account are right, then **Create Token**.
11. Cloudflare shows the token value **once**. Do not copy it into chat or a
    document. Go straight to Part B and paste it into KeePass.

## Part B — Store it in KeePass

1. In KeePass, create a new entry named exactly
   **`Cloudflare — Workers/D1/R2 API token`**.
2. Paste the token value into the entry's **Password** field (KeePass keeps that
   field hidden and encrypted).
3. In the **Notes** field, record the **expiry date** and the three permissions,
   so you know what it is without revealing the value.
4. Save the KeePass database. Now close the Cloudflare tab — the value is safe in
   KeePass and you never need to see it again.
5. Add this new entry to the accounts table in
   [`accounts.md`](accounts.md) (it joins the dashboard login entry
   `Cloudflare — nextia.clinic`).

## Part C — Load it into your terminal without showing it

These steps use **KeePassXC**'s command-line tool, `keepassxc-cli`, which reads
the token straight out of your KeePass database into an environment variable.
The value is never printed to the screen and never typed by hand.

Wrangler (the Cloudflare tool) reads the token from the environment variable
**`CLOUDFLARE_API_TOKEN`**.

1. Open a terminal. Replace the database path below with the real path to your
   `.kdbx` file. Run:

   ```sh
   export CLOUDFLARE_API_TOKEN="$(keepassxc-cli show -q -s -a Password \
     ~/path/to/nextia.kdbx 'Cloudflare — Workers/D1/R2 API token')"
   ```

   - `keepassxc-cli` asks for your **KeePass database password**; type it (it is
     hidden as you type).
   - `-a Password` returns only the token; `-s` reveals that one protected field;
     `-q` keeps everything else quiet.
   - The `$( … )` captures the token **into the variable** — it is not echoed to
     the screen, and because the command contains no secret, your shell history
     stays clean too.

2. Start Claude Code (or Wrangler) from that **same terminal window**, e.g. run
   `claude`. The variable lives only in this session's memory and vanishes when
   you close the window.

> If you don't have `keepassxc-cli`, it comes with the free KeePassXC app
> (macOS: it is inside the installed KeePassXC application; you can also
> `brew install keepassxc`). Do **not** work around it by pasting the token on
> the command line — that would put the secret in your shell history.

## Part D — Check that it worked

Run this in the same terminal. It sends the token in a header (from the variable,
so the value never appears on screen) and asks Cloudflare whether it is valid:

```sh
curl -s https://api.cloudflare.com/client/v4/user/tokens/verify \
  -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
```

- A healthy token returns JSON containing `"status":"active"` and
  `"success":true`.
- You can also run `npx wrangler whoami` — it should recognise the token and
  show the `nextia.clinic` account. (It may list only limited details, because
  the token is deliberately scoped to Workers, D1, and R2.)
- To confirm it is **not** over-privileged: the verify call above succeeds, yet
  the token cannot touch DNS or billing. If `wrangler` can deploy a Worker and
  read D1/R2 but nothing else, the scope is correct.

When you are done for the day you can clear it from the session with:

```sh
unset CLOUDFLARE_API_TOKEN
```

## Part E — If the token is ever shown by mistake

If the token appears in chat, a screenshot, a log, a shared screen, or anywhere
it should not, treat it as compromised and act now — a scoped token can still
change your Workers, D1, and R2:

1. **Revoke it immediately.** Go to https://dash.cloudflare.com → **My Profile**
   → **API Tokens**, find the token, and click **Roll** (makes a new value and
   kills the old one) or **Delete**. The old value stops working at once.
2. **Create a fresh token** by repeating Part A, with a new expiry date.
3. **Update KeePass** — put the new value in the
   `Cloudflare — Workers/D1/R2 API token` entry (Part B), replacing the old one.
4. **Reload your terminal** — open a new window and redo Part C so the
   environment variable holds the new token. Run `unset CLOUDFLARE_API_TOKEN` in
   any window that still has the old one.
5. **Clear any trace** — delete the message, screenshot, or log that showed it,
   and clear your terminal scrollback/history if it was displayed there.
6. **Check the audit log** — in the Cloudflare dashboard, review **Audit Log**
   for any action you did not take around the time of exposure.
