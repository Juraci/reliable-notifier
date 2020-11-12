const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const rootURL = process.env.ROOTURL;
const subResource = process.env.SUBRESOURCE;
const queryString = process.env.QUERY;
const url = `${rootURL}${subResource}${queryString}`;
const selector = process.env.SELECTOR;
const priceSelector = process.env.PRICESELECTOR;
const linkSelector = process.env.LINKSELECTOR;
const interval = process.env.INTERVAL || 60000;
let executionCount = 0;

const variablesCheck = () => {
  console.log(`---- root url:       ${rootURL}`);
  console.log(`---- sub resource:   ${subResource}`);
  console.log(`---- query string:   ${queryString}`);
  console.log(`---- complete url:   ${url}`);
  console.log(`---- selector:       ${selector}`);
  console.log(`---- price selector: ${priceSelector}`);
  console.log(`---- link selector:  ${linkSelector}`);
  console.log(`---- interval:       ${interval}`);
};

const available = (i, el) => {
  const button = cheerio(el).find('[alt="botao comprar"]');
  if (button == []) { return false };
  return !cheerio(button[0]).attr('src').includes('comprar_off');
};

const notify = (i, el) => {
  const result = {
    name: cheerio(el).find(linkSelector).text(),
    price: cheerio(el).find(priceSelector).text(),
    link: `${rootURL}${cheerio(el).find(linkSelector).attr('href')}`,
  };

  console.log(result);
};

const checkPage = async () => {
  executionCount++;
  console.log(`>>>  execution count ${executionCount}`);
  const browser = await puppeteer.launch();
  try {
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector(selector);

    const content = await page.content();
    const $ = cheerio.load(content);

    console.log(`> potential items discovered: ${$(selector).length}`);
    $(selector)
      .filter(available)
      .map(notify);

  } catch (err) {
    console.error(`execution error: \n ${err}`);
  } finally {
    await browser.close();
  }
}

variablesCheck();
setInterval(checkPage, interval);
