# Nida & Juned · Nikah & Haldi invitation

A digital wedding invitation for the Nikah of **Nida Khatib & Juned Shaikh**, with their Haldi
celebration. Built with Next.js 16, React 19, TypeScript and Tailwind CSS 4. The site is fully
static: no database, no login, no paid services and no secrets.

| Event | Date                     | Time (IST)                | Venue                                                                          |
| ----- | ------------------------ | ------------------------- | ------------------------------------------------------------------------------ |
| Nikah | Friday, 30 April 2027    | 5:30 PM, after Asr Namaaz | Seawood Jama Masjid, Plot No. 144, Sector New 50, Seawoods, Nerul, Navi Mumbai |
| Haldi | Wednesday, 28 April 2027 | 4:00 PM                   | To be announced                                                                |

## What guests get

- An opening envelope with a wax seal that opens into a gold Mughal-style arch, with the
  Bismillah, the couple's names and the Nikah date (skippable, and skipped on a repeat visit).
- Live countdowns to the Nikah and the Haldi, calculated from the exact moment in India Standard
  Time, so they are right on any phone in any country.
- Google Maps directions to the masjid (opens the Maps app on phones).
- "Add to Calendar" for each event: an `.ics` file for Apple Calendar and most calendar apps,
  plus a Google Calendar link. The `.ics` files include a reminder one day before.
- "Share Invitation": WhatsApp with the full message and link, the phone's share menu, or
  copy-link.
- An RSVP card (name, attending yes/no). Replies are saved to a Google Sheet you own; see
  [RSVP: connect your Google Sheet](#rsvp-connect-your-google-sheet).
- A link preview image for WhatsApp and other apps.

## Run it on your computer

You need [Node.js](https://nodejs.org) 20.9 or newer.

```bash
npm install
```

```bash
npm run dev
```

Then open <http://localhost:3000>.

## Check everything

| Command                 | What it does                                                                             |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `npm run lint`          | ESLint                                                                                   |
| `npm run typecheck`     | TypeScript                                                                               |
| `npm test`              | Unit, component and page tests (Vitest)                                                  |
| `npm run test:coverage` | The same, with a coverage report (minimum 80%)                                           |
| `npm run test:e2e`      | End-to-end tests in Chrome, an Android-sized Chrome and iPhone-sized WebKit (Playwright) |
| `npm run build`         | Production build                                                                         |
| `npm run check`         | Lint, types, tests with coverage, then the build                                         |

Before the first end-to-end run, install the test browsers once:

```bash
npx playwright install chromium webkit
```

The end-to-end tests build the site into `.next-e2e/` with a placeholder address
(`https://nida-juned.example`) so they never overwrite your normal build.

## Change event details or announce the Haldi venue

Every detail lives in one file: [`lib/wedding-config.ts`](lib/wedding-config.ts). The page,
countdowns, calendar files, Google Calendar links, directions and WhatsApp message are all
generated from it. The file is validated when the site builds, so a typo (for example
`2027-04-31` or `4:00 PM` instead of `16:00`) stops the build with a clear message instead of
publishing a broken invitation.

To announce the Haldi venue, replace `venue: null` in the `haldi` event with:

```ts
venue: {
  name: 'Venue name',
  address: 'Full address, Area, City, Maharashtra, India', // used for directions and calendars
  shortAddress: 'Short address, City',                     // used in the WhatsApp message
},
```

Then increase the Haldi's `calendar.sequence` from `0` to `1`. Guests who download the calendar
file again will get the venue on their existing entry. After you save, a **Get Directions**
button appears for the Haldi automatically, and the share message and calendar files include the
venue. Publish the change as described in [Updating the live site](#updating-the-live-site).

Other notes:

- Times use 24-hour `HH:mm` in India Standard Time (`17:30` is 5:30 PM).
- No end times were given, so calendar entries last **60 minutes** (`durationMinutes`). Change
  it per event if you like.
- `allowSearchIndexing` is `false`, so search engines are asked not to list the invitation.
  WhatsApp link previews still work. Set it to `true` if you want the page to appear in Google.

## RSVP: connect your Google Sheet

Replies go into a Google Sheet that only you can see. Until this is set up, the RSVP card
politely tells guests that replies are not open yet. Setup takes about 5 minutes, once.

1. Create a new sheet at [sheets.new](https://sheets.new) and name it, for example,
   "Nida & Juned RSVPs".
2. In the sheet, open **Extensions → Apps Script**. Delete the sample code, paste in everything
   from [`google-apps-script/rsvp.gs`](google-apps-script/rsvp.gs), and click **Save**.
3. Click **Deploy → New deployment**, choose the type **Web app**, set **Execute as: Me** and
   **Who has access: Anyone**, then **Deploy**. Google asks you to authorise the script: choose
   your account, then **Advanced → Go to (project name)**. This warning appears because the
   script is your own, not a published app.
4. Copy the **Web app URL** (it ends in `/exec`). Treat it like a password: don't share it.
5. In Vercel, open your project → **Settings → Environment Variables**, add
   `RSVP_SHEET_WEBHOOK_URL` with the Web app URL as its value, then redeploy
   (**Deployments → … → Redeploy**).
6. Send a test reply on the live site. A new **RSVPs** tab appears in your sheet with the time
   (IST), the name and whether they are attending.

Notes:

- The script's address is only stored in Vercel's server settings, so guests never see it.
- Optional extra protection: make a long random password (`openssl rand -hex 24`), add it as a
  Script Property `RSVP_SECRET` in Apps Script (**Project Settings → Script Properties**) and as
  the Vercel variable `RSVP_SHEET_SECRET`, then redeploy. Requests without it are then refused.
- If a guest uses **Change my reply**, a new row is added. The latest row for a name is their
  current answer.
- If you edit the script later, use **Deploy → Manage deployments → Edit → New version** so the
  address stays the same.

## Publish on Vercel (free)

Vercel's free **Hobby** plan is enough, and you don't need a domain: you get an address like
`https://your-project.vercel.app`. Menu names below may differ slightly as Vercel updates its
site.

### 1. Put the project on GitHub

1. Create a free account at [github.com](https://github.com) if you don't have one.
2. Create a new repository at [github.com/new](https://github.com/new). **Private** is fine.
   Don't add a README, .gitignore or licence (the project already has them).
3. In this folder, run these commands, replacing the last address with your repository's:

```bash
git init
```

```bash
git add .
```

```bash
git commit -m "feat: Nikah and Haldi invitation website"
```

```bash
git branch -M main
```

```bash
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
```

```bash
git push -u origin main
```

`node_modules`, build folders and any `.env` files are excluded by `.gitignore`.

### 2. Import it into Vercel

1. Sign up at [vercel.com/signup](https://vercel.com/signup) with **Continue with GitHub**, and
   choose the Hobby plan.
2. Open [vercel.com/new](https://vercel.com/new), find your repository and click **Import**. If
   it isn't listed, use the option to adjust GitHub app permissions and give Vercel access to it.
3. Vercel detects **Next.js** automatically. Leave the build settings as they are.
4. **Environment variables:** the invitation itself needs none; Vercel tells the site its own
   public address automatically. For RSVPs, add the two values from
   [RSVP: connect your Google Sheet](#rsvp-connect-your-google-sheet) (you can also add them
   later and redeploy). If you add a custom domain, also add `NEXT_PUBLIC_SITE_URL` with the
   full address (for example `https://nidajuned.com`). See `.env.example`.
5. Click **Deploy** and wait about a minute.

### 3. Get the public address

When the deployment finishes, Vercel shows the production address, for example
`https://nida-juned-wedding.vercel.app`. **Share that address.** The long addresses Vercel shows
for individual deployments (with random letters) are protected previews that ask for a Vercel
login, so guests can't open them.

For a nicer free address, rename the project under **Settings → General → Project Name**, or add
a free `something.vercel.app` alias under **Settings → Domains** (if the name is available).
After changing the address, redeploy once so share links and previews use the new one.

### 4. Test on your phone before sending to guests

- Open the address on your phone. The opening plays once; tap **Skip intro** to jump ahead.
- Check that the countdowns are moving.
- Tap **Get Directions**: Google Maps should open at Seawood Jama Masjid. Confirm the pin is
  the right building. The link uses the written address, so Google decides where to put it.
- **Add to Calendar**:
  - iPhone: choose **Apple Calendar or other apps**, then **Add** (or **Add All**).
  - Android: choose **Google Calendar**, sign in if asked, and save. (Some Android phones can
    also open the `.ics` file with their own calendar app.)
  - Reminders depend on the guest's calendar app and its notification settings. The `.ics`
    file asks for a reminder one day before. Google Calendar links can't carry a reminder, so
    Google uses the guest's default notifications.
- **Share Invitation → Share on WhatsApp**: send it to yourself first and check the message,
  link and preview card.

### Updating the live site

Every push to `main` publishes a new version automatically:

```bash
git add lib/wedding-config.ts
```

```bash
git commit -m "feat: announce Haldi venue"
```

```bash
git push
```

You can watch the deployment in your Vercel dashboard. It's live a minute or so later.

**About WhatsApp previews:** WhatsApp remembers a link's preview for a while. If you change the
preview (for example after changing the address), share the link with something added, like
`https://your-project.vercel.app/?v=2`, to make WhatsApp fetch a fresh preview.

### Alternative: publish from the terminal

```bash
npx vercel
```

```bash
npx vercel --prod
```

The first command links the folder to a Vercel project (log in when asked); the second
publishes to the production address.

## How it's built

```
app/                    page, layout, metadata images, /calendar/*.ics route
components/             page sections (hero, countdown, event, share, ornaments, motion)
lib/                    event data, time zones, countdown, calendar, maps and share logic
styles/                 design tokens, ornaments, motion, buttons, countdown, sections
assets/fonts/           Arabic Bismillah subset and preview-image fonts (SIL Open Font Licence)
e2e/                    Playwright end-to-end tests
```

- **Time zones:** event times are converted from Asia/Kolkata to exact UTC instants
  (`lib/time.ts`). Nikah: 2027-04-30 12:00 UTC. Haldi: 2027-04-28 10:30 UTC.
- **Motion:** the opening is pure CSS and the scroll reveals use IntersectionObserver. Nothing
  hijacks scrolling or loops, and visitors who prefer reduced motion get a still page. If
  JavaScript fails, everything stays visible.
- **Fonts:** Cormorant Garamond and Inter are self-hosted by Next.js. The Arabic Bismillah uses
  a 22 KB subset of Amiri. Licences are in `assets/fonts/`.
