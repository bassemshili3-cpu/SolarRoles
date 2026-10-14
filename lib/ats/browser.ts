import { chromium, type LaunchOptions } from 'playwright';

/** Use the local Playwright browser on PCs and a Lambda binary on Netlify. */
export async function launchAtsBrowser(options: LaunchOptions = {}) {
  if (process.env.ATS_SERVERLESS_BROWSER !== 'true') return chromium.launch(options);
  const { default: serverlessChromium } = await import('@sparticuz/chromium');
  return chromium.launch({
    ...options,
    headless: true,
    args: [...serverlessChromium.args, ...(options.args ?? [])],
    executablePath: await serverlessChromium.executablePath(),
  });
}
