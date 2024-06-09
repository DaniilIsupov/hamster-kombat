import puppeteer, { KnownDevices } from 'puppeteer';

const Pixel5 = KnownDevices['Pixel 5'];

const browser = await puppeteer.launch({
    headless: false
});
const page = await browser.newPage();
await page.emulate(Pixel5);

/**
 * @example Object.entries(Telegram.WebView.initParams).map(([k, v]) => [k, encodeURIComponent(v)]).map((o) => o.join('=')).join('&');
 */
const hash =
    'tgWebAppData=&tgWebAppVersion=&tgWebAppPlatform=&tgWebAppThemeParams=';

await page.goto(`https://hamsterkombat.io/clicker/#${hash}`);
