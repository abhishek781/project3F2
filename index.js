const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://github.com/trending');
  const content = await page.content();
  const $ = cheerio.load(content);

  // Scrape repositories
  const repos = [];
  $('article').each((index, element) => {
    const title = $(element).find('h1 a').text().trim();
    const description = $(element).find('p[class="col-9 color-text-secondary my-1 pr-4"]').text().trim();
    const url = 'https://github.com' + $(element).find('h1 a').attr('href');
    const stars = $(element).find('a[href="' + url + '/stargazers"]').text().trim();
    const forks = $(element).find('a[href="' + url + '/network/members"]').text().trim();
    const language = $(element).find('span[itemprop="programmingLanguage"]').text().trim();
    repos.push({ title, description, url, stars, forks, language });
  });

  // Click on developers and wait for the page to load
  await page.click('a[href="/trending/developers"]');
  await page.waitForNavigation();

  // Select Javascript from the language section
  const languageSection = await page.$('#select-menu-language');
  await languageSection.click();

  
  await page.waitForTimeout(500);
  const javascriptOption = await page.$('label[for="language-JavaScript"]');
//   await javascriptOption.click();
  await page.waitForTimeout(1000);

  // Scrape developers
  const developers = [];
  $('li.col-12').each((index, element) => {
    const name = $(element).find('h2').text().trim();
    const username = $(element).find('h2 a').attr('href').substring(1);
    const repoName = $(element).find('h3').text().trim();
    const repoDescription = $(element).find('p[class="col-9 color-text-secondary my-1 pr-4"]').text().trim();
    developers.push({ name, username, repoName, repoDescription });
  });

  // Save data to a JSON file
  const data = { repos, developers };
  fs.writeFileSync('data.json', JSON.stringify(data));

  console.log('Data saved to data.json');
  await browser.close();
})();
