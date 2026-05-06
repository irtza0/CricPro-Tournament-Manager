import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Login first
  await page.goto('http://localhost:5173/login');
  await page.fill('input[type="email"]', 'admin@cricket.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  await page.waitForURL('http://localhost:5173/');

  // Go to players
  await page.goto('http://localhost:5173/players');
  
  // Wait for players to load
  await page.waitForSelector('.glass-card h3');
  
  // Find first player card and hover
  const firstPlayerCard = page.locator('.glass-card').first();
  await firstPlayerCard.hover();
  
  // Click edit button
  const editBtn = firstPlayerCard.locator('button[title="Edit"]');
  await editBtn.click();
  
  // Wait for modal
  await page.waitForSelector('form');
  
  // Change name
  await page.fill('input[placeholder="First Name"]', 'PlaywrightTest');
  
  // Listen for toast
  page.on('response', response => {
    if (response.url().includes('/api/players/') && response.request().method() === 'PUT') {
      console.log('PUT STATUS:', response.status());
      response.text().then(text => console.log('PUT RESPONSE:', text));
    }
  });

  // Click Save
  await page.click('button[type="submit"]');
  
  // Wait for toast
  await page.waitForTimeout(1000);
  await browser.close();
})();
