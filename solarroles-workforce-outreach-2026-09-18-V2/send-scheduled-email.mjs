import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

function arg(name) {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const campaignPath = path.resolve(arg('--campaign') || path.join(process.cwd(), 'campaign.json'));
const index = Number(arg('--index'));
if (!Number.isInteger(index) || index < 0) {
  console.error('Usage: node send-scheduled-email.mjs --campaign campaign.json --index N');
  process.exit(2);
}

const campaign = JSON.parse(fs.readFileSync(campaignPath, 'utf8'));
const m = campaign.messages[index];
if (!m) {
  console.error(`No message at index ${index}`);
  process.exit(3);
}

if (!m.resourceUrl || !m.resourceLabel || m.resourceUrl === campaign.hubUrl) {
  console.error(`Refusing to render V2 message ${index + 1}: a direct personalized resource URL is required.`);
  process.exit(4);
}

const catalogItem = (campaign.resourceCatalog || {})[m.resource] || {};
const resourceDescription = catalogItem.description || 'a free solar workforce resource built from current job-posting data';

const body = `Hi ${m.greeting},\n\nI'm Bassem, founder of Solar Roles, a US-focused solar jobs platform. I came across ${m.organization} while looking at organizations helping people prepare for or navigate clean-energy careers.\n\n${m.fact}\n\nThe Solar Roles resource I thought was the closest fit for your work is our ${m.resourceLabel}:\n${m.resourceUrl}\n\nIt covers ${resourceDescription}.\n\n${m.fit}\n\nEverything is public and free to use. If it looks useful, you're welcome to share or link to this specific resource.\n\n${campaign.footer}`;

process.stdout.write(JSON.stringify({
  campaign: campaign.campaign,
  index,
  humanNumber: index + 1,
  originalHumanNumber: m.originalHumanNumber,
  organization: m.organization,
  to: m.to,
  from: campaign.from,
  subject: m.subject,
  resource: m.resource,
  resourceLabel: m.resourceLabel,
  resourceUrl: m.resourceUrl,
  body,
  scheduledAt: m.scheduledAt
}));
