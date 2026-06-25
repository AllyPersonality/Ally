import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('Starting browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Set viewport to 1200x630 (Facebook Open Graph size)
  await page.setViewport({
    width: 1200,
    height: 630,
    deviceScaleFactor: 1
  });

  // Read the HTML file
  const htmlPath = path.join(__dirname, 'ally-football-post-3.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  console.log('Loading HTML content...');
  await page.setContent(htmlContent, {
    waitUntil: ['load', 'networkidle0']
  });

  // Wait a bit for any animations/fonts to load
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Taking screenshot...');
  await page.screenshot({
    path: path.join(__dirname, 'public', 'preview.jpg'),
    type: 'jpeg',
    quality: 90,
    clip: {
      x: 0,
      y: 0,
      width: 1200,
      height: 630
    }
  });

  console.log('✅ Image saved to public/preview.jpg');

  await browser.close();
  process.exit(0);
})();
