import fs from 'node:fs'
import assert from 'node:assert/strict'
import XLSX from 'xlsx'

const dir = 'data/solar-installer-rent'
const read = name => JSON.parse(fs.readFileSync(`${dir}/${name}`, 'utf8'))
const wages = read('bls-extract.json')
const geography = read('bls-areas.json')
const rents = read('hud-matched-rents.json')
const pdf = 'https://www.huduser.gov/portal/datasets/fmr/fmr2026/FY2026_FMR_Schedule.pdf'
const revision = 'https://www.federalregister.gov/documents/2026/04/21/2026-07741/fair-market-rents-for-the-housing-choice-voucher-program-moderate-rehabilitation-single-room'
const solar = wages.filter(r => r.OCC_CODE === '47-2231' && r.PRIM_STATE !== 'PR')
assert.equal(new Set(rents.map(r => r.area)).size, rents.length)
const rows = rents.map(rent => {
  const wage = solar.find(r => r.AREA === rent.area)
  assert.ok(wage, `Missing wage: ${rent.area}`)
  const counties = geography.filter(r => r['May 2025 Area Code'] === rent.area)
  assert.deepEqual(counties.map(r => r['County Name'].replace(/ County$/, '')).sort(), [...rent.counties].sort(), `Geography mismatch: ${rent.area}`)
  assert.ok(Number.isFinite(wage.H_MEDIAN) && wage.H_MEDIAN > 0)
  assert.ok(Number.isFinite(wage.A_MEDIAN) && wage.A_MEDIAN > 0)
  const comparison = code => {
    const other = wages.find(r => r.AREA === rent.area && r.OCC_CODE === code)
    return typeof other?.H_MEDIAN === 'number' ? other.H_MEDIAN : null
  }
  return {
    area: rent.area, metro: wage.AREA_TITLE, state: wage.PRIM_STATE,
    hourlyWage: wage.H_MEDIAN, annualWage: wage.A_MEDIAN,
    employment: typeof wage.TOT_EMP === 'number' ? wage.TOT_EMP : null,
    monthlyRent: rent.rent, rentHours: rent.rent / wage.H_MEDIAN,
    rentShare: rent.rent * 12 / wage.A_MEDIAN * 100,
    electricianHourlyWage: comparison('47-2111'), rooferHourlyWage: comparison('47-2181'),
    countyFips: counties.map(r => r['FIPS Code'] + r['County Code']),
    hudPages: rent.pages, hudSource: rent.revised ? revision : `${pdf}#page=${rent.pages[0]}`,
    revised: rent.revised ?? false,
  }
}).sort((a, b) => a.rentHours - b.rentHours || a.metro.localeCompare(b.metro))
const excluded = solar.filter(r => !rents.some(x => x.area === r.AREA)).map(r => ({area: r.AREA, metro: r.AREA_TITLE, reason: 'BLS metro does not match a single HUD FMR area; excluded rather than assigning a partial-area rent.'}))
const report = {date: '2026-09-05', wagePeriod: 'May 2025', rentPeriod: 'FY 2026', screenedMetros: solar.length, rows, excluded}
fs.mkdirSync('public/data', {recursive: true})
fs.writeFileSync(`${dir}/report.json`, JSON.stringify(report, null, 2) + '\n')
const csv = rows.map((r, i) => ({rank: i + 1, metro_code: r.area, metro: r.metro, median_hourly_wage_usd: r.hourlyWage, median_annual_wage_usd: r.annualWage, one_bedroom_monthly_fmr_usd: r.monthlyRent, gross_work_hours_for_rent: r.rentHours.toFixed(4), rent_pct_annual_gross_wage: r.rentShare.toFixed(4), electrician_median_hourly_wage_usd: r.electricianHourlyWage, roofer_median_hourly_wage_usd: r.rooferHourlyWage, county_fips: r.countyFips.join('|'), wage_period: report.wagePeriod, rent_period: report.rentPeriod, hud_source: r.hudSource}))
fs.writeFileSync('public/data/solar-installer-rent-2026.csv', XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(csv)))
fs.writeFileSync('public/data/solar-installer-rent-2026-exclusions.csv', XLSX.utils.sheet_to_csv(XLSX.utils.json_to_sheet(excluded)))
console.log(JSON.stringify({included:rows.length,excluded:excluded.length,over30:rows.filter(r=>r.rentShare>30).length,lowest:rows[0],highest:rows.at(-1)},null,2))
