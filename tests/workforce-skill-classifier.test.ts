import assert from 'node:assert/strict'
import {
  matchesBessJobContext,
  matchesElectricalJourneyman,
} from '../app/workforce-resources/_lib/workforceData'

assert.equal(
  matchesBessJobContext('BESS Field Service Technician', ''),
  true,
  'BESS in the job title should match'
)

assert.equal(
  matchesBessJobContext(
    'Utility Solar Technician I',
    'NovaSource supports solar PV and BESS assets nationwide. Job Description: Maintain the solar PV plant.'
  ),
  false,
  'a single company-profile BESS mention before the role section should not match'
)

assert.equal(
  matchesBessJobContext(
    'Field Technician',
    'Position Overview: This technician commissions BESS equipment at project sites.'
  ),
  true,
  'a BESS mention inside a role section should match'
)

assert.equal(
  matchesBessJobContext(
    'Field Technician',
    'Support BESS projects and troubleshoot BESS equipment.'
  ),
  true,
  'two BESS mentions should match without a section marker'
)

assert.equal(
  matchesElectricalJourneyman(
    'Master Electrician',
    `${'General recruiting copy. '.repeat(12)}Keywords: Journeyman, foreman, construction management.`
  ),
  false,
  'a recruiter keyword-block mention should not match without local electrical context'
)

assert.equal(
  matchesElectricalJourneyman(
    'General Foreman, SDI Services',
    'Five years of experience as a journeyman carpenter are required.'
  ),
  false,
  'a non-electrical journeyman trade should not match'
)

assert.equal(
  matchesElectricalJourneyman(
    'Solar Electrician',
    'A current journeyman electrician license is required.'
  ),
  true,
  'an explicit journeyman electrician phrase should match'
)

assert.equal(
  matchesElectricalJourneyman(
    'Field Service Technician',
    'Electrical troubleshooting experience at the journeyman level for PV systems is preferred.'
  ),
  true,
  'a technician title with local electrical and PV context should match'
)

console.log('workforce skill classifier tests passed')
