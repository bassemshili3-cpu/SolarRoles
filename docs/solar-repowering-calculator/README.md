# Solar repowering calculator

## Route

`app/tools/solar-repowering-calculator/page.tsx`

The page is a Server Component that renders `components/repowering/RepoweringCalculator.tsx` as the interactive Client Component.

## Shared calculation engine

- `lib/repowering/calculator.ts` — density/GCR/solar-geometry calculations
- `lib/repowering/polygonPacking.ts` — WGS84 Polygon/MultiPolygon row packing
- `lib/repowering/types.ts` — shared types

The browser calculator and national batch runner use the same TypeScript engine.

## Batch runner

Download USPVDB:

```bash
npm run repower:download
```

Reference batch:

```bash
npm run repower:batch -- --input data/repowering/uspvdb.geojson --scenario reference
```

Useful filters:

```bash
npm run repower:batch -- --input data/repowering/uspvdb.geojson --state CA --limit 50
npm run repower:batch -- --input data/repowering/uspvdb.geojson --max-year 2016 --scenario conservative
```

By default, outputs are written under `data/repowering/output/uspvdb-<scenario>/`. They include `plant-results.csv`, `clean-results.csv`, `manual-review.csv`, `excluded.csv`, `top-headroom-clean.csv`, state/axis/year aggregates and `SUMMARY.md`.

The same run writes the web atlas to `public/data/repowering/`: one state-summary file, one detail file per state and a plant-level CSV export.

## Integration notes

No global CSS changes are required: the calculator uses a CSS Module.

If your app already has a global page shell/header, keep the route and component as-is and adjust only the outer `.page` width/padding in the CSS module.

## Important interpretation

The result is modeled **technical same-footprint DC nameplate**. It is not a claim that the added MW can be exported through the existing POI, permitted, financed or economically repowered.
