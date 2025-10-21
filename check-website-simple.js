const https = require('https');

console.log('🔍 Checking GitHub Pages website...\n');
console.log('URL: https://cyohn55.github.io/intent-identifier/\n');

https.get('https://cyohn55.github.io/intent-identifier/', (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('✅ Page loaded successfully\n');
    console.log('Status Code:', res.statusCode);
    console.log('Content-Type:', res.headers['content-type']);
    console.log('\n📊 Analyzing page structure...\n');

    // Check for key elements
    const checks = {
      'HTML Structure': data.includes('<!DOCTYPE html>'),
      'Page Title': data.includes('Intent Identifier - Chat Interface'),
      'Stylesheet': data.includes('styles.css'),
      'Config Script': data.includes('config.js'),
      'Main App Script': data.includes('app.js'),
      'Chat Panel': data.includes('chat-panel'),
      'Intent Panel': data.includes('intent-panel'),
      'Message Input': data.includes('id="messageInput"'),
      'Send Button': data.includes('id="sendMessage"'),
      'Intent Display': data.includes('id="intentDisplay"'),
      'Status Bar': data.includes('status-bar'),
      'Clear Chat Button': data.includes('id="clearChat"')
    };

    let allPassed = true;
    for (const [check, passed] of Object.entries(checks)) {
      const icon = passed ? '✅' : '❌';
      console.log(`${icon} ${check}: ${passed ? 'Found' : 'NOT FOUND'}`);
      if (!passed) allPassed = false;
    }

    console.log('\n' + '='.repeat(60));
    if (allPassed) {
      console.log('🎉 All checks passed! The dual chat interface is present.');
    } else {
      console.log('⚠️  Some elements are missing from the page.');
    }
    console.log('='.repeat(60));

    // Show a snippet of the page
    console.log('\n📝 HTML Preview (first 500 chars):');
    console.log('-'.repeat(60));
    console.log(data.substring(0, 500));
    console.log('-'.repeat(60));

    // Check if config.js and other resources are accessible
    console.log('\n🔗 Checking additional resources...');
    checkResource('https://cyohn55.github.io/intent-identifier/config.js');
    checkResource('https://cyohn55.github.io/intent-identifier/styles.css');
    checkResource('https://cyohn55.github.io/intent-identifier/app.js');
  });
}).on('error', (err) => {
  console.error('❌ Error loading page:', err.message);
});

function checkResource(url) {
  https.get(url, (res) => {
    const icon = res.statusCode === 200 ? '✅' : '❌';
    console.log(`${icon} ${url.split('/').pop()}: Status ${res.statusCode}`);
  }).on('error', (err) => {
    console.log(`❌ ${url.split('/').pop()}: ${err.message}`);
  });
}
