import * as cheerio from 'cheerio';
import { extractStateFromLocation } from '@/lib/parseLocation';
import { isSolarInstallerRole } from './solar-taxonomy';
import type { NormalizedJob } from './types';

export interface UkgCompanySeed {
  baseUrl: string;
  name: string;
  verified: boolean;
}

interface UkgAddress {
  City?: string;
  State?: { Code?: string; Name?: string };
  Country?: { Code?: string; Name?: string };
}

interface UkgLocation {
  Address?: UkgAddress;
  LocalizedName?: string;
}

interface UkgOpportunity {
  Id: string;
  Title: string;
  RequisitionNumber?: string;
  FullTime?: boolean;
  Locations?: UkgLocation[];
  PostedDate?: string;
  BriefDescription?: string;
  Description?: string;
}

interface UkgSearchResponse {
  opportunities?: UkgOpportunity[];
  totalCount?: number;
}

const USER_AGENT = 'solarroles.com job aggregator (contact: hello@solarroles.com)';

function searchBody(skip: number) {
  return {
    opportunitySearch: {
      Top: 100,
      Skip: skip,
      QueryString: '',
      Filters: [4, 5, 6, 37].map((fieldName) => ({
        t: 'TermsSearchFilterDto',
        fieldName,
        extra: null,
        values: [],
      })),
    },
    matchCriteria: {
      PreferredJobs: [],
      Educations: [],
      LicenseAndCertifications: [],
      Skills: [],
      hasNoLicenses: false,
      SkippedSkills: [],
    },
  };
}

function stripHtml(html: string): string {
  return cheerio.load(html).text().replace(/\s+/g, ' ').trim();
}

export function parseUkgOpportunityDetail(html: string): UkgOpportunity | undefined {
  const match = html.match(/new US\.Opportunity\.CandidateOpportunityDetail\((\{[\s\S]*?\})\);/);
  if (!match) return undefined;
  try {
    return JSON.parse(match[1]) as UkgOpportunity;
  } catch {
    return undefined;
  }
}

function normalizedLocations(locations: UkgLocation[] | undefined) {
  const usLocations = (locations ?? []).filter((location) => {
    const country = location.Address?.Country;
    return country?.Code === 'USA' || country?.Name === 'United States';
  });
  const regions = [...new Set(usLocations.map((location) => location.Address?.State?.Code).filter((value): value is string => Boolean(value)))];
  const first = usLocations[0];
  const location = first
    ? [first.Address?.City || first.LocalizedName, first.Address?.State?.Code, 'United States'].filter(Boolean).join(', ')
    : '';
  return { location, regions };
}

function validDate(raw: string | undefined): Date | undefined {
  if (!raw) return undefined;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export async function fetchUkgJobs(company: UkgCompanySeed): Promise<NormalizedJob[]> {
  const baseUrl = company.baseUrl.replace(/\/$/, '');
  const opportunities: UkgOpportunity[] = [];

  try {
    for (let skip = 0; skip < 5_000; skip += 100) {
      const response = await fetch(`${baseUrl}/JobBoardView/LoadSearchResults`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          'User-Agent': USER_AGENT,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify(searchBody(skip)),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = (await response.json()) as UkgSearchResponse;
      const page = data.opportunities ?? [];
      opportunities.push(...page);
      if (page.length === 0 || opportunities.length >= (data.totalCount ?? 0)) break;
    }
  } catch (error) {
    console.warn(`[ukg] ${company.name}: liste inaccessible — ${(error as Error).message}`);
    return [];
  }

  const candidates = opportunities.filter((opportunity) =>
    isSolarInstallerRole(opportunity.Title, opportunity.BriefDescription),
  );
  console.log(`[ukg] ${company.name}: ${opportunities.length} postes bruts, ${candidates.length} candidats solaires`);
  const results: NormalizedJob[] = [];

  for (const candidate of candidates) {
    const url = `${baseUrl}/OpportunityDetail?opportunityId=${candidate.Id}`;
    try {
      const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const detail = parseUkgOpportunityDetail(await response.text()) ?? candidate;
      const description = stripHtml(detail.Description ?? candidate.BriefDescription ?? '');
      if (!isSolarInstallerRole(detail.Title, description)) continue;

      const { location, regions } = normalizedLocations(detail.Locations ?? candidate.Locations);
      results.push({
        source: 'ukg',
        externalId: detail.Id,
        title: detail.Title,
        company: company.name,
        location,
        addressRegion: extractStateFromLocation(location),
        locationRegions: regions,
        description,
        url,
        applyUrl: url,
        contractType: detail.FullTime === true ? 'Full-Time' : detail.FullTime === false ? 'Part-Time' : undefined,
        postedAt: validDate(candidate.PostedDate ?? detail.PostedDate),
      });
    } catch (error) {
      console.warn(`[ukg] ${company.name}: détail ignoré (${candidate.Id}) — ${(error as Error).message}`);
    }
  }

  return results;
}
