'use strict';

const puppeteer = require('puppeteer');
const utils = require('../utils');

/**
 * Navigates to the passed URL and generates a Uint8Array buffer for PDF file of the site.
 * @return (Uint8Array)
 * @param url (string)
 * @param isLandscape (boolean)
 */
module.exports.generatePDF = async function generatePDF(url, name, isLandscape) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--font-render-hinting=none'
    ] });
    const page = await browser.newPage();

    await page.goto(url, {timeout: 600000, waitUntil: 'networkidle0'});

    const date = utils.getCurrentDate();

    const cssb = [];
    cssb.push('<style>');
    cssb.push(`div {
      font-family: 'Arial' !important;
      font-size: 8px !important;
      font-weight: 600 !important;
      color: black !important;
      display: flex;
      justify-content: space-between;}`);
    cssb.push(`span {
        font-family: 'Arial' !important;
        font-size: 8px !important;
        font-weight: 600 !important;
        color: black !important;}`);
    cssb.push('</style>');
    const css = cssb.join('');

    const options = isLandscape
    ? { format: 'A4'
        , printBackground: true, landscape: true
        , margin: { top: "0", right: "0", bottom: "0", left: "0" } }
    : { format: 'A4',
        displayHeaderFooter: true,
        headerTemplate: css + `
        <div style="width: 100% !important; padding: 0 20px;">
          <div style="color: black !important;">${date}</div>
          <div style="color: black !important; font-size:10px !important;">${name}</div>
          <div style="opacity: 0;">${date}</div>
        </div>`,
        footerTemplate: `
        <div style="width: 100% !important; padding: 0 20px;">
          <div class=""><a href="https://www.negotiations.com/training/role-play/">negotiations.com</a></div>
          <div>
            <span class="pageNumber"></span>/
            <span class="totalPages"></span>
          </div>
        </div>`,
        margin: {
          top: '100px',
          bottom: '80px',
          right: '30px',
          left: '30px',
        }
      };

    const pdf = await page.pdf(options);

    await browser.close();
    return pdf;
};

