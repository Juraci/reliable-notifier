const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const Client = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_FROM_NUMBER;
const toNumber = process.env.TO_NUMBER;
const rootURL = process.env.ROOTURL;
const subResource = process.env.SUBRESOURCE;
const queryString = process.env.QUERY;
const url = `${rootURL}${subResource}${queryString}`;
const selector = process.env.SELECTOR;
const priceSelector = process.env.PRICESELECTOR;
const linkSelector = process.env.LINKSELECTOR;
const interval = process.env.INTERVAL || 60000;
let executionCount = 0;

const client = Client(accountSid, authToken);
const notifiable = [];

const variablesCheck = () => {
  console.log(`--------------------------------------\n`);
  console.log(`---- from number:    ${fromNumber}`);
  console.log(`---- to number:      ${toNumber}`);
  console.log(`---- root url:       ${rootURL}`);
  console.log(`---- sub resource:   ${subResource}`);
  console.log(`---- query string:   ${queryString}`);
  console.log(`---- complete url:   ${url}`);
  console.log(`---- selector:       ${selector}`);
  console.log(`---- price selector: ${priceSelector}`);
  console.log(`---- link selector:  ${linkSelector}`);
  console.log(`---- interval:       ${interval}`);
  console.log(`\n--------------------------------------`);
};

const available = (i, el) => {
  const button = cheerio(el).find('[alt="botao comprar"]');
  if (button == []) return false;
  return !cheerio(button[0]).attr('src').includes('comprar_off');
};

const findSentNotification = (items, link) => items.find(item => item.link === link);
const alreadyNotified = item => !item.notified;

const sendTwilioMsg = async (notification) => {
  const message = {
    body: `${notification.name} \n ${notification.link}`,
    from: fromNumber,
    to: toNumber,
  };

  const response = await client.messages.create(message);
  console.log(`> Twilio API response: ${response.status}`);
  notification.notified = response.status === 'sent' || response.status === 'queued';
};

const notify = (i, el) => {
  const result = {
    name: cheerio(el).find(linkSelector).text(),
    price: cheerio(el).find(priceSelector).text(),
    link: `${rootURL}${cheerio(el).find(linkSelector).attr('href')}`,
    notified: false,
  };
  console.log(result);

  let item = findSentNotification(notifiable, result.link);
  if (!item) notifiable.push(result);

  console.log(`> Notifiable items: ${notifiable.filter(alreadyNotified).length}`);
  notifiable
    .filter(alreadyNotified)
    .map(sendTwilioMsg);
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
sendTwilioMsg({ name: "Initialized test", link: "" });
setInterval(checkPage, interval);
