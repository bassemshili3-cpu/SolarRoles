import assert from 'node:assert/strict';
import {
  getSolarRoleFamily,
  isSolarInstallerRole,
  normalizeSolarRoleText,
} from '../lib/ats/solar-taxonomy';

const directMatches = [
  'EPC Solar - Project Engineer',
  'Estimator (Solar)',
  'Renewable Energy Technician (SOLAR)',
  'Solar Electrical Technician',
  'Senior Applications Engineer – Solar PV & Battery Storage',
];

for (const title of directMatches) {
  assert.equal(isSolarInstallerRole(title), true, `expected direct match: ${title}`);
}

const solarProjectDescription =
  'The team designs utility-scale solar PV and battery energy storage projects across the United States.';
const corporateMatches = [
  'Design Engineer I',
  'Project Engineer',
  'Applications Engineer',
  'Electrical Engineer',
  'Mechanical Engineer',
  'Program Manager',
  'Project Developer',
  'Development Manager',
  'Asset Manager',
  'O&M Manager',
  'SCADA Engineer',
  'Performance Engineer',
  'Interconnection Manager',
];

for (const title of corporateMatches) {
  assert.equal(
    isSolarInstallerRole(title, solarProjectDescription),
    true,
    `expected description-confirmed corporate match: ${title}`,
  );
}

assert.equal(
  isSolarInstallerRole('O&M Manager', 'Responsible for maintaining utility and commercial PV plants.'),
  true,
);

const manufacturingDescription =
  'Operate advanced production equipment used to manufacture high-efficiency PV modules and solar cells.';
const manufacturingMatches = [
  'Production Operator',
  'Production Technician',
  'Manufacturing Engineer',
  'Solar Manufacturing Technician',
  'Process Engineer',
  'Equipment Engineer',
  'Equipment Technician',
  'Quality Engineer',
  'Quality Technician',
  'Quality Inspector',
  'Test Engineer',
  'Test Technician',
  'Product Engineer',
  'Reliability Engineer',
  'Cell Technician',
  'Module Technician',
];

for (const title of manufacturingMatches) {
  assert.equal(
    isSolarInstallerRole(title, manufacturingDescription),
    true,
    `expected solar-manufacturing match: ${title}`,
  );
  assert.equal(getSolarRoleFamily(title, manufacturingDescription), 'manufacturing');
}

assert.equal(isSolarInstallerRole('BESS Accounting Manager'), false);
assert.equal(isSolarInstallerRole('BESS Accounting Manager', solarProjectDescription), false);
assert.equal(isSolarInstallerRole('Solar HR Manager'), false);
assert.equal(isSolarInstallerRole('Manufacturing Engineer'), false);
assert.equal(
  isSolarInstallerRole('Production Operator', 'We develop utility-scale solar projects.'),
  false,
);
assert.equal(isSolarInstallerRole('Software Engineer – Solar PV'), false);

assert.equal(
  normalizeSolarRoleText('Senior Applications Engineer – Solar PV & Battery Storage'),
  'senior applications engineer solar pv and battery storage',
);

console.log('solar taxonomy tests passed');
