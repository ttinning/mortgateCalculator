# Mortgage Calculator

A client-side mortgage calculator for the UK/Scotland, built with React, Vite, and Tailwind CSS.
Fully static — no backend required — designed for deployment on Cloudflare Pages.

## Features

- **Monthly payment calculator** — standard amortization formula, given loan amount, interest
  rate, and term.
- **Full amortization schedule** — table and chart (Recharts) showing the principal vs. interest
  split of every payment over the life of the loan.
- **Extra/overpayment modeling** — add a one-off lump sum and/or a recurring monthly
  overpayment and see the resulting time and interest saved vs. the base scenario.
- **Comparison mode** — configure 2–3 loan scenarios (different amounts/rates/terms) and compare
  monthly payment and total interest side by side.
- **Scotland LBTT calculator** — Land and Buildings Transaction Tax, with a full band-by-band
  breakdown, first-time buyer relief, and the Additional Dwelling Supplement (ADS).

## Tech stack

- React 18 + Vite
- Tailwind CSS
- Recharts (amortization chart)
- Vitest (unit tests for calculation logic)

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

Unit tests live in `src/utils/__tests__` and cover the amortization and LBTT calculation
functions, including edge cases: zero overpayment, early payoff from overpayments, exact band
boundaries, first-time buyer relief above/below £175,000, and the ADS threshold at £40,000.

## Building for production

```bash
npm run build
```

Outputs a fully static site to `/dist`, ready for any static host.

## Project structure

```
src/
  components/        React UI components (forms, chart, tables, panels)
  utils/
    amortization.js   Pure amortization + overpayment calculation functions
    lbtt.js           Pure LBTT calculation function
    format.js         Currency/duration formatting helpers
    __tests__/        Vitest specs for the above
  App.jsx             Single-page app shell (tabs: calculator / compare / LBTT)
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

### Scotland LBTT bands used

Residential LBTT bands used in this calculator:

| Portion of price         | Rate |
|---------------------------|------|
| Up to £145,000            | 0%   |
| £145,001 – £250,000        | 2%   |
| £250,001 – £325,000        | 5%   |
| £325,001 – £750,000        | 10%  |
| Above £750,000             | 12%  |

- **First-time buyer relief** raises the 0% band to £175,000 (all other bands unchanged above
  that), capping the relief saving at £600.
- **Additional Dwelling Supplement (ADS)** adds a flat 8% of the *full* purchase price on top of
  standard LBTT for second homes/buy-to-let purchases, applying to purchases over £40,000.

> ⚠️ **These rates may change.** Always check [revenue.scot](https://revenue.scot) for the
> current LBTT rates and bands before relying on this calculator for a real transaction.

## Deploying to Cloudflare Pages

1. Push this repository to GitHub (or GitLab).
2. In the Cloudflare dashboard, go to **Workers & Pages → Create → Pages → Connect to Git** and
   select the repository.
3. Configure the build settings:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Deploy. Cloudflare Pages will run the build and serve the static `dist/` output on every push.

No environment variables or backend services are required — this is a fully static site.
