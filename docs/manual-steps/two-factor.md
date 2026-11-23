# Turn on two-factor sign-in for your GitHub account

A by-hand task for the owner. Do this on a computer, with your phone nearby.

## Why it matters

This project's code and its documents live in GitHub. If someone learns your
password, they could read or change everything — the plan, the decisions, and
later the app itself. Two-factor sign-in adds a second step at login (a code
from your phone), so a stolen password alone is not enough to get in. For an
account that holds a health-clinic project, this is a must, not a nice-to-have.

## Before you start

- You need your GitHub password.
- Install an authenticator app on your phone if you don't have one — for
  example Google Authenticator, Microsoft Authenticator, or 1Password. This app
  shows a fresh 6-digit code every 30 seconds.

## The steps

1. On a computer, go to https://github.com and sign in.
2. Click your photo in the top-right corner, then choose **Settings**.
3. In the left menu, click **Password and authentication**.
4. Find **Two-factor authentication** and click **Enable two-factor
   authentication**.
5. Choose **Set up using an app** (the authenticator app). This is more secure
   than text-message codes.
6. GitHub shows a QR code (a square barcode). Open your authenticator app, add a
   new account, and point your phone's camera at the QR code on screen.
7. Your authenticator app now shows a 6-digit code for GitHub. Type that code
   into GitHub to confirm the setup.
8. GitHub shows a list of **recovery codes**. Save them somewhere safe and
   private — a password manager, or printed and locked away. These let you back
   in if you ever lose your phone. **Do not** put them in this project or any
   file in the repository.
9. Finish the setup. GitHub may ask you to confirm the recovery codes are saved.

## How to check it worked

- On the **Password and authentication** page, **Two-factor authentication**
  now shows as **on** (with a green check), and lists your authenticator app.
- Sign out of GitHub, then sign back in. After your password, GitHub should ask
  for the 6-digit code from your authenticator app. If it does, two-factor is
  working.
