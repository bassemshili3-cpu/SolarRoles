// scripts/debug-jobvite.ts
// Usage: npx tsx scripts/debug-jobvite.ts freedomforever
import { chromium } from 'playwright';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: npx tsx scripts/debug-jobvite.ts <slug>');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch({ headless: false }); // headless:false pour VOIR ce qui charge
  const page = await browser.newPage();
  await page.goto(`https://jobs.jobvite.com/${slug}/jobs`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  console.log('--- title tags trouvés ---');
  const anchors = await page.$$eval('a[href*="/job/"]', (els) =>
    els.map((el) => ({ text: el.textContent?.trim(), href: (el as HTMLAnchorElement).href })),
  );
  console.log(anchors);

  console.log(`\n${anchors.length} lien(s) /job/ trouvé(s).`);
  await page.pause(); // ouvre l'inspecteur Playwright pour explorer le DOM à la main
  await browser.close();
})();