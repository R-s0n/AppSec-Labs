const puppeteer = require("puppeteer");

const FLAG = process.env.FLAG || "HTB{f4k3_fl4g_f0r_t3st1ng}";

const visit = async (url) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            pipe: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--js-flags=--noexpose_wasm,--jitless",
            ],
            dumpio: true
        });

        let page = await browser.newPage();

        await page.goto("http://localhost", {
            waitUntil: "networkidle2"
        });
        await page.evaluate((flag) => {
            localStorage.saved = JSON.stringify({ "Default": { "flag": flag } });
        }, FLAG);
        await page.waitForTimeout(1000);

        await page.goto(url, {
            waitUntil: "networkidle2"
        });
        await page.waitForTimeout(7000);

        await browser.close();
        browser = null;
    } catch (err) {
        console.log(err);
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = { visit };
