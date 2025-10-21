const { chromium } = require('playwright');

(async () => {
  console.log('🚀 Launching browser...');
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('📡 Navigating to GitHub Pages...');
    await page.goto('https://cyohn55.github.io/intent-identifier/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    console.log('✅ Page loaded successfully');

    // Take screenshot
    await page.screenshot({ path: 'github-pages-screenshot.png', fullPage: true });
    console.log('📸 Screenshot saved: github-pages-screenshot.png');

    // Check page title
    const title = await page.title();
    console.log('📄 Page Title:', title);

    // Check if dual panels exist
    const chatPanel = await page.locator('.chat-panel').count();
    const intentPanel = await page.locator('.intent-panel').count();
    console.log('💬 Chat Panel:', chatPanel > 0 ? '✅ Found' : '❌ Not Found');
    console.log('🎯 Intent Panel:', intentPanel > 0 ? '✅ Found' : '❌ Not Found');

    // Check if key elements exist
    const messageInput = await page.locator('#messageInput').count();
    const sendBtn = await page.locator('#sendMessage').count();
    const intentDisplay = await page.locator('#intentDisplay').count();
    console.log('✍️  Message Input:', messageInput > 0 ? '✅ Found' : '❌ Not Found');
    console.log('📤 Send Button:', sendBtn > 0 ? '✅ Found' : '❌ Not Found');
    console.log('📊 Intent Display:', intentDisplay > 0 ? '✅ Found' : '❌ Not Found');

    // Check status indicator
    const statusText = await page.locator('#statusText').textContent();
    console.log('🔌 Connection Status:', statusText);

    // Check for any console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a moment for any console errors
    await page.waitForTimeout(3000);

    if (errors.length > 0) {
      console.log('\n❌ Console Errors Found:');
      errors.forEach(err => console.log('  -', err));
    } else {
      console.log('\n✅ No console errors detected');
    }

    // Keep browser open for 10 seconds so user can see it
    console.log('\n⏳ Keeping browser open for 10 seconds...');
    await page.waitForTimeout(10000);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
    console.log('🏁 Browser closed');
  }
})();
