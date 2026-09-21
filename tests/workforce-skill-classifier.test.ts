import assert from 'node:assert/strict'
import {
  matchesBessJobContext,
  matchesElectricalJourneyman,
  matchesProjectManagementTitle,
  matchesSolarTechnicianTitle,
  ROLE_DEFINITIONS,
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

assert.equal(
  matchesSolarTechnicianTitle('Utility Solar Technician II'),
  true,
  'a solar technician title should match the O&M family'
)

assert.equal(
  matchesProjectManagementTitle('Utility Solar Technician II'),
  false,
  'an O&M title should not inherit the project-management matcher'
)

assert.equal(
  matchesProjectManagementTitle('Assistant Construction Project Manager'),
  true,
  'a project manager title should match the project-management family'
)

assert.equal(
  matchesSolarTechnicianTitle('Assistant Construction Project Manager'),
  false,
  'a project manager title should not inherit the O&M matcher'
)

const bessTechnicianDefinition = ROLE_DEFINITIONS.find(
  (role) => role.key === 'bess-technician'
)

assert.ok(bessTechnicianDefinition, 'the BESS technician role should be defined')

const workforceJob = (title: string, specialty: string | null = null) => ({
  id: title,
  title,
  company: null,
  description: null,
  addressRegion: null,
  location: null,
  salaryMin: null,
  salaryMax: null,
  salaryPeriod: null,
  experienceLevel: null,
  specialty,
  postedAt: null,
  fetchedAt: new Date(0),
  source: null,
  url: null,
  applyUrl: null,
  canonicalSlug: null,
})

assert.equal(
  bessTechnicianDefinition.test(workforceJob('Advanced BESS Technician')),
  true,
  'a BESS technician title should match the technician family'
)

assert.equal(
  bessTechnicianDefinition.test(
    workforceJob('BESS Project Manager', 'Battery Storage')
  ),
  false,
  'BESS management titles should not be mixed into technician pay'
)

assert.equal(
  bessTechnicianDefinition.test(
    workforceJob('Retail Solar Sales Representative', 'Battery Storage')
  ),
  false,
  'a broad storage specialty should not pull sales jobs into technician pay'
)

console.log('workforce skill classifier tests passed')
