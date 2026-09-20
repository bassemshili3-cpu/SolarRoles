import type { CalculatorInput, CalculatorResult, GeometryInfo, SensitivityPoint } from './types';

export const ACRE_TO_M2 = 4046.8564224;
const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));
}

function positive(value: number, fallback: number): number {
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function moduleAreaM2(lengthM: number, widthM: number): number {
  return positive(lengthM, 2.384) * positive(widthM, 1.303);
}

export function modulePowerDensityWm2(powerW: number, lengthM: number, widthM: number): number {
  return positive(powerW, 600) / moduleAreaM2(lengthM, widthM);
}

export function solarPosition(latitudeDeg: number, declinationDeg: number, solarTimeHours: number) {
  const lat = clamp(latitudeDeg, -66, 66) * DEG;
  const dec = clamp(declinationDeg, -24, 24) * DEG;
  const hourAngleDeg = (clamp(solarTimeHours, 0, 24) - 12) * 15;
  const h = hourAngleDeg * DEG;
  const sinElevation = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(h);
  const elevation = Math.asin(clamp(sinElevation, -1, 1));
  const azimuth = Math.atan2(
    Math.sin(h),
    Math.cos(h) * Math.sin(lat) - Math.tan(dec) * Math.cos(lat),
  ) * RAD + 180;
  return {
    elevationDeg: elevation * RAD,
    azimuthDeg: (azimuth + 360) % 360,
    hourAngleDeg,
  };
}

export function solarProfileAngle(elevationDeg: number, solarAzimuthDeg: number, surfaceAzimuthDeg: number): number {
  const elevation = elevationDeg * DEG;
  const azDiff = (solarAzimuthDeg - surfaceAzimuthDeg) * DEG;
  const denominator = Math.cos(azDiff);
  if (elevationDeg <= 0 || denominator <= 0.01) return 0;
  return Math.atan(Math.tan(elevation) / denominator) * RAD;
}

export function moduleDimensionsByOrientation(lengthM: number, widthM: number, orientation: CalculatorInput['orientation']) {
  const length = positive(lengthM, 2.384);
  const width = positive(widthM, 1.303);
  const portrait = orientation !== 'landscape';
  return {
    crossSlopeM: portrait ? length : width,
    alongRowM: portrait ? width : length,
  };
}

export function effectiveGcrFromFixedGeometry(input: CalculatorInput): GeometryInfo {
  const dims = moduleDimensionsByOrientation(input.moduleLengthM, input.moduleWidthM, input.orientation);
  const modulesAcross = Math.max(1, Math.round(positive(input.modulesAcross, 2)));
  const gapCrossM = clamp(input.gapCrossM, 0, 0.25);
  const gapAlongM = clamp(input.gapAlongM, 0, 0.25);
  const tiltDeg = clamp(input.tiltDeg, 0, 60);
  const surfaceAzimuthDeg = clamp(input.surfaceAzimuthDeg, 90, 270);
  const activeCrossWidthM = dims.crossSlopeM * modulesAcross;
  const physicalCrossWidthM = activeCrossWidthM + gapCrossM * Math.max(0, modulesAcross - 1);
  const horizontalProjectionM = physicalCrossWidthM * Math.cos(tiltDeg * DEG);
  const rowHeightM = physicalCrossWidthM * Math.sin(tiltDeg * DEG);
  const alongPacking = dims.alongRowM / (dims.alongRowM + gapAlongM);

  let rowPitchM: number;
  let design: GeometryInfo['design'] = null;

  if (input.spacingMode === 'manual') {
    rowPitchM = positive(input.rowPitchM, Math.max(horizontalProjectionM + 1, physicalCrossWidthM / 0.35));
  } else {
    const latitude = clamp(input.latitudeDeg, 15, 55);
    const solarTime = clamp(input.designSolarTime, 8, 12);
    const declination = -23.44;
    const sun = solarPosition(latitude, declination, solarTime);
    const profileAngleDeg = solarProfileAngle(sun.elevationDeg, sun.azimuthDeg, surfaceAzimuthDeg);
    const minEdgeGapM = clamp(input.minEdgeGapM, 0, 10);
    const shadowGapM = profileAngleDeg > 0.1 ? rowHeightM / Math.tan(profileAngleDeg * DEG) : 100;
    const edgeGapM = Math.max(minEdgeGapM, shadowGapM);
    rowPitchM = horizontalProjectionM + edgeGapM;
    design = {
      declinationDeg: declination,
      solarTime,
      sunElevationDeg: sun.elevationDeg,
      sunAzimuthDeg: sun.azimuthDeg,
      profileAngleDeg,
      shadowGapM,
      edgeGapM,
    };
  }

  const rawActiveGcr = (activeCrossWidthM / rowPitchM) * alongPacking;
  return {
    effectiveGcr: clamp(rawActiveGcr, 0.05, 0.85),
    rowPitchM,
    activeCrossWidthM,
    physicalCrossWidthM,
    horizontalProjectionM,
    rowHeightM,
    alongPacking,
    design,
  };
}

export function effectiveGcrFromTrackerGeometry(input: CalculatorInput): GeometryInfo {
  const dims = moduleDimensionsByOrientation(input.moduleLengthM, input.moduleWidthM, input.orientation);
  const modulesAcross = Math.max(1, Math.round(positive(input.modulesAcross, 2)));
  const gapCrossM = clamp(input.gapCrossM, 0, 0.25);
  const gapAlongM = clamp(input.gapAlongM, 0, 0.25);
  const activeCrossWidthM = dims.crossSlopeM * modulesAcross;
  const physicalCrossWidthM = activeCrossWidthM + gapCrossM * Math.max(0, modulesAcross - 1);
  const rowPitchM = positive(input.rowPitchM, physicalCrossWidthM / 0.35);
  const alongPacking = dims.alongRowM / (dims.alongRowM + gapAlongM);
  return {
    effectiveGcr: clamp((activeCrossWidthM / rowPitchM) * alongPacking, 0.05, 0.85),
    rowPitchM,
    activeCrossWidthM,
    physicalCrossWidthM,
    horizontalProjectionM: physicalCrossWidthM,
    rowHeightM: 0,
    alongPacking,
    design: {
      note: 'Tracker density uses physical collector width / row pitch. Annual-energy optimization is outside this capacity-only model.',
    },
  };
}

export function resolveGcr(input: CalculatorInput): GeometryInfo {
  if (input.gcrMode === 'geometry') {
    return input.mountType === 'tracker'
      ? effectiveGcrFromTrackerGeometry(input)
      : effectiveGcrFromFixedGeometry(input);
  }
  return {
    effectiveGcr: clamp(input.gcrPct / 100, 0.05, 0.85),
    rowPitchM: null,
    activeCrossWidthM: null,
    physicalCrossWidthM: null,
    horizontalProjectionM: null,
    rowHeightM: null,
    alongPacking: null,
    design: null,
  };
}

export function calculate(input: CalculatorInput): CalculatorResult {
  const footprintAcres = positive(input.footprintAcres, 100);
  const currentDcMW = positive(input.currentDcMW, 20);
  const currentAcMW = positive(input.currentAcMW, currentDcMW / 1.25);
  const usableFraction = clamp(input.usablePct / 100, 0.1, 1);
  const modulePowerW = positive(input.modulePowerW, 600);
  const dcAcRatio = positive(input.dcAcRatio, 1.3);
  const gcrInfo = resolveGcr(input);
  const moduleArea = moduleAreaM2(input.moduleLengthM, input.moduleWidthM);
  const moduleWm2 = modulePowerDensityWm2(modulePowerW, input.moduleLengthM, input.moduleWidthM);
  const densityMWdcPerAcre = moduleWm2 * gcrInfo.effectiveGcr * usableFraction * ACRE_TO_M2 / 1e6;
  const modeledDcMW = densityMWdcPerAcre * footprintAcres;
  const modeledAcMW = modeledDcMW / dcAcRatio;
  const dcHeadroomMW = modeledDcMW - currentDcMW;
  const dcHeadroomPct = currentDcMW > 0 ? (dcHeadroomMW / currentDcMW) * 100 : 0;
  const currentDensity = currentDcMW / footprintAcres;
  const currentDcAcRatio = currentAcMW > 0 ? currentDcMW / currentAcMW : null;
  const modeledModuleCount = Math.floor((modeledDcMW * 1e6) / modulePowerW);
  const activeModuleAreaM2 = modeledModuleCount * moduleArea;
  const modeledGroundAreaM2 = footprintAcres * ACRE_TO_M2 * usableFraction;
  return {
    footprintAcres,
    currentDcMW,
    currentAcMW,
    currentDcAcRatio,
    usableFraction,
    moduleAreaM2: moduleArea,
    modulePowerDensityWm2: moduleWm2,
    gcr: gcrInfo.effectiveGcr,
    gcrPct: gcrInfo.effectiveGcr * 100,
    densityMWdcPerAcre,
    currentDensityMWdcPerAcre: currentDensity,
    modeledDcMW,
    modeledAcMW,
    dcHeadroomMW,
    dcHeadroomPct,
    modeledModuleCount,
    activeModuleAreaM2,
    modeledGroundAreaM2,
    dcAcRatio,
    geometry: gcrInfo,
    flags: {
      negativeHeadroom: dcHeadroomMW < 0,
      highGcr: gcrInfo.effectiveGcr > 0.55,
      lowGcr: gcrInfo.effectiveGcr < 0.20,
      dcAcChangedMaterially: currentDcAcRatio ? Math.abs(dcAcRatio - currentDcAcRatio) > 0.2 : false,
    },
  };
}

export function sensitivity(input: CalculatorInput, gcrPoints?: number[]): SensitivityPoint[] {
  const base = calculate(input);
  const points = gcrPoints?.length
    ? gcrPoints
    : [Math.max(0.15, base.gcr - 0.08), Math.max(0.15, base.gcr - 0.04), base.gcr, Math.min(0.70, base.gcr + 0.04), Math.min(0.70, base.gcr + 0.08)];
  const seen = new Set<string>();
  return points
    .map((gcr) => clamp(gcr, 0.05, 0.85))
    .filter((gcr) => {
      const key = gcr.toFixed(4);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a - b)
    .map((gcr) => {
      const r = calculate({ ...input, gcrMode: 'direct', gcrPct: gcr * 100 });
      return {
        gcr,
        gcrPct: gcr * 100,
        densityMWdcPerAcre: r.densityMWdcPerAcre,
        modeledDcMW: r.modeledDcMW,
        modeledAcMW: r.modeledAcMW,
        dcHeadroomMW: r.dcHeadroomMW,
        dcHeadroomPct: r.dcHeadroomPct,
      };
    });
}
