import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv: string[]) {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next !== undefined && !next.startsWith('--')) { out[key] = next; i += 1; }
    else out[key] = true;
  }
  return out;
}

async function getJson(url: string) {
  const response = await fetch(url, { headers: { 'User-Agent': 'SolarRoles-HiddenSolarGW/4.0' } });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  const body = await response.json();
  if (body.error) throw new Error(`ArcGIS error ${body.error.code ?? ''}: ${body.error.message ?? JSON.stringify(body.error)}`);
  return body;
}

function queryUrl(layerUrl: string, params: Record<string, string>) {
  return `${layerUrl.replace(/\/$/, '')}/query?${new URLSearchParams(params).toString()}`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = process.cwd();
  const outPath = path.resolve(String(args.out || path.join(root, 'data', 'repowering', 'uspvdb.geojson')));
  const where = String(args.where || '1=1');
  const chunkSize = Math.max(50, Math.min(1000, Math.round(Number(args['chunk-size']) || 400)));
  const layerUrl = String(args['layer-url'] || 'https://energy.usgs.gov/arcgis/rest/services/Hosted/uspvdbDyn/FeatureServer/0');

  const idPayload = await getJson(queryUrl(layerUrl, { where, returnIdsOnly: 'true', f: 'json' }));
  const objectIds = (idPayload.objectIds || []).slice().sort((a: number, b: number) => a - b);
  if (!objectIds.length) throw new Error('No USPVDB features matched the query.');

  const features: unknown[] = [];
  for (let start = 0; start < objectIds.length; start += chunkSize) {
    const ids = objectIds.slice(start, start + chunkSize);
    const fc = await getJson(queryUrl(layerUrl, {
      objectIds: ids.join(','), outFields: '*', returnGeometry: 'true', outSR: '4326', f: 'geojson',
    }));
    if (!fc || fc.type !== 'FeatureCollection' || !Array.isArray(fc.features)) throw new Error('Unexpected GeoJSON response.');
    features.push(...fc.features);
    console.log(`[${Math.min(start + chunkSize, objectIds.length)}/${objectIds.length}] downloaded=${features.length}`);
  }

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify({ type: 'FeatureCollection', name: 'USPVDB', source: layerUrl, downloaded_at: new Date().toISOString(), where, features })}\n`);
  console.log(`Wrote ${features.length} features to ${outPath}`);
}

main().catch((error) => { console.error(error); process.exit(1); });
