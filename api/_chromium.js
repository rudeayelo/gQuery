import chrome from "chrome-aws-lambda"
import puppeteer from "puppeteer-core"

let _page = null

export async function getHTML({ url, isDev }) {
    const page = await getPage(isDev)
    await page.goto(url)
    const html = await page.evaluate(() => document.documentElement.innerHTML)

    return html
}

async function getPage(isDev) {
    if (_page) {
        return _page
    }

    const options = await getOptions(isDev)
    const browser = await puppeteer.launch(options)

    _page = await browser.newPage()

    return _page
}

async function getOptions(isDev) {
    if (isDev) {
        return {
            args: [],
            executablePath: getLocalExePath(),
            headless: true,
        }
    }

    return {
        args: chrome.args,
        executablePath: await chrome.executablePath,
        headless: chrome.headless,
    }
}

function getLocalExePath() {
    switch (process.platform) {
        case "win32":
            return "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
        case "linux":
            return "/usr/bin/google-chrome"
        default:
            return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    }
}
