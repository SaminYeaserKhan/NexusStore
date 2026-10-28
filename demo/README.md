# Demo recording

`record-demo.mjs` plays NexusStore's 90-second demo in a real browser window, with a visible
cursor and captions, so every screen-recording take comes out the same. It uses
[Playwright](https://playwright.dev).

## One-time setup

1. Run the app as described in the main README (`npm run dev`).
2. Create two accounts in the app:
   - a **shopper**: sign up and click the verification link in the email, because checkout
     needs a verified email;
   - an **admin**: sign up, then in the Firebase console set `role` to `admin` on that user's
     document in Firestore → `users`.
3. Sign in as the admin and open `/seed` to load the sample products.
4. Install Playwright and its browser:
   ```bash
   cd demo
   npm install
   npx playwright install chromium
   ```
5. Copy the settings file and fill in both accounts and a product photo:
   ```bash
   cp demo.env.example demo.env
   ```
6. Place a few sample orders so the admin charts have data:
   ```bash
   npm run prepare-data
   ```

## Record

1. Keep the app running. In `demo/`, run:
   ```bash
   npm run demo
   ```
2. The script signs in off camera, then waits. Start your screen recording on the browser
   window (Mac: Cmd + Shift + 5; Windows: OBS), then press Enter in the terminal.
3. The demo plays for about 90 seconds and ends on a card with the repo link. Stop recording,
   then press Enter to close the browser.

If a step can't be done automatically (a button moved, Gemini was slow), the browser pauses
and the terminal says which step. Do that step by hand, then press Resume (the play button)
in the Playwright Inspector, and the demo carries on. Trim that part out when you edit.

Set `SPEED`, `WINDOW` and `CAPTIONS` in `demo.env` to change the pace, the window size and
the on-screen captions.
