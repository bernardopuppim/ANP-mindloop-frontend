// Test script to verify frontend-backend integration
// This simulates what the frontend does when calling the backend

const https = require('https');

async function testBackendAPI() {
  console.log('Testing MindLoop Backend API Integration\n');
  console.log('='.repeat(60));

  const testEvent = 'Manutenção preventiva realizada';
  console.log(`\nTest Event: "${testEvent}"\n`);

  // The data that should be sent from frontend
  const postData = JSON.stringify({
    event_description: testEvent
  });

  console.log('Sending POST request to backend...');
  console.log('URL: https://mindloop-backend.vercel.app/classify');
  console.log('Method: POST');
  console.log('Headers: Content-Type: application/json');
  console.log('Body:', postData);
  console.log('');

  const options = {
    hostname: 'mindloop-backend.vercel.app',
    path: '/classify',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
      'Accept': 'application/json',
      'Origin': 'https://mindloop-frontend.vercel.app',
      'Referer': 'https://mindloop-frontend.vercel.app/'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      console.log(`Response Status: ${res.statusCode} ${res.statusMessage}`);
      console.log('Response Headers:');
      Object.keys(res.headers).forEach(key => {
        console.log(`  ${key}: ${res.headers[key]}`);
      });
      console.log('');

      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Response Body:');
        console.log(data);
        console.log('');

        try {
          const jsonResponse = JSON.parse(data);
          console.log('Parsed JSON Response:');
          console.log(JSON.stringify(jsonResponse, null, 2));
          console.log('');

          if (res.statusCode === 200) {
            console.log('✓ SUCCESS: Backend API is working correctly');
            console.log('');
            console.log('Classification Result:');
            console.log(`  Event Class: ${jsonResponse.event_class || 'N/A'}`);
            console.log(`  Confidence: ${jsonResponse.confidence ? (jsonResponse.confidence * 100).toFixed(2) + '%' : 'N/A'}`);

            if (jsonResponse.all_predictions) {
              console.log('\n  All Predictions:');
              jsonResponse.all_predictions.forEach(pred => {
                console.log(`    - ${pred.class}: ${(pred.probability * 100).toFixed(2)}%`);
              });
            }
          } else {
            console.log('✗ ERROR: Backend returned non-200 status');
          }

          resolve(jsonResponse);
        } catch (e) {
          console.log('✗ ERROR: Failed to parse JSON response');
          console.log(e.message);
          resolve(data);
        }
      });
    });

    req.on('error', (e) => {
      console.log('✗ NETWORK ERROR:');
      console.log(e.message);
      reject(e);
    });

    req.write(postData);
    req.end();
  });
}

async function testFrontendPage() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Frontend Page Availability\n');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'mindloop-frontend.vercel.app',
      path: '/',
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'Mozilla/5.0 (compatible; TestScript/1.0)'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`Frontend Status: ${res.statusCode} ${res.statusMessage}`);

      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✓ Frontend page is accessible');

          // Check for key elements in the HTML
          const hasTextarea = data.includes('<textarea') || data.includes('textarea');
          const hasButton = data.includes('Classificar') || data.includes('button');
          const hasTitle = data.includes('MindLoop') || data.includes('Classificação');

          console.log('\nPage Content Analysis:');
          console.log(`  Has textarea element: ${hasTextarea ? '✓' : '✗'}`);
          console.log(`  Has classification button: ${hasButton ? '✓' : '✗'}`);
          console.log(`  Has relevant title: ${hasTitle ? '✓' : '✗'}`);

          if (data.includes('mindloop-backend.vercel.app')) {
            console.log('  Backend URL found in page: ✓');
          } else {
            console.log('  Backend URL found in page: ✗ (might be in JS bundle)');
          }

        } else {
          console.log('✗ Frontend page returned non-200 status');
        }

        resolve(data);
      });
    });

    req.on('error', (e) => {
      console.log('✗ NETWORK ERROR accessing frontend:');
      console.log(e.message);
      reject(e);
    });

    req.end();
  });
}

async function checkCORS() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing CORS Configuration\n');

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'mindloop-backend.vercel.app',
      path: '/classify',
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://mindloop-frontend.vercel.app',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type'
      }
    };

    const req = https.request(options, (res) => {
      console.log(`CORS Preflight Status: ${res.statusCode}`);
      console.log('\nCORS Headers:');

      const corsHeaders = {
        'Access-Control-Allow-Origin': res.headers['access-control-allow-origin'],
        'Access-Control-Allow-Methods': res.headers['access-control-allow-methods'],
        'Access-Control-Allow-Headers': res.headers['access-control-allow-headers'],
        'Access-Control-Allow-Credentials': res.headers['access-control-allow-credentials']
      };

      Object.keys(corsHeaders).forEach(key => {
        const value = corsHeaders[key];
        console.log(`  ${key}: ${value || 'NOT SET'}`);
      });

      const allowsOrigin = corsHeaders['Access-Control-Allow-Origin'] === '*' ||
                          corsHeaders['Access-Control-Allow-Origin'] === 'https://mindloop-frontend.vercel.app';

      console.log('');
      if (allowsOrigin) {
        console.log('✓ CORS is properly configured for frontend');
      } else {
        console.log('✗ CORS might not be properly configured');
        console.log('  Frontend may not be able to call backend due to CORS restrictions');
      }

      resolve(corsHeaders);
    });

    req.on('error', (e) => {
      console.log('✗ CORS check failed:');
      console.log(e.message);
      reject(e);
    });

    req.end();
  });
}

// Run all tests
(async () => {
  try {
    await testFrontendPage();
    await checkCORS();
    await testBackendAPI();

    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));
    console.log('\nIf all tests passed:');
    console.log('  ✓ Backend API is working correctly');
    console.log('  ✓ Frontend page is accessible');
    console.log('  ✓ CORS is configured (if shown above)');
    console.log('\nThe frontend SHOULD be able to communicate with the backend.');
    console.log('\nIf you\'re experiencing issues, check:');
    console.log('  1. Browser console for JavaScript errors');
    console.log('  2. Network tab for failed requests');
    console.log('  3. CORS errors in browser console');
    console.log('');

  } catch (error) {
    console.error('\nTest suite failed:', error.message);
  }
})();
