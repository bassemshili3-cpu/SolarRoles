export type CompensationType = 'FIXED' | 'COMMISSION_ONLY' | 'BASE_COMMISSION'
export function parseCompensation(body: { compensationType?: unknown; commissionDetails?: unknown; salaryMin?: unknown; salaryMax?: unknown; salaryPeriod?: unknown }) {
 const type = body.compensationType ?? 'FIXED'
 if (!['FIXED', 'COMMISSION_ONLY', 'BASE_COMMISSION'].includes(String(type))) throw new Error('Choose a valid compensation type.')
 const details = typeof body.commissionDetails === 'string' ? body.commissionDetails.trim() : ''
 if (type !== 'FIXED' && (!details || details.length > 2000)) throw new Error('Describe the commission terms (up to 2,000 characters).')
 if (type === 'COMMISSION_ONLY') return { compensationType: type as CompensationType, commissionDetails: details, salaryMin: null, salaryMax: null, salaryPeriod: null, salary: 'Commission only' }
 const min = body.salaryMin, max = body.salaryMax
 if (typeof min !== 'number' || typeof max !== 'number' || !Number.isFinite(min) || !Number.isFinite(max) || min <= 0 || min > max || !['year','hour'].includes(String(body.salaryPeriod))) throw new Error('Enter a positive base salary range and a valid pay period.')
 const factor = body.salaryPeriod === 'hour' ? 2080 : 1
 if (Math.round(min * factor) < 1) throw new Error('Base salary must be at least one dollar in annualized value.')
 if (max * factor > 2147483647) throw new Error('Salary is too large.')
 return { compensationType: type as CompensationType, commissionDetails: type === 'FIXED' ? null : details, salaryMin: Math.round(min * factor), salaryMax: Math.round(max * factor), salaryPeriod: body.salaryPeriod as string,
 salary: '$' + min.toLocaleString('en-US') + ' - $' + max.toLocaleString('en-US') + (factor === 1 ? ' a year' : ' an hour') + (type === 'BASE_COMMISSION' ? ' + commission' : '') }
}
