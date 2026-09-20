'use client';

import { useMemo, useState } from 'react';
import styles from './RepoweringCalculator.module.css';
import { calculate, moduleDimensionsByOrientation, resolveGcr, sensitivity } from '@/lib/repowering/calculator';
import { demoRectangleGeoJSON, packGeoJSON, projectGeoJSON, polygonAreaM2 } from '@/lib/repowering/polygonPacking';
import type { CalculatorInput, CapacityMethod, GeoJSONInput, PolygonPackResult } from '@/lib/repowering/types';

const DEFAULT_INPUT: CalculatorInput = {
  siteName: 'Example legacy solar farm',
  footprintAcres: 500,
  currentDcMW: 110,
  currentAcMW: 85,
  latitudeDeg: 35,
  mountType: 'fixed',
  modulePowerW: 600,
  moduleLengthM: 2.384,
  moduleWidthM: 1.303,
  dcAcRatio: 1.3,
  usablePct: 100,
  gcrMode: 'geometry',
  gcrPct: 35,
  orientation: 'portrait',
  modulesAcross: 2,
  gapCrossM: 0.02,
  gapAlongM: 0.02,
  rowAzimuthDeg: 90,
  tiltDeg: 30,
  surfaceAzimuthDeg: 180,
  spacingMode: 'shade-free',
  designSolarTime: 9,
  minEdgeGapM: 0.5,
  rowPitchM: 6,
};

const PRESETS: Record<string, Partial<CalculatorInput>> = {
  conservative: {
    modulePowerW: 580,
    dcAcRatio: 1.25,
    gcrMode: 'direct',
    gcrPct: 28,
    rowPitchM: 8,
  },
  reference: {
    modulePowerW: 600,
    dcAcRatio: 1.3,
    gcrMode: 'geometry',
    designSolarTime: 9,
    minEdgeGapM: 0.5,
    rowPitchM: 6,
  },
  dense: {
    modulePowerW: 620,
    dcAcRatio: 1.35,
    gcrMode: 'direct',
    gcrPct: 44,
    rowPitchM: 5,
  },
};

function n(value: string): number {
  return Number(value);
}

function fmt(value: number, digits = 1): string {
  return Number.isFinite(value) ? value.toLocaleString('en-US', { maximumFractionDigits: digits, minimumFractionDigits: digits }) : '—';
}

function propNumber(props: Record<string, unknown> | null | undefined, ...keys: string[]): number | null {
  if (!props) return null;
  for (const key of keys) {
    const value = Number(props[key]);
    if (Number.isFinite(value)) return value;
  }
  return null;
}

function propString(props: Record<string, unknown> | null | undefined, ...keys: string[]): string | null {
  if (!props) return null;
  for (const key of keys) {
    const value = props[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function detectMount(axis: string | null): CalculatorInput['mountType'] | null {
  if (!axis) return null;
  const normalized = axis.toLowerCase();
  if (normalized.includes('single') || normalized.includes('track')) return 'tracker';
  if (normalized.includes('fixed') || normalized.includes('none')) return 'fixed';
  return null;
}

function polygonPackingInputs(input: CalculatorInput) {
  const dims = moduleDimensionsByOrientation(input.moduleLengthM, input.moduleWidthM, input.orientation);
  const activeCrossWidthM = dims.crossSlopeM * Math.max(1, Math.round(input.modulesAcross));
  const physicalCrossWidthM = activeCrossWidthM + input.gapCrossM * Math.max(0, Math.round(input.modulesAcross) - 1);
  const alongPacking = dims.alongRowM / (dims.alongRowM + input.gapAlongM);
  const gcrInfo = resolveGcr(input);
  const rowPitchM = gcrInfo.rowPitchM ?? Math.max(
    input.mountType === 'fixed' ? physicalCrossWidthM * Math.cos(input.tiltDeg * Math.PI / 180) : physicalCrossWidthM,
    (activeCrossWidthM * alongPacking) / Math.max(0.05, gcrInfo.effectiveGcr),
  );
  const rowStripWidthM = input.mountType === 'fixed'
    ? physicalCrossWidthM * Math.cos(input.tiltDeg * Math.PI / 180)
    : physicalCrossWidthM;
  return {
    rowPitchM,
    rowStripWidthM,
    alongModuleM: dims.alongRowM,
  };
}

function Preview({ pack }: { pack: PolygonPackResult | null }) {
  if (!pack?.rotatedPolygons || !pack.bounds) {
    return <div className={styles.previewEmpty}>Load a GeoJSON footprint to preview the modeled rows.</div>;
  }
  const width = 700;
  const height = 440;
  const pad = 22;
  const { minU, maxU, minV, maxV } = pack.bounds;
  const spanU = Math.max(1, maxU - minU);
  const spanV = Math.max(1, maxV - minV);
  const scale = Math.min((width - pad * 2) / spanU, (height - pad * 2) / spanV);
  const x = (u: number) => pad + (u - minU) * scale;
  const y = (v: number) => height - pad - (v - minV) * scale;
  const polygonPaths = pack.rotatedPolygons.map((poly) =>
    poly.map((ring) => ring.map(([u, v], idx) => `${idx ? 'L' : 'M'}${x(u).toFixed(2)},${y(v).toFixed(2)}`).join(' ') + ' Z').join(' '),
  );

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className={styles.previewSvg} role="img" aria-label="Modeled solar footprint and repowering rows">
      {polygonPaths.map((d, idx) => <path key={`p-${idx}`} d={d} className={styles.footprintPath} fillRule="evenodd" />)}
      {pack.segments.slice(0, 9000).map((segment, idx) => (
        <line
          key={`s-${idx}`}
          x1={x(segment.u1)}
          y1={y(segment.v)}
          x2={x(segment.u2)}
          y2={y(segment.v)}
          className={styles.rowLine}
        />
      ))}
    </svg>
  );
}

export default function RepoweringCalculator() {
  const [input, setInput] = useState<CalculatorInput>(DEFAULT_INPUT);
  const [capacityMethod, setCapacityMethod] = useState<CapacityMethod>('polygon');
  const [geojson, setGeojson] = useState<GeoJSONInput | null>(null);
  const [geojsonText, setGeojsonText] = useState('');
  const [boundaryClearanceM, setBoundaryClearanceM] = useState(1);
  const [phaseSteps, setPhaseSteps] = useState(10);
  const [error, setError] = useState<string | null>(null);

  const areaResult = useMemo(() => calculate(input), [input]);

  const packResult = useMemo(() => {
    if (capacityMethod !== 'polygon' || !geojson) return null;
    try {
      const layout = polygonPackingInputs(input);
      return packGeoJSON(geojson, {
        rowAzimuthDeg: input.rowAzimuthDeg,
        rowPitchM: layout.rowPitchM,
        rowStripWidthM: layout.rowStripWidthM,
        alongModuleM: layout.alongModuleM,
        gapAlongM: input.gapAlongM,
        modulesAcross: input.modulesAcross,
        boundaryClearanceM,
        phaseSteps,
        modulePowerW: input.modulePowerW,
        moduleLengthM: input.moduleLengthM,
        moduleWidthM: input.moduleWidthM,
        returnGeometry: true,
      });
    } catch {
      return null;
    }
  }, [capacityMethod, geojson, input, boundaryClearanceM, phaseSteps]);

  const modeledDc = packResult?.dcMW ?? areaResult.modeledDcMW;
  const modeledAc = modeledDc / input.dcAcRatio;
  const headroom = modeledDc - input.currentDcMW;
  const headroomPct = input.currentDcMW > 0 ? headroom / input.currentDcMW * 100 : 0;
  const effectiveGcrPct = packResult?.effectiveGcrPct ?? areaResult.gcrPct;
  const footprintAcres = packResult?.areaAcres ?? input.footprintAcres;
  const density = modeledDc / footprintAcres;
  const sensitivityRows = sensitivity(input);

  const update = <K extends keyof CalculatorInput>(key: K, value: CalculatorInput[K]) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  function loadGeoJSON(parsed: GeoJSONInput) {
    try {
      const projected = projectGeoJSON(parsed);
      const areaAcres = polygonAreaM2(projected.projected) / 4046.8564224;
      const props = projected.properties;
      const siteName = propString(props, 'p_name', 'plant_name', 'name');
      const currentDc = propNumber(props, 'p_cap_dc', 'cap_dc_mw', 'capacity_dc_mw');
      const currentAc = propNumber(props, 'p_cap_ac', 'cap_ac_mw', 'capacity_ac_mw');
      const latitude = propNumber(props, 'p_lat', 'latitude', 'lat');
      const tilt = propNumber(props, 'p_tilt', 'tilt');
      const azimuth = propNumber(props, 'p_azimuth', 'azimuth');
      const mount = detectMount(propString(props, 'p_axis', 'axis', 'mount_type'));
      setGeojson(parsed);
      setInput((prev) => ({
        ...prev,
        footprintAcres: areaAcres,
        siteName: siteName ?? prev.siteName,
        currentDcMW: currentDc ?? prev.currentDcMW,
        currentAcMW: currentAc ?? prev.currentAcMW,
        latitudeDeg: latitude ?? prev.latitudeDeg,
        tiltDeg: tilt ?? prev.tiltDeg,
        rowAzimuthDeg: azimuth ?? prev.rowAzimuthDeg,
        mountType: mount ?? prev.mountType,
      }));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  function parseText() {
    try {
      loadGeoJSON(JSON.parse(geojsonText) as GeoJSONInput);
    } catch (e) {
      setError(`Invalid GeoJSON: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  async function onFile(file: File | null) {
    if (!file) return;
    try {
      const text = await file.text();
      setGeojsonText(text);
      loadGeoJSON(JSON.parse(text) as GeoJSONInput);
    } catch (e) {
      setError(`Could not read GeoJSON: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <div>
      <div className={styles.presets}>
        {Object.keys(PRESETS).map((preset) => (
          <button key={preset} type="button" onClick={() => setInput((prev) => ({ ...prev, ...PRESETS[preset] }))}>{preset}</button>
        ))}
      </div>

      <div className={styles.grid2}>
        <section className={styles.card}>
          <h2>1. Existing site</h2>
          <div className={styles.formGrid}>
            <label>Site name<input value={input.siteName ?? ''} onChange={(e) => update('siteName', e.target.value)} /></label>
            <label>Array footprint (acres)<input type="number" value={input.footprintAcres} onChange={(e) => update('footprintAcres', n(e.target.value))} /></label>
            <label>Current capacity (MWdc)<input type="number" step="0.1" value={input.currentDcMW} onChange={(e) => update('currentDcMW', n(e.target.value))} /></label>
            <label>Current capacity (MWac)<input type="number" step="0.1" value={input.currentAcMW} onChange={(e) => update('currentAcMW', n(e.target.value))} /></label>
            <label>Latitude<input type="number" step="0.01" value={input.latitudeDeg} onChange={(e) => update('latitudeDeg', n(e.target.value))} /></label>
            <label>Mounting<select value={input.mountType} onChange={(e) => update('mountType', e.target.value as CalculatorInput['mountType'])}><option value="fixed">Fixed tilt</option><option value="tracker">Single-axis tracker</option></select></label>
          </div>
        </section>

        <section className={styles.card}>
          <h2>2. Modern module</h2>
          <div className={styles.formGrid}>
            <label>Module power (W)<input type="number" value={input.modulePowerW} onChange={(e) => update('modulePowerW', n(e.target.value))} /></label>
            <label>Module length (m)<input type="number" step="0.001" value={input.moduleLengthM} onChange={(e) => update('moduleLengthM', n(e.target.value))} /></label>
            <label>Module width (m)<input type="number" step="0.001" value={input.moduleWidthM} onChange={(e) => update('moduleWidthM', n(e.target.value))} /></label>
            <label>Target DC/AC ratio<input type="number" step="0.01" value={input.dcAcRatio} onChange={(e) => update('dcAcRatio', n(e.target.value))} /></label>
            {capacityMethod === 'area' && <label>Usable footprint (%)<input type="number" step="0.1" value={input.usablePct} onChange={(e) => update('usablePct', n(e.target.value))} /></label>}
          </div>
        </section>
      </div>

      <section className={styles.card}>
        <h2>3. Layout method</h2>
        <div className={styles.formGrid}>
          <label>Capacity method<select value={capacityMethod} onChange={(e) => setCapacityMethod(e.target.value as CapacityMethod)}><option value="polygon">Pack rows into actual GeoJSON polygon</option><option value="area">Area × effective GCR</option></select></label>
          <label>Density method<select value={input.gcrMode} onChange={(e) => update('gcrMode', e.target.value as CalculatorInput['gcrMode'])}><option value="geometry">Derive from row geometry</option><option value="direct">Enter effective GCR directly</option></select></label>
          {input.gcrMode === 'direct' && <label>Effective GCR (%)<input type="number" step="0.1" value={input.gcrPct} onChange={(e) => update('gcrPct', n(e.target.value))} /></label>}
          <label>Module orientation<select value={input.orientation} onChange={(e) => update('orientation', e.target.value as CalculatorInput['orientation'])}><option value="portrait">Portrait</option><option value="landscape">Landscape</option></select></label>
          <label>Modules across row/table<input type="number" value={input.modulesAcross} onChange={(e) => update('modulesAcross', n(e.target.value))} /></label>
          <label>Cross-row module gap (m)<input type="number" step="0.001" value={input.gapCrossM} onChange={(e) => update('gapCrossM', n(e.target.value))} /></label>
          <label>Along-row module gap (m)<input type="number" step="0.001" value={input.gapAlongM} onChange={(e) => update('gapAlongM', n(e.target.value))} /></label>
          <label>Row direction azimuth (°)<input type="number" step="0.1" value={input.rowAzimuthDeg} onChange={(e) => update('rowAzimuthDeg', n(e.target.value))} /></label>
          {input.mountType === 'fixed' && <label>Tilt (°)<input type="number" step="0.1" value={input.tiltDeg} onChange={(e) => update('tiltDeg', n(e.target.value))} /></label>}
          {input.mountType === 'fixed' && <label>Surface azimuth (°)<input type="number" value={input.surfaceAzimuthDeg} onChange={(e) => update('surfaceAzimuthDeg', n(e.target.value))} /></label>}
          {input.gcrMode === 'geometry' && input.mountType === 'fixed' && <label>Spacing rule<select value={input.spacingMode} onChange={(e) => update('spacingMode', e.target.value as CalculatorInput['spacingMode'])}><option value="shade-free">No inter-row shade at design time</option><option value="manual">Manual row pitch</option></select></label>}
          {input.gcrMode === 'geometry' && input.mountType === 'fixed' && input.spacingMode === 'shade-free' && <label>Design solar time<input type="number" step="0.25" value={input.designSolarTime} onChange={(e) => update('designSolarTime', n(e.target.value))} /></label>}
          {input.gcrMode === 'geometry' && input.mountType === 'fixed' && input.spacingMode === 'shade-free' && <label>Minimum edge gap (m)<input type="number" step="0.1" value={input.minEdgeGapM} onChange={(e) => update('minEdgeGapM', n(e.target.value))} /></label>}
          {(input.mountType === 'tracker' || input.spacingMode === 'manual') && input.gcrMode === 'geometry' && <label>Row pitch (m)<input type="number" step="0.01" value={input.rowPitchM} onChange={(e) => update('rowPitchM', n(e.target.value))} /></label>}
        </div>
        {input.mountType === 'fixed' && <button type="button" className={styles.linkButton} onClick={() => update('tiltDeg', Math.min(input.latitudeDeg, 40))}>Set tilt = min(latitude, 40°)</button>}
      </section>

      {capacityMethod === 'polygon' && (
        <section className={styles.card}>
          <div className={styles.polygonGrid}>
            <div>
              <p className={styles.eyebrow}>Polygon packing</p>
              <h2>4. Actual array footprint</h2>
              <p className={styles.muted}>Load one WGS84 Polygon/MultiPolygon. USPVDB-style properties are detected when present.</p>
              <div className={styles.formGrid}>
                <label>Boundary clearance (m)<input type="number" step="0.1" value={boundaryClearanceM} onChange={(e) => setBoundaryClearanceM(n(e.target.value))} /></label>
                <label>Row-phase trials<input type="number" value={phaseSteps} onChange={(e) => setPhaseSteps(n(e.target.value))} /></label>
              </div>
              <label className={styles.fileLabel}>GeoJSON file<input type="file" accept=".geojson,.json,application/geo+json,application/json" onChange={(e) => void onFile(e.target.files?.[0] ?? null)} /></label>
              <label>Or paste GeoJSON<textarea rows={7} value={geojsonText} onChange={(e) => setGeojsonText(e.target.value)} placeholder='{"type":"Feature","geometry":{"type":"Polygon","coordinates":[...]}}' /></label>
              <div className={styles.buttonRow}>
                <button type="button" onClick={parseText}>Load polygon</button>
                <button type="button" onClick={() => { const demo = demoRectangleGeoJSON(); setGeojsonText(JSON.stringify(demo, null, 2)); loadGeoJSON(demo); }}>Load demo</button>
                <button type="button" onClick={() => { setGeojson(null); setGeojsonText(''); setError(null); }}>Clear</button>
              </div>
              {error && <div className={styles.error}>{error}</div>}
              <div className={styles.status}>{packResult ? `${fmt(packResult.areaAcres)} acres · ${packResult.totalRows.toLocaleString()} packed rows · ${packResult.totalModules.toLocaleString()} modules` : 'No valid polygon loaded.'}</div>
            </div>
            <div className={styles.previewCard}><Preview pack={packResult} /></div>
          </div>
        </section>
      )}

      <section className={styles.results} aria-live="polite">
        <div className={styles.resultsHeader}>
          <div><p className={styles.eyebrow}>Modeled site</p><h2>{input.siteName}</h2></div>
          <span className={styles.chip}>{capacityMethod === 'polygon' && packResult ? 'Polygon packing' : 'Area / GCR'}</span>
        </div>
        <div className={styles.metricGrid}>
          <div><span>Current</span><strong>{fmt(input.currentDcMW)} MWdc</strong></div>
          <div><span>Modeled same-footprint</span><strong>{fmt(modeledDc)} MWdc</strong></div>
          <div className={headroom >= 0 ? styles.positiveMetric : styles.negativeMetric}><span>Technical headroom</span><strong>{headroom >= 0 ? '+' : ''}{fmt(headroom)} MWdc</strong><small>{headroom >= 0 ? '+' : ''}{fmt(headroomPct)}%</small></div>
          <div><span>Equivalent inverter capacity</span><strong>{fmt(modeledAc)} MWac</strong><small>at {input.dcAcRatio.toFixed(2)} DC/AC</small></div>
        </div>
        <div className={styles.detailGrid}>
          <div><span>Footprint</span><strong>{fmt(footprintAcres)} acres</strong></div>
          <div><span>Effective GCR</span><strong>{fmt(effectiveGcrPct)}%</strong></div>
          <div><span>Modeled density</span><strong>{fmt(density, 3)} MWdc/acre</strong></div>
          <div><span>Current density</span><strong>{fmt(input.currentDcMW / footprintAcres, 3)} MWdc/acre</strong></div>
          {packResult && <><div><span>Complete modules</span><strong>{packResult.totalModules.toLocaleString()}</strong></div><div><span>Best phase offset</span><strong>{fmt(packResult.phaseOffsetM, 2)} m</strong></div></>}
        </div>
        <p className={styles.disclaimer}>This is modeled technical same-footprint DC nameplate. It is not a claim of exportable, economic, permitted, financeable or interconnection-feasible capacity.</p>
      </section>

      <section className={styles.card}>
        <h2>GCR sensitivity</h2>
        <div className={styles.tableWrap}>
          <table><thead><tr><th>GCR</th><th>MWdc/acre</th><th>Modeled MWdc</th><th>Headroom MWdc</th><th>Headroom %</th></tr></thead><tbody>{sensitivityRows.map((row) => <tr key={row.gcr.toFixed(4)}><td>{fmt(row.gcrPct)}%</td><td>{fmt(row.densityMWdcPerAcre, 3)}</td><td>{fmt(row.modeledDcMW)}</td><td>{row.dcHeadroomMW >= 0 ? '+' : ''}{fmt(row.dcHeadroomMW)}</td><td>{row.dcHeadroomPct >= 0 ? '+' : ''}{fmt(row.dcHeadroomPct)}%</td></tr>)}</tbody></table>
        </div>
      </section>
    </div>
  );
}
