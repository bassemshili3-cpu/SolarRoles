import * as cheerio from 'cheerio';
import { extractStateFromLocation } from '@/lib/parseLocation';
import { isSolarInstallerRole } from './solar-taxonomy';
import type { NormalizedJob } from './types';

const BASE_URL = 'https://workforcenow.adp.com/mascsr/default/careercenter/public/events/staffing/v1/job-requisitions';
const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';

export type AdpCompanySeed = {
  cid: string;
  name: string;
  verified: boolean;
};

type AdpField = {
  stringValue?: string;
  shortName?: string;
  nameCode?: { codeValue?: string };
};

type AdpJob = {
  itemID?: string;
  requisitionTitle?: string;
  requisitionDescription?: string;
  postDate?: string;
  clientRequisitionID?: string;
  workLevelCode?: { shortName?: string };
  payGradeRange?: {
    minimumRate?: { amountValue?: number; currencyCode?: string };
    maximumRate?: { amountValue?: number; currencyCode?: string };
  };
  customFieldGroup?: { stringFields?: AdpField[]; codeFields?: AdpField[] };
  requisitionLocations?: Array<{
    address?: { cityName?: string; countrySubdivisionLevel1?: { codeValue?: string }; postalCode?: string };
    nameCode?: { shortName?: string };
  }>;
};

type AdpListResponse = {
  jobRequisitions?: AdpJob[];
  meta?: { totalNumber?: number };
};

function textFromHtml(html: string): string {
  return cheerio.load(html).text().replace(/\s+/g, ' ').trim();
}

function validDate(raw: string | undefined): Date | undefined {
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function customValue(job: AdpJob, key: string): string | undefined {
  return job.customFieldGroup?.stringFields?.find((field) => field.nameCode?.codeValue === key)?.stringValue;
}

function locationFor(job: AdpJob): string {
  const location = job.requisitionLocations?.[0];
  if (location?.nameCode?.shortName) return location.nameCode.shortName.trim();
  return [location?.address?.cityName, location?.address?.countrySubdivisionLevel1?.codeValue, location?.address?.postalCode]
    .filter(Boolean)
    .join(', ');
}

function salaryPeriod(job: AdpJob): string | undefined {
  const value = job.customFieldGroup?.codeFields?.find((field) => field.nameCode?.codeValue === 'SalaryType')?.shortName;
  if (/hour/i.test(value ?? '')) return 'HOUR';
  if (/annual|year/i.test(value ?? '')) return 'YEAR';
  return undefined;
}

async function requestJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, { headers: { Accept: 'application/json', 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export async function fetchAdpJobs(company: AdpCompanySeed): Promise<NormalizedJob[]> {
  if (!company.verified) return [];

  try {
    const summaries: AdpJob[] = [];
    let skip = 1;
    let total = Infinity;

    while (summaries.length < total) {
      const url = new URL(BASE_URL);
      url.searchParams.set('cid', company.cid);
      url.searchParams.set('$skip', String(skip));
      url.searchParams.set('$top', '20');
      const page = await requestJson<AdpListResponse>(url);
      const jobs = page.jobRequisitions ?? [];
      total = page.meta?.totalNumber ?? summaries.length + jobs.length;
      summaries.push(...jobs);
      if (!jobs.length) break;
      skip += jobs.length;
    }

    console.log(`[adp] ${company.name}: ${summaries.length} postes bruts découverts`);
    const results: NormalizedJob[] = [];

    for (const summary of summaries) {
      if (!summary.itemID || !summary.requisitionTitle) continue;
      const detailUrl = new URL(`${BASE_URL}/${encodeURIComponent(summary.itemID)}`);
      detailUrl.searchParams.set('cid', company.cid);
      const detail = await requestJson<AdpJob>(detailUrl);
      const description = textFromHtml(detail.requisitionDescription ?? '');
      if (!isSolarInstallerRole(detail.requisitionTitle ?? summary.requisitionTitle, description)) continue;

      const externalId = customValue(detail, 'ExternalJobID') ?? detail.clientRequisitionID ?? detail.itemID!;
      const publicUrl = new URL('https://workforcenow.adp.com/mascsr/default/mdf/recruitment/recruitment.html');
      publicUrl.searchParams.set('cid', company.cid);
      publicUrl.searchParams.set('jobId', externalId);
      const location = locationFor(detail);
      const minimum = detail.payGradeRange?.minimumRate?.amountValue;
      const maximum = detail.payGradeRange?.maximumRate?.amountValue;
      const currency = detail.payGradeRange?.minimumRate?.currencyCode ?? detail.payGradeRange?.maximumRate?.currencyCode;
      const period = salaryPeriod(detail);

      results.push({
        source: 'adp',
        externalId,
        title: detail.requisitionTitle ?? summary.requisitionTitle,
        company: company.name,
        location,
        addressRegion: extractStateFromLocation(location),
        description,
        url: publicUrl.toString(),
        applyUrl: publicUrl.toString(),
        contractType: detail.workLevelCode?.shortName,
        postedAt: validDate(detail.postDate),
        salary: minimum !== undefined || maximum !== undefined
          ? `${minimum ?? maximum}${minimum !== undefined && maximum !== undefined && minimum !== maximum ? `–${maximum}` : ''}${currency ? ` ${currency}` : ''}${period ? `/${period.toLowerCase()}` : ''}`
          : undefined,
        salaryMin: minimum,
        salaryMax: maximum,
        salaryPeriod: period,
      });
    }

    return results;
  } catch (error) {
    console.warn(`[adp] ${company.name}: fetch échoué — ${error instanceof Error ? error.message : String(error)}`);
    return [];
  }
}
