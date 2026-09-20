# Methodology — Hidden Solar GW

## Primary quantity

The model estimates modern **MWdc physically packable inside an existing direct-array footprint**.

It deliberately separates:

1. Physical DC nameplate capacity (modeled here)
2. Equivalent MWac at a selected DC/AC ratio
3. Export/interconnection capacity (not modeled)

## Area/GCR mode

The transparent long-row approximation is:

`MWdc/acre = module W/m² × effective GCR × usable fraction × 4046.8564224 / 1e6`

Fixed-tilt geometry can derive row pitch from latitude, tilt, surface azimuth and a shade-free design solar time. Tracker geometry can derive pitch from a target GCR.

## Polygon mode

The polygon engine:

1. Reads WGS84 Polygon/MultiPolygon GeoJSON.
2. Projects coordinates into a local metric plane.
3. Rotates geometry into the modeled row axis.
4. Generates row strips at the selected pitch.
5. Intersects each strip with polygon boundaries and holes.
6. Applies boundary/end clearance.
7. Counts only complete modules fitting in each remaining segment.
8. Tries multiple row-phase offsets and keeps the highest module count.

This captures irregular boundaries and edge losses that an acres × GCR estimate cannot.

## Publication-grade batch filtering

The default config requires high digitization confidence, known mounting axis, valid current DC capacity and ground-mounted systems, excludes explicit agrivoltaics, and removes extreme source density z-scores from the headline set.

Included sites can still be flagged for manual review when the modeled geometry materially disagrees with source area, produces unusually high/low packed GCR, falls materially below current nameplate or suffers high shape loss.

## State atlas eligibility

The state choropleth uses only facilities in the clean set. A state receives a performance color only when both conditions are met:

- at least 10 clean facilities;
- clean coverage of at least 70% of the state facilities processed by the reference run.

States below either threshold are labeled `Insufficient sample`. Eligible states with fewer than 25 clean facilities receive a `Low sample` badge. State totals, mounting and vintage splits, markers and rankings all use the same clean population; excluded and manual-review records remain visible as QA counts rather than being mixed into the headline estimate.

The PR headline should use `clean-results.csv` / `clean_only`, while all excluded/reviewed facilities remain auditable.
