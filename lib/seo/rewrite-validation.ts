import { load } from 'cheerio';

export function validateBoundedRewrite(html: string, maxCharacters = 3000): number {
  if (!html.trim() || html.length > maxCharacters) throw new Error(`Rewritten HTML has ${html.length} characters (maximum ${maxCharacters})`);
  const $ = load(html, null, false);
  const allowed = new Set(['p', 'h3', 'ul', 'li', 'strong', 'em', 'br']);
  if ($('*').toArray().some(el => !('tagName' in el) || !allowed.has(el.tagName) || Object.keys(el.attribs ?? {}).length)) {
    throw new Error('Unsupported HTML tags or attributes');
  }
  if (!$('p').length || !$('li').length) throw new Error('Missing introduction or factual bullet lists');
  const prose = $.text().replace(/\b(?:TMEIC|TMIEC) Ninja inverters\b/g, 'TMEIC inverters');
  if (/(?:more than (?:just )?a (?:job|role)|not just|isn.t just|rockstar|ninja|world.class)/i.test(prose)) throw new Error('Banned wording in output');
  for (const heading of $('h3').toArray()) {
    const label = $(heading).text().trim();
    if (!['Responsibilities', 'Requirements', 'Benefits'].includes(label)) throw new Error('Unexpected section heading');
    if (label !== 'Benefits' && $(heading).next().prop('tagName') !== 'UL') throw new Error(`${label} must use a bullet list`);
  }
  return html.length;
}
