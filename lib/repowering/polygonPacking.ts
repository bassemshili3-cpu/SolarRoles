import { ACRE_TO_M2, clamp } from './calculator';
import type { GeoJSONFeature, GeoJSONFeatureCollection, GeoJSONInput, PolygonPackOptions, PolygonPackResult } from './types';

const EARTH_RADIUS_M = 6371008.8;
const DEG = Math.PI / 180;

type Point = [number, number];
type Ring = Point[];
type Polygon = Ring[];
type MultiPolygon = Polygon[];

function isFeature(value: GeoJSONInput): value is GeoJSONFeature {
  return (value as GeoJSONFeature)?.type === 'Feature';
}

function isFeatureCollection(value: GeoJSONInput): value is GeoJSONFeatureCollection {
  return (value as GeoJSONFeatureCollection)?.type === 'FeatureCollection';
}

function closeRing(ring: Ring): Ring {
  if (!ring.length) return ring;
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] === last[0] && first[1] === last[1]) return ring;
  return [...ring, [...first] as Point];
}

export function normalizeGeometry(input: GeoJSONInput): { polygons: MultiPolygon; properties: Record<string, unknown> | null } {
  let source: GeoJSONInput = input;
  let properties: Record<string, unknown> | null = null;

  if (isFeatureCollection(source)) {
    const feature = source.features.find((f) => f.geometry?.type === 'Polygon' || f.geometry?.type === 'MultiPolygon');
    if (!feature) throw new Error('FeatureCollection does not contain a Polygon or MultiPolygon.');
    source = feature;
  }
  if (isFeature(source)) {
    properties = source.properties ?? null;
    source = source.geometry;
  }

  const geometry = source as GeoJSONFeature['geometry'];
  if (!geometry || (geometry.type !== 'Polygon' && geometry.type !== 'MultiPolygon')) {
    throw new Error('GeoJSON must be a Polygon or MultiPolygon.');
  }

  const raw = geometry.type === 'Polygon'
    ? [geometry.coordinates as number[][][]]
    : geometry.coordinates as number[][][][];

  const polygons: MultiPolygon = raw.map((poly) =>
    poly.map((ring) => closeRing(ring.map(([lon, lat]) => [Number(lon), Number(lat)] as Point))),
  );
  return { polygons, properties };
}

function centroidLonLat(polygons: MultiPolygon): Point {
  let sx = 0;
  let sy = 0;
  let n = 0;
  polygons.forEach((poly) => poly.forEach((ring) => ring.forEach(([lon, lat], idx) => {
    if (idx === ring.length - 1) return;
    sx += lon;
    sy += lat;
    n += 1;
  })));
  if (!n) throw new Error('Polygon has no coordinates.');
  return [sx / n, sy / n];
}

function projectPoint(lon: number, lat: number, lon0: number, lat0: number): Point {
  const x = EARTH_RADIUS_M * (lon - lon0) * DEG * Math.cos(lat0 * DEG);
  const y = EARTH_RADIUS_M * (lat - lat0) * DEG;
  return [x, y];
}

function unprojectPoint(x: number, y: number, lon0: number, lat0: number): Point {
  const lon = lon0 + (x / (EARTH_RADIUS_M * Math.cos(lat0 * DEG))) / DEG;
  const lat = lat0 + (y / EARTH_RADIUS_M) / DEG;
  return [lon, lat];
}

export function projectGeoJSON(input: GeoJSONInput) {
  const normalized = normalizeGeometry(input);
  const [lon0, lat0] = centroidLonLat(normalized.polygons);
  const projected: MultiPolygon = normalized.polygons.map((poly) =>
    poly.map((ring) => ring.map(([lon, lat]) => projectPoint(lon, lat, lon0, lat0))),
  );
  return { projected, lon0, lat0, properties: normalized.properties };
}

function ringSignedArea(ring: Ring): number {
  let area = 0;
  for (let i = 0; i < ring.length - 1; i += 1) {
    area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1];
  }
  return area / 2;
}

export function polygonAreaM2(polygons: MultiPolygon): number {
  let total = 0;
  polygons.forEach((poly) => {
    if (!poly.length) return;
    total += Math.abs(ringSignedArea(poly[0]));
    for (let i = 1; i < poly.length; i += 1) total -= Math.abs(ringSignedArea(poly[i]));
  });
  return Math.max(0, total);
}

export function xyToUv(x: number, y: number, rowAzimuthDeg: number): Point {
  const a = rowAzimuthDeg * DEG;
  const ex = Math.sin(a);
  const ey = Math.cos(a);
  const nx = Math.cos(a);
  const ny = -Math.sin(a);
  return [x * ex + y * ey, x * nx + y * ny];
}

export function uvToXy(u: number, v: number, rowAzimuthDeg: number): Point {
  const a = rowAzimuthDeg * DEG;
  const ex = Math.sin(a);
  const ey = Math.cos(a);
  const nx = Math.cos(a);
  const ny = -Math.sin(a);
  return [u * ex + v * nx, u * ey + v * ny];
}

export function rotateProjected(polygons: MultiPolygon, rowAzimuthDeg: number): MultiPolygon {
  return polygons.map((poly) => poly.map((ring) => ring.map(([x, y]) => xyToUv(x, y, rowAzimuthDeg))));
}

function boundsUv(polygons: MultiPolygon) {
  let minU = Infinity;
  let maxU = -Infinity;
  let minV = Infinity;
  let maxV = -Infinity;
  polygons.forEach((poly) => poly.forEach((ring) => ring.forEach(([u, v]) => {
    minU = Math.min(minU, u);
    maxU = Math.max(maxU, u);
    minV = Math.min(minV, v);
    maxV = Math.max(maxV, v);
  })));
  return { minU, maxU, minV, maxV };
}

function mergeIntervals(intervals: [number, number][], tolerance = 1e-7): [number, number][] {
  if (!intervals.length) return [];
  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);
  const out: [number, number][] = [[...sorted[0]] as [number, number]];
  for (let i = 1; i < sorted.length; i += 1) {
    const cur = sorted[i];
    const last = out[out.length - 1];
    if (cur[0] <= last[1] + tolerance) last[1] = Math.max(last[1], cur[1]);
    else out.push([...cur] as [number, number]);
  }
  return out;
}

function intervalsAtVForPolygon(poly: Polygon, v: number): [number, number][] {
  const crossings: number[] = [];
  poly.forEach((ring) => {
    for (let i = 0; i < ring.length - 1; i += 1) {
      const [u1, v1] = ring[i];
      const [u2, v2] = ring[i + 1];
      if ((v1 <= v && v < v2) || (v2 <= v && v < v1)) {
        const t = (v - v1) / (v2 - v1);
        crossings.push(u1 + t * (u2 - u1));
      }
    }
  });
  crossings.sort((a, b) => a - b);
  const intervals: [number, number][] = [];
  for (let i = 0; i + 1 < crossings.length; i += 2) {
    if (crossings[i + 1] > crossings[i]) intervals.push([crossings[i], crossings[i + 1]]);
  }
  return intervals;
}

export function intervalsAtV(rotatedPolygons: MultiPolygon, v: number): [number, number][] {
  const all: [number, number][] = [];
  rotatedPolygons.forEach((poly) => all.push(...intervalsAtVForPolygon(poly, v)));
  return mergeIntervals(all);
}

function intersectTwoIntervalSets(a: [number, number][], b: [number, number][]): [number, number][] {
  const out: [number, number][] = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    const start = Math.max(a[i][0], b[j][0]);
    const end = Math.min(a[i][1], b[j][1]);
    if (end > start) out.push([start, end]);
    if (a[i][1] < b[j][1]) i += 1;
    else j += 1;
  }
  return out;
}

export function stripIntervals(rotatedPolygons: MultiPolygon, centerV: number, stripWidthM: number, sampleCount = 5): [number, number][] {
  const low = centerV - stripWidthM / 2;
  const high = centerV + stripWidthM / 2;
  const eps = stripWidthM * 1e-7 + 1e-6;
  const levels = [low + eps, high - eps, centerV];

  rotatedPolygons.forEach((poly) => poly.forEach((ring) => ring.forEach((point) => {
    const v = point[1];
    if (v > low + eps && v < high - eps) {
      levels.push(Math.max(low + eps, v - eps));
      levels.push(Math.min(high - eps, v + eps));
    }
  })));

  const samples = Math.max(3, Math.min(11, Math.round(sampleCount || 5)));
  for (let i = 1; i < samples - 1; i += 1) {
    levels.push(low + eps + (i / (samples - 1)) * Math.max(0, stripWidthM - 2 * eps));
  }

  const unique = Array.from(new Set(levels.map((v) => v.toFixed(7)))).map(Number).sort((a, b) => a - b);
  const evalLevels = unique.slice();
  for (let i = 0; i + 1 < unique.length; i += 1) evalLevels.push((unique[i] + unique[i + 1]) / 2);
  evalLevels.sort((a, b) => a - b);

  let allowed: [number, number][] | null = null;
  for (const v of evalLevels) {
    const intervals = intervalsAtV(rotatedPolygons, v);
    allowed = allowed === null ? intervals : intersectTwoIntervalSets(allowed, intervals);
    if (!allowed.length) break;
  }
  return allowed ?? [];
}

function packInterval(interval: [number, number], alongModuleM: number, gapAlongM: number, modulesAcross: number, endClearanceM: number) {
  const start = interval[0] + endClearanceM;
  const end = interval[1] - endClearanceM;
  const available = end - start;
  if (available < alongModuleM) return null;
  const unit = alongModuleM + gapAlongM;
  const modulesAlong = Math.floor((available + gapAlongM + 1e-6) / unit);
  if (modulesAlong < 1) return null;
  const occupiedLength = modulesAlong * alongModuleM + Math.max(0, modulesAlong - 1) * gapAlongM;
  const spare = Math.max(0, available - occupiedLength);
  const packStart = start + spare / 2;
  return {
    modulesAlong,
    moduleCount: modulesAlong * modulesAcross,
    packStart,
    packEnd: packStart + occupiedLength,
    occupiedLength,
  };
}

function evaluatePhase(rotatedPolygons: MultiPolygon, options: Required<Pick<PolygonPackOptions, 'rowPitchM' | 'rowStripWidthM' | 'alongModuleM' | 'gapAlongM' | 'modulesAcross' | 'boundaryClearanceM' | 'stripSampleCount' | 'maxRows' | 'maxSegmentsStored'>>, phaseFraction: number) {
  const b = boundsUv(rotatedPolygons);
  const half = options.rowStripWidthM / 2;
  const minCenter = b.minV + options.boundaryClearanceM + half;
  const maxCenter = b.maxV - options.boundaryClearanceM - half;
  const phase = phaseFraction * options.rowPitchM;
  let v = minCenter + phase;
  if (v > maxCenter) v = minCenter;

  let totalModules = 0;
  let totalRows = 0;
  let totalSegments = 0;
  let totalOccupiedRowLengthM = 0;
  const segments: PolygonPackResult['segments'] = [];
  let rowCounter = 0;

  for (; v <= maxCenter + 1e-7; v += options.rowPitchM) {
    rowCounter += 1;
    if (rowCounter > options.maxRows) throw new Error('Row count exceeded safety limit. Check row pitch or polygon units.');
    const allowed = stripIntervals(rotatedPolygons, v, options.rowStripWidthM, options.stripSampleCount);
    let rowHasModules = false;
    allowed.forEach((interval) => {
      const packed = packInterval(interval, options.alongModuleM, options.gapAlongM, options.modulesAcross, options.boundaryClearanceM);
      if (!packed) return;
      totalModules += packed.moduleCount;
      totalSegments += 1;
      totalOccupiedRowLengthM += packed.occupiedLength;
      rowHasModules = true;
      if (segments.length < options.maxSegmentsStored) {
        segments.push({
          v,
          u1: packed.packStart,
          u2: packed.packEnd,
          moduleCount: packed.moduleCount,
          modulesAlong: packed.modulesAlong,
        });
      }
    });
    if (rowHasModules) totalRows += 1;
  }
  return { totalModules, totalRows, totalSegments, totalOccupiedRowLengthM, segments, phaseFraction, phaseOffsetM: phase };
}

export function packGeoJSON(input: GeoJSONInput, options: PolygonPackOptions): PolygonPackResult {
  const p = projectGeoJSON(input);
  const rowAzimuthDeg = ((Number(options.rowAzimuthDeg) % 180) + 180) % 180;
  const rotated = rotateProjected(p.projected, rowAzimuthDeg);
  const areaM2 = polygonAreaM2(p.projected);
  if (!(areaM2 > 1)) throw new Error('Polygon area is too small or invalid.');

  const safeOptions = {
    rowPitchM: clamp(options.rowPitchM, 0.2, 100),
    rowStripWidthM: clamp(options.rowStripWidthM, 0.05, 50),
    alongModuleM: clamp(options.alongModuleM, 0.1, 10),
    gapAlongM: clamp(options.gapAlongM, 0, 1),
    modulesAcross: Math.max(1, Math.min(12, Math.round(Number(options.modulesAcross) || 1))),
    boundaryClearanceM: clamp(options.boundaryClearanceM, 0, 100),
    stripSampleCount: Math.max(3, Math.min(11, Math.round(Number(options.stripSampleCount) || 5))),
    maxRows: options.maxRows ?? 50000,
    maxSegmentsStored: Number.isFinite(Number(options.maxSegmentsStored)) ? Math.max(0, Math.round(Number(options.maxSegmentsStored))) : 12000,
  };

  if (safeOptions.rowPitchM < safeOptions.rowStripWidthM) {
    throw new Error('Row pitch must be at least as large as the ground-projected row width.');
  }

  const phaseSteps = Math.max(1, Math.min(24, Math.round(Number(options.phaseSteps) || 8)));
  let best: ReturnType<typeof evaluatePhase> | null = null;
  for (let i = 0; i < phaseSteps; i += 1) {
    const result = evaluatePhase(rotated, safeOptions, i / phaseSteps);
    if (!best || result.totalModules > best.totalModules) best = result;
  }
  if (!best) throw new Error('Unable to pack polygon.');

  const modulePowerW = Number(options.modulePowerW) || 600;
  const moduleAreaM2 = (Number(options.moduleLengthM) || 2.384) * (Number(options.moduleWidthM) || 1.303);
  const dcMW = best.totalModules * modulePowerW / 1e6;
  const activeModuleAreaM2 = best.totalModules * moduleAreaM2;
  const effectiveGcr = activeModuleAreaM2 / areaM2;

  return {
    areaM2,
    areaAcres: areaM2 / ACRE_TO_M2,
    rowAzimuthDeg,
    options: safeOptions,
    totalModules: best.totalModules,
    totalRows: best.totalRows,
    totalSegments: best.totalSegments,
    totalOccupiedRowLengthM: best.totalOccupiedRowLengthM,
    dcMW,
    activeModuleAreaM2,
    effectiveGcr,
    effectiveGcrPct: effectiveGcr * 100,
    phaseOffsetM: best.phaseOffsetM,
    phaseFraction: best.phaseFraction,
    segments: best.segments,
    rotatedPolygons: options.returnGeometry === false ? null : rotated,
    projectedPolygons: options.returnGeometry === false ? null : p.projected,
    bounds: options.returnGeometry === false ? null : boundsUv(rotated),
    origin: { lon0: p.lon0, lat0: p.lat0 },
    properties: p.properties,
  };
}

export function demoRectangleGeoJSON(centerLon = -112, centerLat = 35, widthM = 1600, heightM = 1250): GeoJSONFeature {
  const corners: Point[] = [
    [-widthM / 2, -heightM / 2],
    [widthM / 2, -heightM / 2],
    [widthM / 2, heightM / 2],
    [-widthM / 2, heightM / 2],
    [-widthM / 2, -heightM / 2],
  ].map(([x, y]) => unprojectPoint(x, y, centerLon, centerLat));
  return {
    type: 'Feature',
    properties: { name: 'Demo rectangular solar footprint' },
    geometry: { type: 'Polygon', coordinates: [corners] },
  };
}
