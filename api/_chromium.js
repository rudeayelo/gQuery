import chrome from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

const USER_AGENT =
  "Mozilla/5.0 (Windows; U; Windows NT 5.1; en-GB; rv:1.8.1.6) Gecko/20070725 Firefox/2.0.0.6";

export async function getHTML({ url, isDev }) {
  const options = await getOptions(isDev);
  const browser = await puppeteer.launch(options);

  const page = await browser.newPage();
  await page.setUserAgent(USER_AGENT);

  await page.goto(url);

  const html = await page.evaluate(() => document.documentElement.innerHTML);

  await page.close();
  await browser.close();

  return html;
}

async function getOptions(isDev) {
  if (isDev) {
    return {
      args: [],
      executablePath: getLocalExePath(),
      headless: true,
    };
  }

  return {
    // large height needed for lazy-loaded resources
    defaultViewport: { width: 960, height: 10000 },
    args: chrome.args,
    executablePath: await chrome.executablePath,
    headless: isDev ? false : chrome.headless,
  };
}

function getLocalExePath() {
  switch (process.platform) {
    case "win32":
      return "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
    case "linux":
      return "/usr/bin/google-chrome";
    default:
      return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  }
}
