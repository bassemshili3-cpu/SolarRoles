import assert from 'node:assert/strict'
import { requiresSolarStorageProfile } from '../lib/solarMarketMetrics'

const posting = (
  title: string,
  description: string
) => ({ title, description })

assert.equal(
  requiresSolarStorageProfile(
    posting('Solar & BESS Technician II', 'Maintain assigned generation assets.')
  ),
  true,
  'a title explicitly combining solar and BESS should match'
)

assert.equal(
  requiresSolarStorageProfile(
    posting(
      'Solar Project Engineer',
      'Responsibilities: Design solar PV arrays and battery energy storage systems for utility projects.'
    )
  ),
  true,
  'role responsibilities that combine PV and storage should match'
)

assert.equal(
  requiresSolarStorageProfile(
    posting(
      'Solar Technician',
      'Our company develops solar and battery storage projects nationwide. Responsibilities: Inspect and maintain PV modules and inverters.'
    )
  ),
  false,
  'company boilerplate before the role section should not create a match'
)

assert.equal(
  requiresSolarStorageProfile(
    posting(
      'Solar Sales Consultant',
      'Responsibilities: Explain photovoltaic production and battery energy storage options to homeowners.'
    )
  ),
  true,
  'a customer-facing role that explicitly covers solar and storage should match'
)

assert.equal(
  requiresSolarStorageProfile(
    posting(
      'BESS Field Technician',
      'Responsibilities: Commission battery energy storage systems and troubleshoot PCS equipment.'
    )
  ),
  false,
  'a storage-only profile should not be labeled solar plus storage'
)

console.log('solar + storage profile tests passed')
