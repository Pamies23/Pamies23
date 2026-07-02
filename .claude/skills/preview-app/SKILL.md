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
it never rendered.

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
