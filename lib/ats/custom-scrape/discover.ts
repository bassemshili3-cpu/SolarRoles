import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import type { CustomScrapeSelectors } from './types';

export type DiscoveredJobLink = { url: string; titleCandidate: string };

const ignoredAncestor = 'nav, footer, [role="navigation"], [aria-label*="breadcrumb" i], .breadcrumb';

function clean(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function getCandidate($: cheerio.CheerioAPI, element: Element, baseUrl: string, selectors?: CustomScrapeSelectors): DiscoveredJobLink | undefined {
  const $element = $(element);
  const $link = selectors?.link ? $element.find(selectors.link).first() : $element.find('a[href]').first();
  const href = $link.attr('href');
  if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(href)) return undefined;
  try {
    const url = new URL(href, baseUrl).href;
    const title = clean((selectors?.title ? $element.find(selectors.title).first().text() : $element.find('h1,h2,h3,h4,h5,h6').first().text()) || $link.text());
    return title ? { url, titleCandidate: title } : undefined;
  } catch {
    return undefined;
  }
}

export function discoverJobLinks(html: string, baseUrl: string, selectors?: CustomScrapeSelectors): DiscoveredJobLink[] {
  const $ = cheerio.load(html);
  const candidates: DiscoveredJobLink[] = [];
  if (selectors?.listItem) {
    $(selectors.listItem).each((_, element) => {
      if (!$(element).closest(ignoredAncestor).length) {
        const candidate = getCandidate($, element as Element, baseUrl, selectors);
        if (candidate) candidates.push(candidate);
      }
    });
  } else {
    const groups = new Map<string, Element[]>();
    $('body *').each((_, element) => {
      const classList = (element.attribs.class || '').split(/\s+/).filter(Boolean).sort().join('.');
      const signature = `${element.tagName}.${classList}`;
      const list = groups.get(signature) ?? [];
      list.push(element);
      groups.set(signature, list);
    });
    for (const elements of groups.values()) {
      if (elements.length < 3) continue;
      for (const element of elements) {
        const $element = $(element);
        if ($element.closest(ignoredAncestor).length || clean($element.text()).split(/\s+/).length < 2) continue;
        const candidate = getCandidate($, element, baseUrl);
        if (candidate) candidates.push(candidate);
      }
    }
  }
  return [...new Map(candidates.map((job) => [job.url, job])).values()];
}

/** Finds a conventional next-page link; load-more buttons are handled by Playwright. */
export function discoverNextPageUrl(html: string, baseUrl: string, selectors?: CustomScrapeSelectors): string | undefined {
  const $ = cheerio.load(html);
  const $next = selectors?.nextPage
    ? $(selectors.nextPage).first()
    : $('a[rel="next"], .pagination a.next, .pagination [aria-label*="next" i], a[aria-label*="next page" i]').first();
  const href = $next.attr('href');
  if (!href) return undefined;
  try {
    const next = new URL(href, baseUrl);
    return next.href === new URL(baseUrl).href ? undefined : next.href;
  } catch {
    return undefined;
  }
}
