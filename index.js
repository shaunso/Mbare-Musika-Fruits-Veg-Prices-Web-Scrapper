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

// an array storing the paths to each CSV file
// [0] = quantity.csv
const itemUnits = './quantity.csv' ;
// [1] = usd_price.csv
const itemUSD = './usd_price.csv' ;
// [2] = zig_price.csv
const itemZiG = './zig_price.csv' ;

const fileLocation = [itemUnits, itemUSD, itemZiG];

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

  for ( let d = 0; d < fileLocation.length; d++ ) {
    // append the date to the first column of the CSV file
    fs.appendFile(fileLocation[d], value[0].currentDate, err => {
      if (err) throw err;
      console.log(value[0].currentDate);
    });       
  }

    // append the scrapped data in 'value' to a CSV file
  // for ( let i = 0; i < el.length; i++) {
  //   fs.appendFile('./vfex_market_activity/vfex_market_activity.csv', newLine(), err => {
  //     if (err) throw err;
  //     console.log(`${el[i].activity} saved to CSV`);
  //   });
  //   // function adds a newline character to the last array element appended to the CSV file
  //   function newLine() {
  //     if ( i === el.length - 1 ) {
  //       return `,${el[i].value.toString().replace("USD$ ","").replaceAll(",","")}\n`
  //     } else return `,${el[i].value.toString().replace("USD$ ","").replaceAll(",","")}`
  //   }
  // }

    
});
