export type MountType = 'fixed' | 'tracker';
export type GcrMode = 'direct' | 'geometry';
export type Orientation = 'portrait' | 'landscape';
export type SpacingMode = 'shade-free' | 'manual';
export type CapacityMethod = 'area' | 'polygon';

export interface CalculatorInput {
  siteName?: string;
  footprintAcres: number;
  currentDcMW: number;
  currentAcMW: number;
  latitudeDeg: number;
  mountType: MountType;
  modulePowerW: number;
  moduleLengthM: number;
  moduleWidthM: number;
  dcAcRatio: number;
  usablePct: number;
  gcrMode: GcrMode;
  gcrPct: number;
  orientation: Orientation;
  modulesAcross: number;
  gapCrossM: number;
  gapAlongM: number;
  rowAzimuthDeg: number;
  tiltDeg: number;
  surfaceAzimuthDeg: number;
  spacingMode: SpacingMode;
  designSolarTime: number;
  minEdgeGapM: number;
  rowPitchM: number;
}

export interface GeometryInfo {
  effectiveGcr: number;
  rowPitchM: number | null;
  activeCrossWidthM: number | null;
  physicalCrossWidthM: number | null;
  horizontalProjectionM: number | null;
  rowHeightM: number | null;
  alongPacking: number | null;
  design: null | Record<string, number | string>;
}

export interface CalculatorResult {
  footprintAcres: number;
  currentDcMW: number;
  currentAcMW: number;
  currentDcAcRatio: number | null;
  usableFraction: number;
  moduleAreaM2: number;
  modulePowerDensityWm2: number;
  gcr: number;
  gcrPct: number;
  densityMWdcPerAcre: number;
  currentDensityMWdcPerAcre: number;
  modeledDcMW: number;
  modeledAcMW: number;
  dcHeadroomMW: number;
  dcHeadroomPct: number;
  modeledModuleCount: number;
  activeModuleAreaM2: number;
  modeledGroundAreaM2: number;
  dcAcRatio: number;
  geometry: GeometryInfo;
  flags: {
    negativeHeadroom: boolean;
    highGcr: boolean;
    lowGcr: boolean;
    dcAcChangedMaterially: boolean;
  };
}

export interface SensitivityPoint {
  gcr: number;
  gcrPct: number;
  densityMWdcPerAcre: number;
  modeledDcMW: number;
  modeledAcMW: number;
  dcHeadroomMW: number;
  dcHeadroomPct: number;
}

export interface GeoJSONFeature {
  type: 'Feature';
  properties?: Record<string, unknown> | null;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: unknown;
  };
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

export type GeoJSONInput = GeoJSONFeature | GeoJSONFeatureCollection | GeoJSONFeature['geometry'];

export interface PolygonPackOptions {
  rowAzimuthDeg: number;
  rowPitchM: number;
  rowStripWidthM: number;
  alongModuleM: number;
  gapAlongM: number;
  modulesAcross: number;
  boundaryClearanceM: number;
  stripSampleCount?: number;
  maxRows?: number;
  maxSegmentsStored?: number;
  phaseSteps?: number;
  modulePowerW: number;
  moduleLengthM: number;
  moduleWidthM: number;
  returnGeometry?: boolean;
}

export interface PackedSegment {
  v: number;
  u1: number;
  u2: number;
  moduleCount: number;
  modulesAlong: number;
}

export interface PolygonPackResult {
  areaM2: number;
  areaAcres: number;
  rowAzimuthDeg: number;
  options: Required<Pick<PolygonPackOptions, 'rowPitchM' | 'rowStripWidthM' | 'alongModuleM' | 'gapAlongM' | 'modulesAcross' | 'boundaryClearanceM' | 'stripSampleCount' | 'maxRows' | 'maxSegmentsStored'>>;
  totalModules: number;
  totalRows: number;
  totalSegments: number;
  totalOccupiedRowLengthM: number;
  dcMW: number;
  activeModuleAreaM2: number;
  effectiveGcr: number;
  effectiveGcrPct: number;
  phaseOffsetM: number;
  phaseFraction: number;
  segments: PackedSegment[];
  rotatedPolygons: number[][][][] | null;
  projectedPolygons: number[][][][] | null;
  bounds: { minU: number; maxU: number; minV: number; maxV: number } | null;
  origin: { lon0: number; lat0: number };
  properties: Record<string, unknown> | null;
}
