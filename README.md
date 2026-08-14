# Mortgage Calculator

A client-side UK mortgage & stamp duty calculator, built with React, Vite, and Tailwind CSS.
Fully static — no backend required — installable as a PWA and designed for deployment on
Cloudflare Pages.

## Features

- **Monthly payment calculator** — standard amortization formula, given loan amount, interest
  rate, and term.
- **Full amortization schedule** — table and chart (Recharts, lazy-loaded) showing the principal
  vs. interest split of every payment over the life of the loan, plus CSV export.
- **Extra/overpayment modeling** — add a one-off lump sum and/or a recurring monthly
  overpayment and see the resulting time and interest saved vs. the base scenario.
- **Overpaying vs. investing comparison** — compares the value of overpaying the mortgage
  against investing the same money at an expected rate of return.
- **Comparison mode** — configure 2–3 loan scenarios (different amounts/rates/terms) and compare
  monthly payment and total interest side by side.
- **Regional stamp duty calculator** — band-by-band breakdown for:
  - **Scotland** — Land and Buildings Transaction Tax (LBTT), with first-time buyer relief and
    the Additional Dwelling Supplement (ADS).
  - **England / Northern Ireland** — Stamp Duty Land Tax (SDLT), with first-time buyer relief
    and the higher-rate surcharge for additional properties.
  - **Wales** — Land Transaction Tax (LTT), with the higher residential rate for additional
    properties.
- **Affordability calculator** — estimates how much you could borrow based on income multiples
  and a stress-tested interest rate.
- **Rate switch / deal period modeling** — models an initial fixed/discounted deal period
  followed by a switch to a follow-on rate, showing the payment change.
- **Saved scenarios** — save, load, rename, and delete named mortgage scenarios, persisted to
  `localStorage`.
- **Shareable links** — the current calculator inputs are encoded into the URL so a scenario can
  be shared or bookmarked.
- **Input validation** — sensible min/max clamping and inline error messages for all numeric
  inputs.
- **Dark mode** — toggle between light/dark themes (also respects OS preference), persisted
  across visits.
- **PWA support** — installable, works offline via a precaching service worker.
- **Responsive, accessible UI** — tabbed layout with labelled form controls, usable on mobile
  and desktop.

## Tech stack

- React 18 + Vite 5
- Tailwind CSS 3 (with `dark:` class-based dark mode)
- Recharts (amortization chart, code-split into its own chunk)
- `vite-plugin-pwa` (offline support / installable app)
- Vitest + Testing Library (`@testing-library/react`, `@testing-library/user-event`, jsdom) for
  unit and component tests

## Getting started

```bash
npm install
npm run dev
```

This starts a local dev server (default `http://localhost:5173`).

## Testing

```bash
npm test          # run the Vitest suite once
npm run test:watch  # watch mode
```

The suite includes both pure calculation unit tests and React component tests:

- `src/utils/__tests__/` — amortization, overpayment, investment comparison, affordability, rate
  switch, LBTT/SDLT/LTT (all regions), scenarios, URL state, CSV export, and validation logic,
  including edge cases (zero overpayment, early payoff, exact band boundaries, first-time buyer
  relief thresholds, ADS/surcharge thresholds).
- `src/components/__tests__/` and `src/__tests__/` — form rendering & validation, saved-scenario
  save/load/delete flows, tab navigation, and dark mode toggling.

## Building for production

```bash
npm run build
```

Outputs a fully static, PWA-enabled site to `/dist`, ready for any static host.

## Project structure

```
src/
  components/         React UI components (forms, chart, tables, panels, icons)
    __tests__/         Component tests (Testing Library)
  utils/
    amortization.js     Amortization schedule + overpayment calculations
    investment.js       Overpay-vs-invest comparison
    affordability.js     Income-multiple / stress-tested affordability calculation
    rateSwitch.js        Initial deal period -> follow-on rate modeling
    lbtt.js              Scotland LBTT calculation
    sdlt.js              England/NI SDLT calculation
    walesLtt.js          Wales LTT calculation
    scenarios.js         Saved-scenario CRUD (localStorage)
    urlState.js          Encode/decode calculator state to/from the URL
    csv.js               CSV export helper
    validation.js        Shared field validation/clamping rules
    format.js             Currency/duration formatting helpers
    useLocalStorageState.js  Persisted state hook
    useDarkMode.js           Dark mode state + OS-preference detection hook
    __tests__/            Vitest specs for the above
  App.jsx              Single-page app shell (tabbed navigation, code-split routes)
```

All calculation logic is implemented as pure functions in `/src/utils`, fully decoupled from the
UI, so it can be tested and reused independently of any component.

## Calculation notes

### Amortization formula

Monthly payment `M` for a loan of principal `P`, monthly interest rate `r` (annual rate / 12),
and `n` total monthly payments:

```
M = P × [ r(1 + r)^n ] / [ (1 + r)^n − 1 ]
```

When the rate is 0%, this simplifies to `M = P / n`. The full schedule is generated month by
month, splitting each payment into principal and interest based on the remaining balance, and
supports an optional recurring monthly overpayment and/or a one-off lump sum (applied to the
principal at a chosen payment number), which shortens the payoff time and reduces total interest.

### Regional stamp duty bands

> ⚠️ **These rates may change.** Always check the relevant official source below for the
> current rates and bands before relying on this calculator for a real transaction.

**Scotland — LBTT** ([revenue.scot](https://revenue.scot)):

| Portion of price         | Rate |
|---------------------------|------|
| Up to £145,000            | 0%   |
| £145,001 – £250,000        | 2%   |
| £250,001 – £325,000        | 5%   |
| £325,001 – £750,000        | 10%  |
| Above £750,000             | 12%  |

First-time buyer relief raises the 0% band to £175,000 (capped saving of £600). The Additional
Dwelling Supplement (ADS) adds a flat 8% of the full purchase price for second homes/buy-to-let
purchases over £40,000.

**England / Northern Ireland — SDLT** ([gov.uk](https://www.gov.uk/stamp-duty-land-tax)) and
**Wales — LTT** ([gov.wales](https://gov.wales/land-transaction-tax-guide)) use their own banded
rates, first-time buyer relief, and higher-rate surcharges for additional properties — see
`src/utils/sdlt.js` and `src/utils/walesLtt.js` for the exact bands implemented.

## Deploying to Cloudflare Pages

1. Push this repository to GitHub (or GitLab).
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git** and
   select the repository.
3. Configure the build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Deploy. Cloudflare Pages will run the build and serve the static `dist/` output on every push.

No environment variables or backend services are required — this is a fully static site.
