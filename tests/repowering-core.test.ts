import assert from 'node:assert/strict';
import { calculate } from '../lib/repowering/calculator';
import { demoRectangleGeoJSON, packGeoJSON } from '../lib/repowering/polygonPacking';
import { runFeature, type AtlasConfig } from '../scripts/uspvdbBatch';

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
  p_name: 'Official record', p_state: 'AZ', p_cap_dc: 0.01, p_axis: 'unknown', p_tilt: -9999,
  p_dig_conf: 1, p_zscore: 99,
};
const modeled = runFeature(officialRecord, atlasConfig, 'reference');
assert.equal(modeled.status, 'modeled', 'QA-like source attributes must not exclude a modelable facility');

const missingCapacity = demoRectangleGeoJSON(-112, 35, 100, 100);
missingCapacity.properties = { p_name: 'Missing capacity', p_state: 'AZ', p_cap_dc: null };
const unable = runFeature(missingCapacity, atlasConfig, 'reference');
assert.equal(unable.status, 'unable');
if (unable.status === 'unable') assert.equal(unable.unableReason, 'CURRENT_DC_MISSING_OR_INVALID');
console.log('core tests passed');
