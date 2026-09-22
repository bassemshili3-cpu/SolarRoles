import assert from 'node:assert/strict';
import { calculate } from '../lib/repowering/calculator';
import { estimatePpaRenewal, PPA_RENEWAL_CALENDAR_2010_2014, PPA_RENEWAL_PROFILE } from '../lib/repowering/ppaRenewal';
import { buildExpansionHeadroomPoints, median } from '../lib/repowering/expansionChart';
import expansionData from '../public/data/repowering/eia-expansion-by-state.json';
import atlasData from '../public/data/repowering/atlas-reference.json';
import type { EiaExpansionData, RepoweringAtlas } from '../lib/repowering/atlasTypes';
import { demoRectangleGeoJSON, packGeoJSON } from '../lib/repowering/polygonPacking';
import { buildRepoweringAtlas, runFeature, type AtlasConfig } from '../scripts/uspvdbBatch';

const base = calculate({
  siteName: 'test', footprintAcres: 100, currentDcMW: 20, currentAcMW: 16, latitudeDeg: 35, mountType: 'fixed',
  modulePowerW: 600, moduleLengthM: 2, moduleWidthM: 1, dcAcRatio: 1.3, usablePct: 100, gcrMode: 'direct', gcrPct: 35,
  orientation: 'portrait', modulesAcross: 1, gapCrossM: 0, gapAlongM: 0, rowAzimuthDeg: 90, tiltDeg: 0, surfaceAzimuthDeg: 180,
  spacingMode: 'manual', designSolarTime: 9, minEdgeGapM: 0, rowPitchM: 4,
});
assert(base.modeledDcMW > base.currentDcMW);

const demo = demoRectangleGeoJSON(-112, 35, 100, 100);
const packed = packGeoJSON(demo, {
  rowAzimuthDeg: 90, rowPitchM: 10, rowStripWidthM: 2, alongModuleM: 2, gapAlongM: 0, modulesAcross: 1,
  boundaryClearanceM: 0, phaseSteps: 1, modulePowerW: 600, moduleLengthM: 2, moduleWidthM: 1, returnGeometry: false,
});
assert(packed.totalModules > 0);
assert(packed.totalRows > 0);

const atlasConfig: AtlasConfig = {
  module: { powerW: 600, lengthM: 2.384, widthM: 1.303, orientation: 'portrait' },
  layout: {
    modulesAcross: 2, gapCrossM: 0.02, gapAlongM: 0.02, phaseSteps: 1, stripSampleCount: 3, maxRows: 5000,
    referenceDcAcRatio: 1.32, useExistingFixedTilt: true, useExistingFixedAzimuth: true,
    fixedFallbackAzimuthDeg: 180, trackerRowAzimuthDeg: 0,
  },
  scenarios: { reference: { boundaryClearanceM: 1, fixedDesignSolarTime: 9, fixedMinEdgeGapM: 0.5, trackerTargetGcr: 0.35 } },
};
const officialRecord = demoRectangleGeoJSON(-112, 35, 100, 100);
officialRecord.properties = {
  p_name: 'Official record', p_state: 'AZ', p_cap_dc: 0.01, p_axis: 'unknown', p_tilt: -9999, p_year: 2009,
  p_dig_conf: 1, p_zscore: 99,
};
const modeled = runFeature(officialRecord, atlasConfig, 'reference');
assert.equal(modeled.status, 'modeled', 'QA-like source attributes must not exclude a modelable facility');

const modernRecord = demoRectangleGeoJSON(-111, 35, 100, 100);
modernRecord.properties = { p_name: 'Modern record', p_state: 'AZ', p_cap_dc: 0.02, p_axis: 'single-axis', p_year: 2022 };
const modern = runFeature(modernRecord, atlasConfig, 'reference');
assert.equal(modern.status, 'modeled');
const { atlas } = buildRepoweringAtlas([modeled, modern], {
  dataset: 'test', datasetDate: 'test', datasetUrl: 'https://example.com', analysisRun: 'test', scenario: 'reference',
});
assert.deepEqual(atlas.national.vintageCohorts.map((cohort) => cohort.label), ['Before 2010', '2010–2014', '2015–2019', '2020–2026']);
assert.equal(atlas.national.facilitiesWithoutCohortYear, 0);
assert.equal(atlas.national.vintageCohorts[0].facilities, 1);
assert.equal(atlas.national.vintageCohorts[3].facilities, 1);

assert.equal(PPA_RENEWAL_PROFILE.sampleSize, 546);
assert.equal(PPA_RENEWAL_PROFILE.medianTermYears, 20);
assert.equal(PPA_RENEWAL_PROFILE.coreTermCount, 420);
assert.equal(PPA_RENEWAL_PROFILE.cohortExecutionSampleSize, 114);
assert.equal(PPA_RENEWAL_PROFILE.cohortExecutionMedianTermYears, 20);
assert.equal(PPA_RENEWAL_PROFILE.cohortExecutionCoreTermCount, 97);
assert.equal(PPA_RENEWAL_PROFILE.cohortExecutionCoreTermSharePct, 85.1);
assert.equal(PPA_RENEWAL_PROFILE.cohortExecutionShortTermOrLessCount, 6);
assert.equal(PPA_RENEWAL_CALENDAR_2010_2014.length, 5);
assert.deepEqual(estimatePpaRenewal(2010), {
  codYear: 2010,
  shortTermMarker: 2025,
  medianTermMarker: 2030,
  coreWindowStart: 2030,
  coreWindowEnd: 2035,
  status: 'Approaching typical PPA window',
});
assert.equal(estimatePpaRenewal(2011).status, 'Long-range planning');
assert.equal(estimatePpaRenewal(2012).status, 'Long-range planning');
assert.equal(PPA_RENEWAL_CALENDAR_2010_2014.reduce((sum, row) => sum + row.facilities, 0), 977);
assert.equal(Number(PPA_RENEWAL_CALENDAR_2010_2014.reduce((sum, row) => sum + row.currentDcGW, 0).toFixed(3)), 10.599);
assert.equal(Number(PPA_RENEWAL_CALENDAR_2010_2014.reduce((sum, row) => sum + row.additionalDcGW, 0).toFixed(3)), 5.936);
assert.equal(PPA_RENEWAL_CALENDAR_2010_2014[0].coreWindowStart, 2030);
assert.equal(PPA_RENEWAL_CALENDAR_2010_2014[4].coreWindowEnd, 2039);

const expansionPoints = buildExpansionHeadroomPoints(
  (atlasData as unknown as RepoweringAtlas).states,
  expansionData as EiaExpansionData,
);
assert.equal(expansionPoints.length, 48);
assert.equal((expansionData as EiaExpansionData).national.shareBeyond5KmPct, 77.748);
assert.equal(Number(median(expansionPoints.map((point) => point.headroomPct)).toFixed(3)), 19.185);
assert(expansionPoints.every((point) => point.shareBeyond5KmPct >= 0 && point.shareBeyond5KmPct <= 100));
assert.equal(expansionPoints.filter((point) => point.matchedOutputCoveragePct >= 100).length, 7);
const californiaCoverage = expansionPoints.find((point) => point.state === 'CA');
assert(californiaCoverage);
assert.equal(Number(californiaCoverage.matchedOutputCoveragePct.toFixed(1)), 226.5);
assert(expansionPoints.every((point) => point.headroomAcMW >= 0));
const aggregateCoverage = expansionPoints.reduce((sum, point) => sum + point.headroomAcMW, 0)
  / expansionPoints.reduce((sum, point) => sum + point.beyond5KmPipelineMW, 0) * 100;
assert.equal(Number(aggregateCoverage.toFixed(1)), 36.5);

const missingCapacity = demoRectangleGeoJSON(-112, 35, 100, 100);
missingCapacity.properties = { p_name: 'Missing capacity', p_state: 'AZ', p_cap_dc: null };
const unable = runFeature(missingCapacity, atlasConfig, 'reference');
assert.equal(unable.status, 'unable');
if (unable.status === 'unable') assert.equal(unable.unableReason, 'CURRENT_DC_MISSING_OR_INVALID');
console.log('core tests passed');
