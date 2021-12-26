const puppeteer = require('puppeteer');

const browser_options = {
	headless: true,
	args: [
		'--no-sandbox',
		'--disable-background-networking',
		'--disable-default-apps',
		'--disable-extensions',
		'--disable-gpu',
		'--disable-sync',
		'--disable-translate',
		'--hide-scrollbars',
		'--metrics-recording-only',
		'--mute-audio',
		'--no-first-run',
		'--safebrowsing-disable-auto-update',
		'--js-flags=--noexpose_wasm,--jitless' // yoinking from strellic :sice:
	]
};

const testUI = async (path, keyword) => {
    return new Promise(async (resolve, reject) => {
        const browser = await puppeteer.launch(browser_options);
        let context = await browser.createIncognitoBrowserContext();
        let page = await context.newPage();
        try {
            await page.goto(`http://127.0.0.1:1337/${path}`, {
                waitUntil: 'networkidle2'
            });

            await page.waitForTimeout(8000);
            
            await page.evaluate((keyword) => {
                return document.querySelector('body').innerText.includes(keyword)
            }, keyword)
                .then(isMatch => resolve(isMatch));
        } catch(e) {
            reject(false);
        }
        await browser.close();
    });
};

module.exports = { testUI };