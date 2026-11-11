---
name: preview-app
description: Launch and visually verify the Real Food app (iphone.html) in a headless browser. Use when asked to run, preview, screenshot, or confirm a change works in the real app. Captures the stable tooling only (serving + Playwright + Chromium paths); UI selectors change with each redesign, so treat the navigation hints as a starting point and re-check them against the current markup.
---

# Preview the Real Food app

The app is a single static file, `iphone.html` — no build step, no framework,
no dev server of its own. Everything lives inline in that one file. To *see* a
change you serve the file and drive it with a headless Chromium.

## What is stable (worth remembering)

These details don't change when the UI is redesigned:

- **Serve it** with any static server from the repo root:
  ```bash
  python3 -m http.server 8791   # then open http://localhost:8791/iphone.html
  ```
- **Playwright is installed globally**, not in a local `node_modules`. A driver
  script must be run with `NODE_PATH` pointing at the global root:
  ```bash
  NODE_PATH=$(npm root -g) node driver.js
  ```
- **Chromium is pre-installed**; do NOT run `playwright install`. Point at it:
  ```js
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  ```
- **Phone viewport**: `{ width: 428, height: 926 }` matches the intended layout.

## Minimal driver skeleton

```js
const { chromium } = require('playwright');
const OUT = process.env.OUT || '/tmp';
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 428, height: 926 } });
  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  await page.goto('http://localhost:8791/iphone.html');
  await page.waitForTimeout(800);
  // ...navigate to the screen you changed, then:
  await page.screenshot({ path: `${OUT}/shot.png` });
  await browser.close();
})();
```
Run it, then Read the PNG to actually look at the result — a blank frame means
it never rendered. Use this to verify your own changes before committing —
do NOT send screenshots to the user (costly, and a static image never
reflects live interaction anyway).

## Always give the user a live link, not a screenshot

The local `http.server` in this sandbox is not reachable from the user's own
browser, so it can't be handed out directly. Instead, after pushing to the
branch, always end with a link to **htmlpreview.github.io**, which proxies
the raw file straight from GitHub and actually renders/runs it (relative
asset paths resolve correctly via its injected `<base>` tag).

Build the link from the **commit SHA just pushed, not the branch name**:

```bash
git rev-parse HEAD
```
```
https://htmlpreview.github.io/?https://raw.githubusercontent.com/<owner>/<repo>/<sha>/iphone.html
```

A branch-name URL is reused across pushes, and the user found that
htmlpreview/browser caching made it serve stale content and load slowly
waiting on a refresh. A SHA-pinned URL is a genuinely new address every
commit, so there's nothing stale to wait on — give a fresh one after every
push.

This sandbox's outbound network policy blocks `htmlpreview.github.io`, so it
cannot be verified from here — but it is not reachable through this sandbox's
proxy at all, which is unrelated to whether the user's own browser can reach
it. Give the link anyway; ask the user to flag it if something doesn't
render (e.g. a broken relative asset path), and diagnose from there.

## Emulating the iPhone notch (do this for any header/transition work)

Headless Chromium reports `env(safe-area-inset-*)` as 0, which hides every
notch bug. Intercept the page and substitute real values, and fake standalone:

```js
await page.route('**/iphone.html', r => {
  let html = fs.readFileSync('iphone.html', 'utf8')
    .replace(/env\(safe-area-inset-top\)/g, '59px')
    .replace(/env\(safe-area-inset-bottom\)/g, '34px');
  r.fulfill({ body: html, contentType: 'text/html' });
});
await page.addInitScript(() => Object.defineProperty(navigator, 'standalone', { get: () => true }));
```
Use viewport 393×852. To inspect a transition mid-flight, slow it with
`page.addStyleTag({ content: ':root{--vt:1.6s !important}' })` and screenshot
at ~250 ms. Most app functions (`openSheet()`, `openRecipe(key)`,
`openProfile()`, `openWorkout()`, `showView(id)`) are global and callable
from `page.evaluate`. PIL is broken in this sandbox; build contact sheets by
rendering the PNGs in a Playwright page instead.

## Installable link (home-screen web app)

htmlpreview is fine for a quick look but not for installing. For "Add to
Home Screen" give the directly-served branch URL:
`https://raw.githack.com/<owner>/<repo>/<branch>/iphone.html`
(or GitHub Pages if the user enables it). localStorage is per-origin, so the
user must stick to one URL or their data will not follow.

## Navigation hints (verify against current markup — these drift)

The DOM ids/classes below were current as of the recipe-detail redesign. The app
changes continuously, so if a selector misses, dump the live buttons with
`document.querySelectorAll('button')` and re-map before assuming the app broke.

- Home → open the add-food sheet: click `#addBtn`.
- Inside the sheet, tabs are `.sheet-tab` (`Alimentos`, `Recetas`).
- Recipe cards are `.food-card`; clicking one opens the recipe detail
  (`#recipeView`), whose add-to-menu button is `#rvSave`.

## Cleanup

Kill the server when done: `pkill -f "http.server 8791"`.
