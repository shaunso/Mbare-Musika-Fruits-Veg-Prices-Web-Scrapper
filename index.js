// load the 'Puppeteer' and 'File Server' modules
const puppeteer = require('puppeteer');
const fs = require('fs');

// set the URL to the web page that will be scraped
const url = 'https://zimpricecheck.com/price-updates/fruit-and-vegetable-prices/';

// retrieving the current date to create a string to use when appending the CSV file and naming the JSON file
function theDate() {
  const today = new Date();
  const year = today.getFullYear().toString();
  const month = ( today.getMonth() + 1 ).toString();
  const day = today.getDate().toString();
  // the date will be in the YYYY-MM-DD format
  return year.concat("-", month, "-", day);
}

// getData set to IIFE
const getData = async () => {
  // launch Puppeteer
  const browser = await puppeteer.launch();
  // Puppeteer opens a new page 
  const page = await browser.newPage();
  // set the viewport of the page
  // await page.setViewport({
  //   width: 1680,
  //   height: 1080,
  // })
  // request the web page
  await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 240000,
  })
  // take a screenshot of the page
  await page.screenshot({
    path:  `./screenshot/${theDate()}.png`,
    fullPage: true,
  })
  // retrieve htmk data of requested page
  const result = await page.evaluate( () => {
    // select the element with the date on the page
    const dateData = document.querySelector('h4.fusion-responsive-typography-calculated:nth-child(5)');
    // select all rows from the table on the page
    const data = document.querySelectorAll('.wp-block-table > table:nth-child(1) > tbody:nth-child(2) tr');

    // set the date
    const currentDate = dateData.innerText.split(" ").slice(-3).join("-");
    // return the data from the each table row in an array of objects
    return Array.from(data).map( (el) => {
      const item = el.querySelector('td:nth-child(1)').innerText;
      const quantity = el.querySelector('td:nth-child(2)').innerText;
      const usd_price = el.querySelector('td:nth-child(3)').innerText;
      const zig_price = el.querySelector('td:nth-child(4)').innerText;

      return { 
        currentDate,
        item,
        quantity,
        usd_price,
        zig_price
      }
    })
  })

  // stop running Puppeteer
  await browser.close()
  // return the result of calling the function
  return result
}

getData().then ( value => {
  console.log(value);
  console.log('Data scrapped...');

  // save the scrapped data as to a JSON file
  fs.writeFile(`./json/mbare_musika_prices_${theDate()}.json`, JSON.stringify(value), err => {
    if (err) throw err;
    console.log(`Data for ${theDate()} successfully saved to JSON...`)
  })

});
